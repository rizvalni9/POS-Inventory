const { Op } = require('sequelize');
const { OperationalExpense, User } = require('../models');

// Kategori standar default supermarket/minimarket
const DEFAULT_CATEGORIES = [
  'Utilitas (Listrik & Air)',
  'Sewa Toko / Tempat Usaha',
  'Gaji Karyawan & Kasir',
  'Transportasi & Logistik',
  'Perlengkapan Toko & Plastik',
  'Internet & Komunikasi',
  'Perawatan & Perbaikan',
  'Kebersihan Toko',
  'Promosi & Pemasaran',
  'Administrasi Bank & EDC',
  'Lain-lain'
];

/**
 * Controller: Catat Biaya Operasional Baru (Owner only)
 * POST /api/operational-expenses
 */
async function createExpense(req, res, next) {
  try {
    const { expense_name, category, amount, expense_date, notes } = req.body;

    if (!expense_name || typeof expense_name !== 'string' || expense_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nama pengeluaran wajib diisi.'
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kategori pengeluaran wajib dipilih.'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal pengeluaran harus berupa angka lebih besar dari 0.'
      });
    }

    const finalDate = expense_date && expense_date.trim().length > 0 
      ? expense_date.trim() 
      : new Date().toISOString().split('T')[0];

    const newExpense = await OperationalExpense.create({
      expense_name: expense_name.trim(),
      category: category.trim(),
      amount: parsedAmount,
      expense_date: finalDate,
      notes: notes ? notes.trim() : null,
      user_id: req.user ? req.user.id : null
    });

    const expenseWithUser = await OperationalExpense.findByPk(newExpense.id, {
      include: [
        { model: User, as: 'recorded_by', attributes: ['id', 'username', 'full_name'] }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Biaya operasional berhasil dicatat.',
      data: expenseWithUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Daftar Riwayat Biaya Operasional (Owner only)
 * GET /api/operational-expenses
 */
async function getExpenses(req, res, next) {
  try {
    const { date, start_date, end_date, category, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (date) {
      where.expense_date = date;
    } else if (start_date && end_date) {
      where.expense_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      where.expense_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.expense_date = { [Op.lte]: end_date };
    }

    if (category && category !== 'Semua') {
      where.category = category;
    }

    const { count, rows: expenses } = await OperationalExpense.findAndCountAll({
      where,
      include: [
        { model: User, as: 'recorded_by', attributes: ['id', 'username', 'full_name'] }
      ],
      order: [
        ['expense_date', 'DESC'],
        ['id', 'DESC']
      ],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    // Total nominal pengeluaran berdasarkan filter yang diterapkan
    const totalAmount = await OperationalExpense.sum('amount', { where }) || 0;

    return res.status(200).json({
      success: true,
      data: {
        total_count: count,
        total_amount: Number(totalAmount),
        expenses
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Hapus Catatan Biaya Operasional (Owner only)
 * DELETE /api/operational-expenses/:id
 */
async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;

    const expense = await OperationalExpense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Catatan biaya operasional tidak ditemukan.'
      });
    }

    await expense.destroy();

    return res.status(200).json({
      success: true,
      message: 'Catatan biaya operasional berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Ambil Daftar Kategori Biaya Operasional (Owner only)
 * GET /api/operational-expenses/categories
 */
async function getCategories(req, res, next) {
  try {
    // Ambil kategori kustom yang pernah disimpan di database
    const dbCategories = await OperationalExpense.findAll({
      attributes: ['category'],
      group: ['category']
    });

    const categorySet = new Set(DEFAULT_CATEGORIES);
    dbCategories.forEach(item => {
      if (item.category) categorySet.add(item.category);
    });

    return res.status(200).json({
      success: true,
      data: Array.from(categorySet)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createExpense,
  getExpenses,
  deleteExpense,
  getCategories
};
