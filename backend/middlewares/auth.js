const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware: Verify JWT Access Token and check if account is active
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login kembali.'
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Sesi akses Anda telah kedaluwarsa. Silakan perbarui sesi.'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Token autentikasi tidak valid atau telah dimanipulasi.'
      });
    }

    // Verify user in database to ensure the account has not been deactivated or deleted
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan dalam sistem.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi pemilik toko.'
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi sesi autentikasi.'
    });
  }
}

/**
 * Middleware: Authorize specific roles (Deny-by-default RBAC)
 * @param  {...string} allowedRoles e.g. 'owner', 'cashier'
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan sebelum mengakses rute ini.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Peran '${req.user.role}' tidak memiliki hak akses untuk tindakan ini.`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
