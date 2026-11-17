const { Op } = require('sequelize');
const { Sale, SaleItem, User, Product, OperationalExpense } = require('../models');

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
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { 
              model: Product, 
              as: 'product',
              attributes: ['id', 'name', 'price', 'profit', 'selling_price'] 
            }
          ]
        },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
      ],
      order: [['transaction_date', 'DESC']]
    });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    let totalCostOfGoodsSold = 0;

    for (const sale of sales) {
      totalRevenue += Number(sale.total_amount || 0);
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const qty = Number(item.quantity || 0);
          totalItemsSold += qty;

          // Hitung modal barang terjual (HPP):
          // Jika produk terdaftar di master: gunakan product.price (Harga Modal)
          // Jika tidak ada data produk: gunakan price_at_sale snapshot
          let unitCost = 0;
          if (item.product && item.product.price) {
            unitCost = Number(item.product.price);
          } else if (item.price_at_sale) {
            unitCost = Number(item.price_at_sale);
          }
          totalCostOfGoodsSold += (unitCost * qty);
        }
      }
    }

    // 1. Laba Kotor: Omset penerimaan dikurangi total modal barang terjual
    const grossProfit = Math.max(0, totalRevenue - totalCostOfGoodsSold);

    // 2. Biaya Operasional: Total pengeluaran operasional toko pada tanggal tersebut
    const totalExpenses = await OperationalExpense.sum('amount', {
      where: {
        expense_date: targetDateStr
      }
    }) || 0;
    const operationalExpenses = Number(totalExpenses);

    // 3. Laba Bersih: Laba kotor dikurangi biaya operasional
    const netProfit = grossProfit - operationalExpenses;

    return res.status(200).json({
      success: true,
      data: {
        date: targetDateStr,
        total_sales_count: sales.length,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        gross_profit: grossProfit,
        operational_expenses: operationalExpenses,
        net_profit: netProfit,
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
