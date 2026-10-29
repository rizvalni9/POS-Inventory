// ==============================================================================
// FILE: middlewares/auth.js
// DESKRIPSI: Middleware keamanan untuk:
// 1. Memeriksa apakah pengguna sudah login dengan membawa token JWT yang sah (authenticateToken).
// 2. Memeriksa apakah pengguna memiliki hak akses (role) yang diizinkan (authorizeRoles).
// ==============================================================================

const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware: authenticateToken
 * Fungsi ini bertugas memeriksa token pada setiap request yang butuh login.
 */
async function authenticateToken(req, res, next) {
  try {
    // LANGKAH 1: Ambil data header 'Authorization' yang dikirim oleh frontend
    const authHeader = req.headers['authorization'];
    
    // Format standar token adalah: "Bearer <token_panjang_disini>"
    // Kita ambil bagian string token-nya saja setelah kata "Bearer "
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Jika tidak ada token yang dilampirkan, tolak akses seketika
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login kembali.'
      });
    }

    // LANGKAH 2: Verifikasi keaslian token JWT menggunakan secret key kita
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtErr) {
      // Jika token sudah lewat dari 15 menit, kirim kode khusus TOKEN_EXPIRED
      // agar frontend Axios tahu harus meminta token baru secara otomatis (silent refresh)
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Sesi akses Anda telah kedaluwarsa. Silakan perbarui sesi.'
        });
      }
      
      // Jika token dirusak atau diubah sembarangan
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Token autentikasi tidak valid atau telah dimanipulasi.'
      });
    }

    // LANGKAH 3: Cek ke database MySQL untuk memastikan user masih ada dan aktif
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan dalam sistem.'
      });
    }

    // Jika akun pengguna telah dinonaktifkan oleh pemilik toko
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi pemilik toko.'
      });
    }

    // LANGKAH 4: Simpan data user ke dalam objek req.user
    // Dengan ini, controller berikutnya bisa tahu siapa yang sedang login (req.user.id, req.user.role)
    req.user = user;

    // Lanjutkan request ke controller berikutnya
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memverifikasi sesi autentikasi.'
    });
  }
}

/**
 * Middleware: authorizeRoles
 * Memeriksa apakah role pengguna (misal: 'owner' atau 'cashier') boleh mengakses halaman/API ini.
 * Contoh pemakaian: authorizeRoles('owner') -> hanya owner yang boleh lewat.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // Pastikan user sudah lewat dari authenticateToken dulu
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan sebelum mengakses rute ini.'
      });
    }

    // Cek apakah peran user ada di dalam daftar yang diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Peran '${req.user.role}' tidak memiliki hak akses untuk tindakan ini.`
      });
    }

    // Jika diizinkan, lanjut ke fungsi selanjutnya
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
