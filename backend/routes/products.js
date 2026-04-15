const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { validateProduct, validateProductUpdate, validateId } = require('../middleware/validate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const buildImagePath = (file) => {
    if (!file) {
        return '';
    }

    return `/uploads/${file.filename}`;
};

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
router.post('/', auth, upload.single('image'), validateProduct, asyncHandler(async (req, res) => {
    const productData = {
        ...req.body,
        price: Number(req.body.price),
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
        image: buildImagePath(req.file) || req.body.image || ''
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
}));

// PUT /api/products/:id - Update product
router.put('/:id', auth, upload.single('image'), validateId('id'), validateProductUpdate, asyncHandler(async (req, res) => {
    const updates = {
        ...req.body,
        price: req.body.price !== undefined ? Number(req.body.price) : undefined,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined
    };

    if (req.file) {
        updates.image = buildImagePath(req.file);
    }

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
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
router.delete('/:id', auth, validateId('id'), asyncHandler(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (deleted === null) {
        throw new AppError('Product not found', 404);
    }

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
}));

module.exports = router;
