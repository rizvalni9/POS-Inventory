// ==============================================================================
// FILE: backend/controllers/memberController.js
// DESKRIPSI: Pengendali modul Loyalty Member (Pelanggan Setia Toko).
// Mendukung peran:
// - Kasir (Cashier): Cari member, pendaftaran member cepat, cek saldo poin.
// - Pemilik Toko (Owner): Manajemen lengkap, analitik poin, penyesuaian saldo poin manual, aktivasi/deaktivasi.
// ==============================================================================

const { Op } = require('sequelize');
const { sequelize, Member, MemberPointHistory, Sale, User } = require('../models');

/**
 * Helper: Menghasilkan kode member acak yang unik
 * Format: MBR-YYYYMMDD-XXXX (contoh: MBR-20261028-1024)
 */
function generateMemberCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MBR-${year}${month}${day}-${rand}`;
}

/**
 * Controller: getMembers
 * GET /api/members
 * Akses: Owner & Cashier
 * Menampilkan daftar seluruh member dengan pencarian dan filter tier/status.
 */
async function getMembers(req, res, next) {
  try {
    const { search, tier, is_active } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { phone: { [Op.like]: q } },
        { member_code: { [Op.like]: q } },
        { email: { [Op.like]: q } }
      ];
    }

    if (tier && ['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
      where.tier = tier;
    }

    if (is_active !== undefined && is_active !== '') {
      where.is_active = is_active === 'true' || is_active === true;
    }

    const members = await Member.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Data loyalty member berhasil diambil.',
      data: members
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: searchMembersQuick
 * GET /api/members/search-quick?q=...
 * Akses: Owner & Cashier (Didesain khusus untuk autocomplete layar kasir POS)
 */
async function searchMembersQuick(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const searchQuery = `%${q.trim()}%`;
    const members = await Member.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { phone: { [Op.like]: searchQuery } },
          { member_code: { [Op.like]: searchQuery } },
          { name: { [Op.like]: searchQuery } }
        ]
      },
      attributes: ['id', 'member_code', 'name', 'phone', 'tier', 'points', 'total_spent'],
      limit: 10,
      order: [['points', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: getMemberById
 * GET /api/members/:id
 * Akses: Owner & Cashier
 * Mengambil detail member, kartu identitas, riwayat mutasi poin, dan transaksi belanja terakhir.
 */
async function getMemberById(req, res, next) {
  try {
    const { id } = req.params;

    const member = await Member.findByPk(id, {
      include: [
        {
          model: MemberPointHistory,
          as: 'point_histories',
          limit: 30,
          order: [['created_at', 'DESC']],
          include: [
            { model: User, as: 'creator', attributes: ['id', 'username', 'full_name'] },
            { model: Sale, as: 'sale', attributes: ['id', 'invoice_number', 'total_amount', 'transaction_date'] }
          ]
        },
        {
          model: Sale,
          as: 'sales',
          limit: 10,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'invoice_number', 'total_amount', 'discount_amount', 'points_earned', 'points_redeemed', 'transaction_date']
        }
      ]
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty member tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail member berhasil dimuat.',
      data: member
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: createMember
 * POST /api/members
 * Akses: Owner & Cashier (Kasir bisa mendaftarkan pelanggan langsung di meja kasir)
 */
async function createMember(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { name, phone, email, address, tier, notes, initial_points } = req.body;

    // Validasi data wajib
    if (!name || name.trim().length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap member minimal 2 karakter.'
      });
    }

    if (!phone || phone.trim().length < 6) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon member wajib diisi dengan benar.'
      });
    }

    // Cek duplikasi nomor telepon
    const existingPhone = await Member.findOne({
      where: { phone: phone.trim() },
      transaction
    });
    if (existingPhone) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: `Nomor telepon '${phone}' sudah terdaftar pada member '${existingPhone.name}'.`
      });
    }

    // Buat kode member unik otomatis
    let memberCode = generateMemberCode();
    let codeCheck = await Member.findOne({ where: { member_code: memberCode }, transaction });
    while (codeCheck) {
      memberCode = generateMemberCode();
      codeCheck = await Member.findOne({ where: { member_code: memberCode }, transaction });
    }

    // Default bonus poin pendaftaran (misal 10 poin)
    const startingPoints = parseInt(initial_points, 10) >= 0 ? parseInt(initial_points, 10) : 10;
    const memberTier = ['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier) ? tier : 'Bronze';

    const newMember = await Member.create(
      {
        member_code: memberCode,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        tier: memberTier,
        points: startingPoints,
        total_spent: 0,
        is_active: true,
        notes: notes ? notes.trim() : null,
        joined_date: new Date()
      },
      { transaction }
    );

    // Catat mutasi poin bonus pendaftaran
    if (startingPoints > 0) {
      await MemberPointHistory.create(
        {
          member_id: newMember.id,
          type: 'BONUS',
          points: startingPoints,
          balance_after: startingPoints,
          description: 'Bonus poin selamat datang pendaftaran member baru',
          created_by_user_id: req.user ? req.user.id : null
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `Member '${newMember.name}' berhasil didaftarkan dengan kode ${newMember.member_code}.`,
      data: newMember
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: updateMember
 * PUT /api/members/:id
 * Akses: Owner & Cashier (Kasir ubah kontak, Owner bisa ubah tier dan status)
 */
async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const { name, phone, email, address, tier, is_active, notes } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member tidak ditemukan.'
      });
    }

    // Validasi duplikasi telepon jika nomor diubah
    if (phone && phone.trim() !== member.phone) {
      const existingPhone = await Member.findOne({
        where: { phone: phone.trim(), id: { [Op.ne]: id } }
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: `Nomor telepon '${phone}' sudah digunakan oleh member lain.`
        });
      }
      member.phone = phone.trim();
    }

    if (name) member.name = name.trim();
    if (email !== undefined) member.email = email ? email.trim() : null;
    if (address !== undefined) member.address = address ? address.trim() : null;
    if (notes !== undefined) member.notes = notes ? notes.trim() : null;

    // Hanya Owner yang berhak mengubah Tier dan Status keaktifan secara manual
    if (req.user.role === 'owner') {
      if (tier && ['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
        member.tier = tier;
      }
      if (is_active !== undefined) {
        member.is_active = Boolean(is_active);
      }
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Data member berhasil diperbarui.',
      data: member
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: adjustMemberPoints
 * POST /api/members/:id/adjust-points
 * Akses: Owner Only (Penyesuaian saldo poin secara manual dengan catatan audit wajib)
 */
async function adjustMemberPoints(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { points_delta, reason } = req.body;

    const delta = parseInt(points_delta, 10);
    if (isNaN(delta) || delta === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Jumlah penyesuaian poin harus bilangan bulat selain 0 (positif atau negatif).'
      });
    }

    if (!reason || reason.trim().length < 4) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Alasan penyesuaian poin wajib diisi minimal 4 karakter sebagai jejak audit.'
      });
    }

    // Kunci baris member (Pessimistic Locking)
    const member = await Member.findByPk(id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!member) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Member tidak ditemukan.'
      });
    }

    const newBalance = member.points + delta;
    if (newBalance < 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Pengurangan poin melebihi saldo member saat ini (${member.points} poin).`
      });
    }

    member.points = newBalance;
    await member.save({ transaction });

    // Buat riwayat mutasi poin
    const history = await MemberPointHistory.create(
      {
        member_id: member.id,
        type: 'ADJUSTMENT',
        points: delta,
        balance_after: newBalance,
        description: `Penyesuaian manual oleh Owner: ${reason.trim()}`,
        created_by_user_id: req.user.id
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Saldo poin member '${member.name}' berhasil disesuaikan. Saldo baru: ${newBalance} poin.`,
      data: {
        member,
        history
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: toggleMemberStatus
 * PATCH /api/members/:id/toggle-status
 * Akses: Owner Only
 */
async function toggleMemberStatus(req, res, next) {
  try {
    const { id } = req.params;
    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member tidak ditemukan.'
      });
    }

    member.is_active = !member.is_active;
    await member.save();

    return res.status(200).json({
      success: true,
      message: `Status member '${member.name}' diubah menjadi ${member.is_active ? 'Aktif' : 'Non-Aktif'}.`,
      data: member
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: deleteMember
 * DELETE /api/members/:id
 * Akses: Owner Only
 */
async function deleteMember(req, res, next) {
  try {
    const { id } = req.params;
    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member tidak ditemukan.'
      });
    }

    // Cek apakah member sudah pernah belanja
    const saleCount = await Sale.count({ where: { member_id: id } });
    if (saleCount > 0) {
      // Jika sudah memiliki riwayat belanja, jangan hapus fisik, nonaktifkan saja untuk integritas audit
      member.is_active = false;
      await member.save();
      return res.status(200).json({
        success: true,
        message: `Member '${member.name}' telah memiliki riwayat belanja. Status diubah menjadi Non-Aktif (diarsipkan).`
      });
    }

    await member.destroy();

    return res.status(200).json({
      success: true,
      message: `Member '${member.name}' berhasil dihapus secara permanen.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: getLoyaltySummary
 * GET /api/members/summary/stats
 * Akses: Owner & Cashier (Owner melihat analitik lengkap, Kasir melihat ringkasan)
 */
async function getLoyaltySummary(req, res, next) {
  try {
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { is_active: true } });

    // Total poin yang beredar di seluruh member
    const totalPointsInCirculation = (await Member.sum('points')) || 0;

    // Total poin yang sudah pernah ditukarkan (redeemed)
    const totalRedeemedPoints = Math.abs(
      (await MemberPointHistory.sum('points', { where: { type: 'REDEEM' } })) || 0
    );

    // Distribusi berdasarkan Tier
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const tierDistribution = {};
    for (const t of tiers) {
      tierDistribution[t] = await Member.count({ where: { tier: t, is_active: true } });
    }

    // Top 5 Member Paling Loyal berdasarkan total belanja
    const topMembers = await Member.findAll({
      where: { is_active: true },
      order: [['total_spent', 'DESC']],
      limit: 5,
      attributes: ['id', 'member_code', 'name', 'phone', 'tier', 'points', 'total_spent']
    });

    return res.status(200).json({
      success: true,
      message: 'Ringkasan analitik loyalty member berhasil dimuat.',
      data: {
        total_members: totalMembers,
        active_members: activeMembers,
        total_points_in_circulation: totalPointsInCirculation,
        total_points_redeemed: totalRedeemedPoints,
        tier_distribution: tierDistribution,
        top_members: topMembers
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMembers,
  searchMembersQuick,
  getMemberById,
  createMember,
  updateMember,
  adjustMemberPoints,
  toggleMemberStatus,
  deleteMember,
  getLoyaltySummary
};
