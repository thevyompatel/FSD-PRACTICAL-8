const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const signToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'mysecretkey',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const buildUserResponse = (user) => {
    const userData = user.toObject ? user.toObject() : { ...user };
    userData.id = userData._id.toString();
    delete userData._id;
    delete userData.__v;
    delete userData.password;
    return userData;
};

const registerUser = async (req, res, next) => {
    try {
        const { email, password, name, phone = '', address = '', city = '', zipCode = '' } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            name: String(name).trim(),
            phone,
            address,
            city,
            zipCode
        });

        const token = signToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            data: buildUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = signToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            data: buildUserResponse(user)
        });
    } catch (error) {
        next(error);
    }
};

const currentUser = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        data: buildUserResponse(user)
    });
};

module.exports = {
    registerUser,
    loginUser,
    currentUser
};