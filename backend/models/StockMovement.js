const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class StockMovement extends Model {}

StockMovement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Kuantitas masuk harus berupa bilangan bulat' },
        min: { args: [1], msg: 'Kuantitas masuk minimal 1 unit' }
      }
    },
    type: {
      type: DataTypes.ENUM('in'),
      allowNull: false,
      defaultValue: 'in'
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['created_by_user_id'] },
      { fields: ['created_at'] }
    ]
  }
);

module.exports = StockMovement;
