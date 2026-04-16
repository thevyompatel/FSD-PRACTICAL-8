// Validation middleware for requests
const mongoose = require('mongoose');

const validateProduct = (req, res, next) => {
    const { name, price, category, stock } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Product name is required and must be a non-empty string');
    }

    if (!price || typeof price !== 'number' || price <= 0) {
        errors.push('Price is required and must be a positive number');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Category is required and must be a non-empty string');
    }

    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
        errors.push('Stock must be a non-negative number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateUser = (req, res, next) => {
    const { email, password, name } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push('Email is required');
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateCartItem = (req, res, next) => {
    const { productId, quantity } = req.body;
    const errors = [];

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        errors.push('Product ID is required and must be a valid ObjectId');
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        errors.push('Quantity is required and must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateOrder = (req, res, next) => {
    const { userId, items, shippingInfo, paymentMethod, total } = req.body;
    const errors = [];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        errors.push('User ID is required and must be a valid ObjectId');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('Items array is required and must not be empty');
    } else {
        items.forEach((item, index) => {
            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                errors.push(`Item ${index}: Product ID is required and must be a valid ObjectId`);
            }
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                errors.push(`Item ${index}: Quantity is required and must be a positive number`);
            }
        });
    }

    if (!shippingInfo || typeof shippingInfo !== 'object') {
        errors.push('Shipping information is required');
    } else {
        const { fullName, phone, email, address, city, zipCode } = shippingInfo;
        if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
            errors.push('Full name is required in shipping info');
        }
        if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
            errors.push('Phone number is required in shipping info');
        }
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            errors.push('Email is required in shipping info');
        }
        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            errors.push('Address is required in shipping info');
        }
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            errors.push('City is required in shipping info');
        }
        if (!zipCode || typeof zipCode !== 'string' || zipCode.trim().length === 0) {
            errors.push('ZIP code is required in shipping info');
        }
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
        errors.push('Payment method is required');
    } else if (!['card', 'paypal', 'cod'].includes(paymentMethod)) {
        errors.push('Payment method must be one of: card, paypal, cod');
    }

    if (!total || typeof total !== 'number' || total <= 0) {
        errors.push('Total is required and must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} parameter`
            });
        }
        next();
    };
};

module.exports = {
    validateProduct,
    validateUser,
    validateLogin,
    validateCartItem,
    validateOrder,
    validateId
};
