const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// All user management routes require owner role (No public registration)
router.use(authenticateToken, authorizeRoles('owner'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id/status', userController.updateUserStatus);
router.patch('/:id/reset-password', userController.resetUserPassword);

module.exports = router;
