const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
        req.user = verified;
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = authMiddleware;
