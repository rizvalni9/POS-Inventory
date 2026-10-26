const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

// Read catalog: Owner & Cashier
router.get('/', productController.getAllProducts);

// Modifying product master: Owner only
router.post('/', authorizeRoles('owner'), productController.createProduct);
router.put('/:id', authorizeRoles('owner'), productController.updateProduct);
router.patch('/:id/status', authorizeRoles('owner'), productController.updateProductStatus);

module.exports = router;
