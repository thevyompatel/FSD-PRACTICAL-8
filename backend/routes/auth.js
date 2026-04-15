const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { validateUser, validateLogin } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { registerUser, loginUser, currentUser } = require('../controllers/authController');

router.post('/register', validateUser, asyncHandler(registerUser));
router.post('/login', validateLogin, asyncHandler(loginUser));
router.get('/me', auth, asyncHandler(currentUser));

module.exports = router;