const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SaleItem extends Model {}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    product_name_at_sale: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama produk snapshot tidak boleh kosong' }
      }
    },
    price_at_sale: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Harga snapshot harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Harga snapshot minimal 0' }
      }
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Kuantitas beli harus bilangan bulat' },
        min: { args: [1], msg: 'Kuantitas beli minimal 1' }
      }
    },
    subtotal: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Subtotal harus bilangan bulat' }
      }
    }
  },
  {
    sequelize,
    modelName: 'SaleItem',
    tableName: 'sale_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['sale_id'] },
      { fields: ['product_id'] }
    ]
  }
);

module.exports = SaleItem;
