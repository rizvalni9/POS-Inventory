const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OperationalExpense = sequelize.define('OperationalExpense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  expense_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama atau deskripsi pengeluaran operasional'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Lain-lain',
    comment: 'Kategori pengeluaran operasional toko'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Nominal pengeluaran operasional (Rp)'
  },
  expense_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Tanggal pengeluaran operasional'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan atau keterangan operasional'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID User Owner yang mencatat pengeluaran'
  }
}, {
  tableName: 'operational_expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = OperationalExpense;
