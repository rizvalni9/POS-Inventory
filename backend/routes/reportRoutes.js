const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Reports are strictly restricted to Owner
router.use(authenticateToken, authorizeRoles('owner'));

router.get('/daily-summary', reportController.getDailySummary);

module.exports = router;
