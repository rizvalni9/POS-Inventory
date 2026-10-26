const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Stock movement is strictly restricted to Owner
router.use(authenticateToken, authorizeRoles('owner'));

router.post('/', stockMovementController.createStockIn);
router.get('/', stockMovementController.getStockMovements);

module.exports = router;
