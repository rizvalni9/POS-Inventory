const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Seluruh rute loyalty member membutuhkan autentikasi login (Owner & Cashier)
router.use(authenticateToken);

// 1. Rute bersama (Bisa diakses oleh Owner dan Cashier)
router.get('/search-quick', memberController.searchMembersQuick);
router.get('/summary/stats', memberController.getLoyaltySummary);
router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);

// 2. Rute khusus Pemilik Toko (Owner Only)
router.post('/:id/adjust-points', authorizeRoles('owner'), memberController.adjustMemberPoints);
router.patch('/:id/toggle-status', authorizeRoles('owner'), memberController.toggleMemberStatus);
router.delete('/:id', authorizeRoles('owner'), memberController.deleteMember);

module.exports = router;
