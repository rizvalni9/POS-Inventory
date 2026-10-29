// ==============================================================================
// FILE: controllers/authController.js
// DESKRIPSI: Pengendali autentikasi pengguna (Login, Refresh Token, Logout,
// Cek Profil Saya, dan Ganti Password).
// Menggunakan Access Token (15 menit) + Refresh Token (7 hari di HttpOnly Cookie).
// ==============================================================================

const { User, UserSession } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_EXPIRES_IN_DAYS
} = require('../utils/jwt');

/**
 * Controller: login
 * POST /api/auth/login
 * Memverifikasi username dan password, membuat sesi login dan memberikan token.
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // LANGKAH 1: Validasi apakah form diisi lengkap
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    // Batasan keamanan standar Bcrypt (maksimal 72 byte)
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: 'Panjang password melebihi batas maksimal keamanan (72 byte).'
      });
    }

    const normalizedUsername = String(username).trim();

    // LANGKAH 2: Cari user di database berdasarkan username
    const user = await User.findOne({
      where: { username: normalizedUsername }
    });

    // Jika user tidak ditemukan di database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password yang Anda masukkan salah.'
      });
    }

    // LANGKAH 3: Cek status keaktifan akun user
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi pemilik toko.'
      });
    }

    // LANGKAH 4: Bandingkan password yang diketik dengan hash Bcrypt di database
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password yang Anda masukkan salah.'
      });
    }

    // LANGKAH 5: Buat Access Token (berlaku 15 menit)
    const accessToken = generateAccessToken(user);

    // Hitung tanggal kedaluwarsa refresh token (7 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_IN_DAYS);

    // Buat data sesi di tabel user_sessions
    const session = await UserSession.create({
      user_id: user.id,
      refresh_token_hash: 'INITIALIZING',
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] ? String(req.headers['user-agent']).substring(0, 255) : null,
      expires_at: expiresAt
    });

    // Buat Refresh Token panjang yang terikat dengan ID sesi di database
    const refreshToken = generateRefreshToken(user, session.id);

    // Simpan hash refresh token ke sesi database
    await session.update({
      refresh_token_hash: hashToken(refreshToken)
    });

    // LANGKAH 6: Pasang cookie HttpOnly untuk Refresh Token di browser pengguna
    // Cookie HttpOnly tidak bisa dibaca oleh JavaScript jahat (kebal XSS)
    setRefreshTokenCookie(res, refreshToken);

    // LANGKAH 7: Kembalikan Access Token dan data profil ke frontend
    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token: accessToken,
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: refreshToken
 * POST /api/auth/refresh
 * Menukar refresh token lama dengan access token baru dan refresh token baru (Token Rotation).
 */
async function refreshToken(req, res, next) {
  try {
    // Ambil cookie refresh token dari browser
    const clientRefreshToken = req.cookies?.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'Sesi refresh token tidak ditemukan. Silakan login kembali.'
      });
    }

    // Verifikasi keaslian refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(clientRefreshToken);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token tidak valid atau telah kedaluwarsa. Silakan login kembali.'
      });
    }

    // Cari sesi aktif di database
    const session = await UserSession.findOne({
      where: {
        id: decoded.sessionId,
        user_id: decoded.id,
        is_revoked: false
      },
      include: [{ model: User, as: 'user' }]
    });

    // Jika sesi sudah pernah dicabut atau user dinonaktifkan
    if (!session || !session.user || !session.user.is_active) {
      if (decoded.id) {
        // Cabut seluruh sesi demi keamanan
        await UserSession.update(
          { is_revoked: true },
          { where: { user_id: decoded.id } }
        );
      }
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        code: 'SESSION_REVOKED',
        message: 'Sesi telah dicabut atau tidak valid. Silakan login kembali.'
      });
    }

    // Cek apakah hash token di cookie cocok dengan hash token di database
    const currentHash = hashToken(clientRefreshToken);
    if (session.refresh_token_hash !== currentHash) {
      // Jika tidak cocok, berarti token lama dicoba dipakai ulang (terdeteksi pencurian token)
      await session.update({ is_revoked: true });
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Terdeteksi penggunaan ganda refresh token. Sesi telah dicabut demi keamanan.'
      });
    }

    // Buat Access Token baru
    const newAccessToken = generateAccessToken(session.user);

    // Buat Refresh Token baru (Token Rotation)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_EXPIRES_IN_DAYS);

    const newRefreshToken = generateRefreshToken(session.user, session.id);
    await session.update({
      refresh_token_hash: hashToken(newRefreshToken),
      expires_at: newExpiresAt
    });

    // Pasang cookie baru di browser
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Sesi berhasil diperbarui.',
      data: {
        token: newAccessToken,
        user: session.user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: logout
 * POST /api/auth/logout
 * Menghapus cookie browser dan mencabut sesi login di database.
 */
async function logout(req, res, next) {
  try {
    const clientRefreshToken = req.cookies?.refreshToken;

    // Jika ada refresh token, ubah status sesi di database menjadi is_revoked = true
    if (clientRefreshToken) {
      try {
        const decoded = verifyRefreshToken(clientRefreshToken);
        if (decoded && decoded.sessionId) {
          await UserSession.update(
            { is_revoked: true },
            { where: { id: decoded.sessionId } }
          );
        }
      } catch (err) {
        // Abaikan error jika token sudah kedaluwarsa
      }
    }

    // Hapus cookie dari browser
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil. Sesi telah dihapus.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: getMe
 * GET /api/auth/me
 * Mengambil data profil pengguna yang saat ini sedang login.
 */
async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: changePassword
 * PATCH /api/auth/change-password
 * Mengizinkan pengguna mengubah kata sandi mereka sendiri.
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    // LANGKAH 1: Validasi kelengkapan form
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru wajib diisi.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal harus 6 karakter.'
      });
    }

    if (Buffer.byteLength(new_password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: 'Password baru melebihi batas 72 byte.'
      });
    }

    // LANGKAH 2: Cek apakah password lama yang dimasukkan benar
    const isCurrentValid = await req.user.comparePassword(current_password);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini yang Anda masukkan salah.'
      });
    }

    // Pastikan password baru tidak sama dengan password lama
    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh sama dengan password saat ini.'
      });
    }

    // LANGKAH 3: Simpan password baru (hook Sequelize akan meng-hash otomatis dengan Bcrypt)
    req.user.password_hash = new_password;
    await req.user.save();

    // LANGKAH 4: Cabut seluruh sesi aktif lama agar pengguna harus login ulang dengan password baru
    await UserSession.update(
      { is_revoked: true },
      { where: { user_id: req.user.id } }
    );

    // Hapus cookie sesi saat ini
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah. Silakan login kembali dengan password baru.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};
