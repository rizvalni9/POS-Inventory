const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { loginRateLimiter } = require('../middlewares/rateLimiter');

// Public endpoints
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected endpoints
router.get('/me', authenticateToken, authController.getMe);
router.patch('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
