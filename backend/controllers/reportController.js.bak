const { Op } = require('sequelize');
const { Sale, SaleItem, User } = require('../models');

/**
 * Controller: Get daily financial and sales summary (Owner only)
 * GET /api/reports/daily-summary
 */
async function getDailySummary(req, res, next) {
  try {
    const { date } = req.query;

    const now = new Date();
    const targetDateStr = date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const startDate = new Date(`${targetDateStr} 00:00:00`);
    const endDate = new Date(`${targetDateStr} 23:59:59`);

    const sales = await Sale.findAll({
      where: {
        transaction_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
      ],
      order: [['transaction_date', 'DESC']]
    });

    let totalRevenue = 0;
    let totalItemsSold = 0;

    for (const sale of sales) {
      totalRevenue += sale.total_amount;
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          totalItemsSold += item.quantity;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        date: targetDateStr,
        total_sales_count: sales.length,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        sales: sales
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDailySummary
};
