const { sequelize } = require('../config/database');
const User = require('./User');
const UserSession = require('./UserSession');
const BusinessProfile = require('./BusinessProfile');
const Product = require('./Product');
const StockMovement = require('./StockMovement');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');

// Setup Associations
// 1. User <-> UserSession
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions', onDelete: 'CASCADE' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. User <-> StockMovement
User.hasMany(StockMovement, { foreignKey: 'created_by_user_id', as: 'stock_movements' });
StockMovement.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });

// 3. Product <-> StockMovement
Product.hasMany(StockMovement, { foreignKey: 'product_id', as: 'movements' });
StockMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 4. User <-> Sale
User.hasMany(Sale, { foreignKey: 'user_id', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'user_id', as: 'cashier' });

// 5. Sale <-> SaleItem
Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items', onDelete: 'CASCADE' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

// 6. Product <-> SaleItem
Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'sale_items', onDelete: 'SET NULL' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  UserSession,
  BusinessProfile,
  Product,
  StockMovement,
  Sale,
  SaleItem
};
