const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const { validateId } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const upload = multer({ storage });

// GET /api/products - Get all products
router.get('/', asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, search } = req.query;
    const filters = {};

    if (category) {
        filters.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
        filters.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const products = await Product.find(filters);

    res.json({
        success: true,
        count: products.length,
        data: products
    });
}));

// GET /api/products/:id - Get single product
router.get('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    res.json({
        success: true,
        data: product
    });
}));

// POST /api/products - Add new product
router.post('/', auth, upload.single('image'), asyncHandler(async (req, res) => {
    const name = req.body.name;
    const price = Number(req.body.price);

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('Product name is required', 400);
    }

    if (!Number.isFinite(price) || price <= 0) {
        throw new AppError('Price must be a positive number', 400);
    }

    const newProduct = await Product.create({
        name: name.trim(),
        price,
        category: req.body.category || 'general',
        description: req.body.description || '',
        stock: Number(req.body.stock || 0),
        badge: req.body.badge || null,
        image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
}));

// PUT /api/products/:id - Update product
router.put('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        throw new AppError('Product not found', 404);
    }

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
    });
}));

// DELETE /api/products/:id - Delete product
router.delete('/:id', validateId('id'), asyncHandler(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (deleted === null) {
        throw new AppError('Product not found', 404);
    }

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
}));

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', asyncHandler(async (req, res) => {
    const products = await Product.find({
        category: { $regex: `^${req.params.category}$`, $options: 'i' }
    });

    res.json({
        success: true,
        count: products.length,
        data: products
    });
}));

module.exports = router;
