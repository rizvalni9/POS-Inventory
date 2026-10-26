const express = require('express');
const router = express.Router();
const businessProfileController = require('../controllers/businessProfileController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// All profile endpoints require authentication
router.use(authenticateToken);

// Cashier & Owner can read profile for receipt headers
router.get('/', businessProfileController.getProfile);

// Only Owner can update business profile
router.put('/', authorizeRoles('owner'), businessProfileController.updateProfile);

module.exports = router;
