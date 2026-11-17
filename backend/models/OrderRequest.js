const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class OrderRequest extends Model {}

OrderRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_order_number',
        msg: 'Nomor permintaan pesanan sudah terdaftar'
      }
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'processing', 'completed', 'cancelled']],
          msg: 'Status pesanan harus salah satu dari: pending, processing, completed, cancelled'
        }
      }
    },
    total_estimated_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Total estimasi pesanan minimal 0' }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idempotency_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_idempotency_key',
        msg: 'Idempotency key sudah digunakan'
      }
    },
    cancellation_reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'OrderRequest',
    tableName: 'order_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_number'], unique: true },
      { fields: ['idempotency_key'], unique: true },
      { fields: ['member_id'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = OrderRequest;

