const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
  // Method to check password against hash
  async comparePassword(candidatePassword) {
    if (!candidatePassword || !this.password_hash) return false;
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  // Prevent leaking password_hash in JSON responses
  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_username',
        msg: 'Username sudah digunakan oleh akun lain'
      },
      validate: {
        notEmpty: { msg: 'Username tidak boleh kosong' },
        len: { args: [3, 50], msg: 'Username harus antara 3 - 50 karakter' },
        is: { args: /^[a-zA-Z0-9_.-]+$/, msg: 'Username hanya boleh huruf, angka, titik, strip, dan underscore' }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama lengkap tidak boleh kosong' }
      }
    },
    role: {
      type: DataTypes.ENUM('owner', 'cashier'),
      allowNull: false,
      defaultValue: 'cashier',
      validate: {
        isIn: {
          args: [['owner', 'cashier']],
          msg: 'Role harus owner atau cashier'
        }
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeSave: async (user) => {
        // Hash password if modified
        if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
          const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
          user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
        }
      }
    }
  }
);

module.exports = User;
