const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticateToken } = require('../middlewares/auth');

// Sales routes require authentication (Owner and Cashier)
router.use(authenticateToken);

router.post('/checkout', salesController.checkout);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);

module.exports = router;
