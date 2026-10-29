const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class MemberPointHistory extends Model {}

MemberPointHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('EARN', 'REDEEM', 'ADJUSTMENT', 'BONUS'),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Nilai poin mutasi (positif penambahan, negatif pengurangan)'
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Snapshot saldo poin member setelah transaksi ini'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'MemberPointHistory',
    tableName: 'member_point_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['member_id'] },
      { fields: ['sale_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] }
    ]
  }
);

module.exports = MemberPointHistory;
