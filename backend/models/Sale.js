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
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    subtotal_amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Subtotal belanja harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Subtotal belanja minimal 0' }
      }
    },
    discount_amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Diskon harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Diskon minimal 0' }
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
    points_earned: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    points_redeemed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
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
