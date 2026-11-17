const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Seluruh endpoint biaya operasional hanya dapat diakses oleh Owner toko
router.use(authenticateToken, authorizeRoles('owner'));

router.get('/categories', expenseController.getCategories);
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
