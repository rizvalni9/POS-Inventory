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
 * Controller: Login user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // 1. Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    // Safeguard 72-byte bcrypt limit
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: 'Panjang password melebihi batas maksimal keamanan (72 byte).'
      });
    }

    const normalizedUsername = String(username).trim();

    // 2. Query user
    const user = await User.findOne({
      where: { username: normalizedUsername }
    });

    // 3. Generic authentication error to prevent account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password yang Anda masukkan salah.'
      });
    }

    // 4. Check account status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi pemilik toko.'
      });
    }

    // 5. Verify password hash using bcryptjs
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password yang Anda masukkan salah.'
      });
    }

    // 6. Generate access token & session
    const accessToken = generateAccessToken(user);

    // Calculate expiry date for session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_IN_DAYS);

    // Create session record in DB (temporary placeholder hash)
    const session = await UserSession.create({
      user_id: user.id,
      refresh_token_hash: 'INITIALIZING',
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] ? String(req.headers['user-agent']).substring(0, 255) : null,
      expires_at: expiresAt
    });

    // Generate refresh token tied to this session ID
    const refreshToken = generateRefreshToken(user, session.id);

    // Update session with hashed refresh token
    await session.update({
      refresh_token_hash: hashToken(refreshToken)
    });

    // 7. Set HttpOnly cookie for refresh token
    setRefreshTokenCookie(res, refreshToken);

    // 8. Return response
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
 * Controller: Refresh Access Token & Rotate Refresh Token
 * POST /api/auth/refresh
 */
async function refreshToken(req, res, next) {
  try {
    const clientRefreshToken = req.cookies?.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'Sesi refresh token tidak ditemukan. Silakan login kembali.'
      });
    }

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

    // Find active session in database
    const session = await UserSession.findOne({
      where: {
        id: decoded.sessionId,
        user_id: decoded.id,
        is_revoked: false
      },
      include: [{ model: User, as: 'user' }]
    });

    // Token reuse detection or revoked session
    if (!session || !session.user || !session.user.is_active) {
      // If someone attempted to use an invalid or revoked session, revoke all active sessions for this user as safety measure
      if (decoded.id) {
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

    // Verify token hash matches stored hash
    const currentHash = hashToken(clientRefreshToken);
    if (session.refresh_token_hash !== currentHash) {
      // Token reuse detected! Revoke session immediately
      await session.update({ is_revoked: true });
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Terdeteksi penggunaan ganda refresh token. Sesi telah dicabut demi keamanan.'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(session.user);

    // Refresh token rotation: Generate new refresh token and update session hash
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_EXPIRES_IN_DAYS);

    const newRefreshToken = generateRefreshToken(session.user, session.id);
    await session.update({
      refresh_token_hash: hashToken(newRefreshToken),
      expires_at: newExpiresAt
    });

    // Set updated cookie
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
 * Controller: Logout user and revoke session
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const clientRefreshToken = req.cookies?.refreshToken;

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
        // Silently continue if token is already expired
      }
    }

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
 * Controller: Get authenticated user profile
 * GET /api/auth/me
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
 * Controller: Change Password
 * PATCH /api/auth/change-password
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

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

    // Verify current password
    const isCurrentValid = await req.user.comparePassword(current_password);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini yang Anda masukkan salah.'
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh sama dengan password saat ini.'
      });
    }

    // Update password (model hook will hash automatically)
    req.user.password_hash = new_password;
    await req.user.save();

    // Revoke all existing sessions for this user as a security measure
    await UserSession.update(
      { is_revoked: true },
      { where: { user_id: req.user.id } }
    );

    // Clear current cookie so user gets a fresh login
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
