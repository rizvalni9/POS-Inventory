const { BusinessProfile } = require('../models');

/**
 * Controller: Get business profile
 * GET /api/business-profile
 */
async function getProfile(req, res, next) {
  try {
    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        store_name: 'Toko Berkah OJT',
        address: 'Jl. Pemuda No. 45, Padang',
        phone: '081234567890',
        receipt_footer: 'Terima kasih atas kunjungan Anda'
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Update business profile (Owner only)
 * PUT /api/business-profile
 */
async function updateProfile(req, res, next) {
  try {
    const { store_name, address, phone, receipt_footer } = req.body;

    if (!store_name || store_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nama toko wajib diisi.'
      });
    }

    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        store_name: store_name.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        receipt_footer: receipt_footer ? receipt_footer.trim() : null
      });
    } else {
      await profile.update({
        store_name: store_name.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        receipt_footer: receipt_footer ? receipt_footer.trim() : null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profil toko berhasil diperbarui.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
