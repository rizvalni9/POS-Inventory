const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_sku',
        msg: 'SKU / Barcode produk sudah terdaftar'
      },
      validate: {
        notEmpty: { msg: 'SKU tidak boleh kosong' },
        len: { args: [2, 50], msg: 'SKU harus antara 2 - 50 karakter' }
      }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama produk tidak boleh kosong' },
        len: { args: [2, 150], msg: 'Nama produk harus antara 2 - 150 karakter' }
      }
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: { msg: 'Harga harus berupa bilangan bulat' },
        min: { args: [1], msg: 'Harga jual harus lebih besar dari 0' }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Stok harus berupa bilangan bulat' },
        min: { args: [0], msg: 'Stok barang tidak boleh negatif' }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['sku'], unique: true },
      { fields: ['name'] },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = Product;
