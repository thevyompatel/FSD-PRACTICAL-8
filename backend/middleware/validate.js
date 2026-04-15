// Validation middleware for requests
const mongoose = require('mongoose');

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return NaN;
    }

    return typeof value === 'number' ? value : Number(value);
};

const validateProduct = (req, res, next) => {
    const { name, price, category, stock } = req.body;
    const errors = [];
    const parsedPrice = toNumber(price);
    const parsedStock = stock === undefined ? undefined : toNumber(stock);

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Product name is required and must be a non-empty string');
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        errors.push('Price is required and must be a positive number');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Category is required and must be a non-empty string');
    }

    if (stock !== undefined && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
        errors.push('Stock must be a non-negative number');
    }

    if (req.body.badge !== undefined && typeof req.body.badge !== 'string') {
        errors.push('Badge must be a string when provided');
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

const validateProductUpdate = (req, res, next) => {
    const { name, price, category, stock, badge, image } = req.body;
    const errors = [];
    let hasUpdateField = false;

    if (name !== undefined) {
        hasUpdateField = true;
        if (typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Product name must be a non-empty string');
        }
    }

    if (price !== undefined) {
        hasUpdateField = true;
        const parsedPrice = toNumber(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            errors.push('Price must be a positive number');
        }
    }

    if (category !== undefined) {
        hasUpdateField = true;
        if (typeof category !== 'string' || category.trim().length === 0) {
            errors.push('Category must be a non-empty string');
        }
    }

    if (stock !== undefined) {
        hasUpdateField = true;
        const parsedStock = toNumber(stock);
        if (!Number.isFinite(parsedStock) || parsedStock < 0) {
            errors.push('Stock must be a non-negative number');
        }
    }

    if (badge !== undefined) {
        hasUpdateField = true;
        if (typeof badge !== 'string') {
            errors.push('Badge must be a string when provided');
        }
    }

    if (image !== undefined) {
        hasUpdateField = true;
        if (typeof image !== 'string') {
            errors.push('Image must be a string when provided');
        }
    }

    if (!hasUpdateField) {
        errors.push('At least one product field is required for update');
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
    const parsedTotal = toNumber(total);

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
            const parsedQuantity = toNumber(item.quantity);
            if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
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

    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
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

const validatePayment = (req, res, next) => {
    const amount = toNumber(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount is required and must be a positive number'
        });
    }

    next();
};

module.exports = {
    validateProduct,
    validateProductUpdate,
    validateUser,
    validateLogin,
    validateCartItem,
    validateOrder,
    validateId,
    validatePayment
};
