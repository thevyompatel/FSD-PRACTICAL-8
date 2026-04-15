const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { validateOrder, validateId } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /api/orders - Get all orders
router.get('/', asyncHandler(async (req, res) => {
    const { status, userId } = req.query;
    const filters = {};
    if (status) {
        filters.status = status.toLowerCase();
    }

    if (userId) {
        filters.userId = userId;
    }

    const orders = await Order.find(filters)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .populate('items.productId');

    res.json({
        success: true,
        count: orders.length,
        data: orders
    });
}));

// GET /api/orders/stats - Get order statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
    const [
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenueAggregation,
        categories,
        pending,
        processing,
        shipped,
        delivered,
        cancelled
    ] = await Promise.all([
        Product.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' } } }]),
        Product.distinct('category'),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'shipped' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' })
    ]);

    const totalRevenue = totalRevenueAggregation[0]?.totalRevenue || 0;

    res.json({
        success: true,
        data: {
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue,
            categories,
            orderStats: {
                total: totalOrders,
                pending,
                processing,
                shipped,
                delivered,
                cancelled
            }
        }
    });
}));

// GET /api/orders/user/:userId - Get orders by user
router.get('/user/:userId', validateId('userId'), asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.params.userId })
        .sort({ createdAt: -1 })
        .populate('items.productId');

    res.json({
        success: true,
        count: orders.length,
        data: orders
    });
}));

// GET /api/orders/:id - Get single order
router.get('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.productId');

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    res.json({
        success: true,
        data: order
    });
}));

// POST /api/orders - Create new order
router.post('/', validateOrder, asyncHandler(async (req, res) => {
    const { userId, items, shippingInfo, paymentMethod, total } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    // Verify products exist and have sufficient stock
    for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
            throw new AppError(`Product with ID ${item.productId} not found`, 404);
        }
        if (product.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for ${product.name}. Only ${product.stock} available`,
                400
            );
        }
    }

    // Calculate total and verify
    const calculatedTotal = items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - total) > 0.01) {
        throw new AppError('Order total mismatch', 400);
    }

    // Create order
    const newOrder = await Order.create({
        userId,
        items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId).price
        })),
        shippingInfo,
        paymentMethod,
        total: Number(calculatedTotal.toFixed(2))
    });

    // Update product stock
    await Promise.all(items.map(async (item) => {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true }
        );
    }));

    // Clear user's cart
    await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { upsert: true, new: true }
    );

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder
    });
}));

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', validateId('id'), asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        throw new AppError(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            400
        );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!updatedOrder) {
        throw new AppError('Order not found', 404);
    }

    res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
    });
}));

module.exports = router;
