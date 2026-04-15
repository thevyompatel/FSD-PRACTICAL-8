const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const { validateCartItem, validateId } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', validateId('userId'), asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const items = cart ? cart.items : [];

    const enrichedCart = items.map(item => {
        const product = item.productId;
        const unitPrice = product ? product.price : 0;
        const total = unitPrice * item.quantity;

        return {
            productId: product ? product._id : item.productId,
            quantity: item.quantity,
            product: product || null,
            total: total.toFixed(2)
        };
    });

    const cartTotal = enrichedCart
        .reduce((sum, item) => sum + parseFloat(item.total), 0)
        .toFixed(2);

    res.json({
        success: true,
        userId,
        itemCount: enrichedCart.length,
        items: enrichedCart,
        total: cartTotal
    });
}));

// POST /api/cart/:userId - Add item to cart
router.post('/:userId', validateId('userId'), validateCartItem, asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Verify product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
        throw new AppError(`Insufficient stock. Only ${product.stock} items available`, 400);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
    );

    if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;
        if (product.stock < nextQuantity) {
            throw new AppError(`Insufficient stock. Only ${product.stock} items available`, 400);
        }
        existingItem.quantity = nextQuantity;
    } else {
        cart.items.push({ productId, quantity });
    }

    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cart
    });
}));

// PUT /api/cart/:userId/:productId - Update cart item quantity
router.put('/:userId/:productId', 
    validateId('userId'), 
    validateId('productId'), 
    asyncHandler(async (req, res) => {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
            throw new AppError('Quantity must be a non-negative number', 400);
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        if (quantity > 0 && product.stock < quantity) {
            throw new AppError(`Insufficient stock. Only ${product.stock} items available`, 400);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError('Cart item not found', 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            throw new AppError('Cart item not found', 404);
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        res.json({
            success: true,
            message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
            data: cart
        });
    })
);

// DELETE /api/cart/:userId/:productId - Remove item from cart
router.delete('/:userId/:productId',
    validateId('userId'),
    validateId('productId'),
    asyncHandler(async (req, res) => {
        const { userId, productId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new AppError('Cart item not found', 404);
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            throw new AppError('Cart item not found', 404);
        }

        await cart.save();

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    })
);

// DELETE /api/cart/:userId - Clear entire cart
router.delete('/:userId', validateId('userId'), asyncHandler(async (req, res) => {
    const { userId } = req.params;

    await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { upsert: true, new: true }
    );

    res.json({
        success: true,
        message: 'Cart cleared successfully'
    });
}));

module.exports = router;
