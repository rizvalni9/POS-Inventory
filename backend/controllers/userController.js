const { User, UserSession } = require('../models');

/**
 * Controller: Get all users (Owner only)
 * GET /api/users
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'full_name', 'role', 'is_active', 'created_at', 'updated_at'],
      order: [['id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Create user (Owner only - No public registration policy)
 * POST /api/users
 */
async function createUser(req, res, next) {
  try {
    const { username, full_name, role, password } = req.body;

    if (!username || !full_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, nama lengkap, dan password wajib diisi.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password akun minimal harus 6 karakter.'
      });
    }

    const assignedRole = role === 'owner' ? 'owner' : 'cashier';
    const normalizedUsername = String(username).trim();

    // Check duplicate username
    const existing = await User.findOne({ where: { username: normalizedUsername } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Username '${normalizedUsername}' sudah digunakan oleh pengguna lain.`
      });
    }

    const newUser = await User.create({
      username: normalizedUsername,
      full_name: full_name.trim(),
      role: assignedRole,
      password_hash: password, // will be hashed by beforeSave hook
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: `Akun ${assignedRole} '${normalizedUsername}' berhasil dibuat.`,
      data: newUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Update user active status (Owner only)
 * PATCH /api/users/:id/status
 */
async function updateUserStatus(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Nilai is_active harus berupa boolean (true atau false).'
      });
    }

    // Prevent owner from deactivating themselves
    if (targetUserId === req.user.id && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.'
      });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    user.is_active = is_active;
    await user.save();

    // If deactivated, revoke all active sessions immediately!
    if (!is_active) {
      await UserSession.update(
        { is_revoked: true },
        { where: { user_id: user.id } }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Status akun '${user.username}' berhasil diperbarui menjadi ${is_active ? 'Aktif' : 'Non-Aktif'}.`,
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Reset user password (Owner only)
 * PATCH /api/users/:id/reset-password
 */
async function resetUserPassword(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru wajib diisi dan minimal 6 karakter.'
      });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    user.password_hash = new_password; // Hook will hash
    await user.save();

    // Revoke all sessions so the user must log in with new password
    await UserSession.update(
      { is_revoked: true },
      { where: { user_id: user.id } }
    );

    return res.status(200).json({
      success: true,
      message: `Password untuk akun '${user.username}' berhasil direset. Seluruh sesi aktif pengguna telah dicabut.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUserStatus,
  resetUserPassword
};
