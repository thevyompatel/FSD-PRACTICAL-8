const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((error) => error.msg)
        });
    }
    next();
};

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const email = req.body.email.toLowerCase();
            const password = req.body.password;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const defaultName = email.split('@')[0] || 'user';

            const user = new User({
                email,
                password: hashedPassword,
                name: req.body.name || defaultName
            });

            await user.save();

            return res.status(201).json({
                success: true,
                message: 'User Registered'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const email = req.body.email.toLowerCase();
            const password = req.body.password;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Wrong password'
                });
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'mysecretkey',
                { expiresIn: '1d' }
            );

            return res.json({
                success: true,
                token
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;
