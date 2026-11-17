const { sequelize } = require('../config/database');
const User = require('./User');
const UserSession = require('./UserSession');
const BusinessProfile = require('./BusinessProfile');
const Product = require('./Product');
const StockMovement = require('./StockMovement');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Member = require('./Member');
const MemberPointHistory = require('./MemberPointHistory');
const OrderRequest = require('./OrderRequest');
const OrderRequestItem = require('./OrderRequestItem');
const OperationalExpense = require('./OperationalExpense');

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

// 7. Member <-> Sale
Member.hasMany(Sale, { foreignKey: 'member_id', as: 'sales' });
Sale.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 8. Member <-> MemberPointHistory
Member.hasMany(MemberPointHistory, { foreignKey: 'member_id', as: 'point_histories', onDelete: 'CASCADE' });
MemberPointHistory.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 9. Sale <-> MemberPointHistory
Sale.hasMany(MemberPointHistory, { foreignKey: 'sale_id', as: 'point_histories' });
MemberPointHistory.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

// 10. User <-> MemberPointHistory
User.hasMany(MemberPointHistory, { foreignKey: 'created_by_user_id', as: 'point_adjustments' });
MemberPointHistory.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });

// 11. Member <-> OrderRequest
Member.hasMany(OrderRequest, { foreignKey: 'member_id', as: 'order_requests' });
OrderRequest.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 12. OrderRequest <-> OrderRequestItem
OrderRequest.hasMany(OrderRequestItem, { foreignKey: 'order_request_id', as: 'items', onDelete: 'CASCADE' });
OrderRequestItem.belongsTo(OrderRequest, { foreignKey: 'order_request_id', as: 'order_request' });

// 13. Product <-> OrderRequestItem
Product.hasMany(OrderRequestItem, { foreignKey: 'product_id', as: 'order_items' });
OrderRequestItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 14. OrderRequest <-> Sale
OrderRequest.hasOne(Sale, { foreignKey: 'order_request_id', as: 'sale' });
Sale.belongsTo(OrderRequest, { foreignKey: 'order_request_id', as: 'order_request' });

// 15. User <-> OperationalExpense
User.hasMany(OperationalExpense, { foreignKey: 'user_id', as: 'operational_expenses' });
OperationalExpense.belongsTo(User, { foreignKey: 'user_id', as: 'recorded_by' });

module.exports = {
  sequelize,
  User,
  UserSession,
  BusinessProfile,
  Product,
  StockMovement,
  Sale,
  SaleItem,
  Member,
  MemberPointHistory,
  OrderRequest,
  OrderRequestItem,
  OperationalExpense
};

