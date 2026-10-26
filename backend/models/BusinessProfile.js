const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class BusinessProfile extends Model {}

BusinessProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    store_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Toko Kasir & Stok',
      validate: {
        notEmpty: { msg: 'Nama toko tidak boleh kosong' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    receipt_footer: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Terima kasih atas kunjungan Anda'
    }
  },
  {
    sequelize,
    modelName: 'BusinessProfile',
    tableName: 'business_profiles',
    timestamps: true,
    createdAt: false, // Per PRD Data Dictionary, business_profiles only tracks updated_at
    updatedAt: 'updated_at'
  }
);

module.exports = BusinessProfile;
