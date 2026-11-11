const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Member extends Model {}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    member_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_member_code',
        msg: 'Kode member sudah terdaftar'
      },
      validate: {
        notEmpty: { msg: 'Kode member tidak boleh kosong' }
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama member tidak boleh kosong' },
        len: { args: [2, 100], msg: 'Nama member harus antara 2 hingga 100 karakter' }
      }
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: {
        name: 'unique_member_phone',
        msg: 'Nomor telepon member sudah terdaftar'
      },
      validate: {
        notEmpty: { msg: 'Nomor telepon tidak boleh kosong' }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: { msg: 'Format email tidak valid' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tier: {
      type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
      allowNull: false,
      defaultValue: 'Bronze'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Saldo poin tidak boleh negatif' }
      }
    },
    total_spent: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    joined_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Member',
    tableName: 'members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['member_code'], unique: true },
      { fields: ['phone'], unique: true },
      { fields: ['tier'] },
      { fields: ['is_active'] }
    ]
  }
);

module.exports = Member;
