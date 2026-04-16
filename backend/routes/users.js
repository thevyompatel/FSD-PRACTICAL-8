const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { validateUser, validateLogin, validateId } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /api/users - Get all users
router.get('/', asyncHandler(async (req, res) => {
    const users = await User.find();

    res.json({
        success: true,
        count: users.length,
        data: users
    });
}));

// GET /api/users/:id - Get single user
router.get('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        data: user
    });
}));

// POST /api/users/register - Register new user
router.post('/register', validateUser, asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    const newUser = await User.create(req.body);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser
    });
}));

// POST /api/users/login - User login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // In production, use bcrypt.compare() for password validation
    if (user.password !== password) {
        throw new AppError('Invalid email or password', 401);
    }

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id;
    delete userObj._id;
    delete userObj.__v;

    res.json({
        success: true,
        message: 'Login successful',
        data: userObj,
        // In production, return JWT token here
        token: 'dummy-jwt-token-' + user.id
    });
}));

// PUT /api/users/:id - Update user
router.put('/:id', validateId('id'), asyncHandler(async (req, res) => {
    // Don't allow password updates through this route
    const { password, ...updates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
    });
}));

// DELETE /api/users/:id - Delete user
router.delete('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (deleted === null) {
        throw new AppError('User not found', 404);
    }

    await Cart.deleteOne({ userId: req.params.id });

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
}));

// GET /api/users/:id/orders - Get user's orders
router.get('/:id/orders', validateId('id'), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const orders = await Order.find({ userId: req.params.id })
        .sort({ createdAt: -1 })
        .populate('items.productId');

    res.json({
        success: true,
        count: orders.length,
        data: orders
    });
}));

module.exports = router;
