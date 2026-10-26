const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Sale extends Model {}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_invoice_number',
        msg: 'Nomor faktur invoice sudah terdaftar'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Total belanja harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Total belanja minimal 0' }
      }
    },
    cash_paid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Nominal tunai harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Nominal tunai tidak boleh negatif' }
      }
    },
    change_returned: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Kembalian harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Kembalian tidak boleh negatif' }
      }
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Sale',
    tableName: 'sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['invoice_number'], unique: true },
      { fields: ['user_id'] },
      { fields: ['transaction_date'] }
    ]
  }
);

module.exports = Sale;
