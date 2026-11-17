const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class OrderRequestItem extends Model {}

OrderRequestItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order_requests',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama produk tidak boleh kosong' }
      }
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Harga satuan minimal 0' }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Kuantitas harus berupa bilangan bulat' },
        min: { args: [1], msg: 'Kuantitas minimal 1' }
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Subtotal minimal 0' }
      }
    }
  },
  {
    sequelize,
    modelName: 'OrderRequestItem',
    tableName: 'order_request_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_request_id'] },
      { fields: ['product_id'] }
    ]
  }
);

module.exports = OrderRequestItem;

