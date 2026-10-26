const { Op } = require('sequelize');
const { sequelize, Sale, SaleItem, Product, User, BusinessProfile } = require('../models');

/**
 * Helper to generate unique invoice number: TRX-YYYYMMDD-XXXX
 */
function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `TRX-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Controller: POS Checkout Transaction
 * POST /api/sales/checkout
 * Accessible by: Owner, Cashier
 * ACID Transaction with Pessimistic Row Lock & Server-Side Price Calculation
 */
async function checkout(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { cash_paid, items } = req.body;

    // 1. Validate payload format
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Keranjang belanja tidak boleh kosong.'
      });
    }

    const parsedCashPaid = parseInt(cash_paid, 10);
    if (isNaN(parsedCashPaid) || parsedCashPaid < 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nominal uang tunai yang diserahkan tidak valid.'
      });
    }

    // Sanitize and group items by product_id
    const itemMap = new Map();
    for (const item of items) {
      const pId = Number(item.product_id);
      const qty = parseInt(item.quantity, 10);

      if (!pId || isNaN(qty) || qty <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Format item keranjang tidak valid. Kuantitas harus bilangan bulat minimal 1 unit.'
        });
      }

      if (itemMap.has(pId)) {
        itemMap.set(pId, itemMap.get(pId) + qty);
      } else {
        itemMap.set(pId, qty);
      }
    }

    const productIds = Array.from(itemMap.keys());

    // 2. Fetch products with row-level lock (FOR UPDATE)
    const products = await Product.findAll({
      where: { id: productIds },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (products.length !== productIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Beberapa produk dalam keranjang belanja tidak ditemukan di database.'
      });
    }

    // 3. Validate active status and stock availability, and compute server-side totals
    let calculatedTotal = 0;
    const saleItemsPayload = [];

    for (const product of products) {
      const requestedQty = itemMap.get(product.id);

      // Validate product active
      if (!product.is_active) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Produk '${product.name}' sudah dinonaktifkan dan tidak dapat ditransaksikan.`
        });
      }

      // Validate stock sufficiency (No negative stock allowed)
      if (product.stock < requestedQty) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok produk '${product.name}' tidak mencukupi. Tersedia: ${product.stock}, diminta: ${requestedQty}.`
        });
      }

      const itemSubtotal = product.price * requestedQty;
      calculatedTotal += itemSubtotal;

      // Prepare snapshot record for sale_items
      saleItemsPayload.push({
        product_id: product.id,
        product_name_at_sale: product.name,
        price_at_sale: product.price,
        quantity: requestedQty,
        subtotal: itemSubtotal
      });

      // Deduct product stock in memory for transaction
      product.stock -= requestedQty;
    }

    // 4. Validate cash paid >= total_amount
    if (parsedCashPaid < calculatedTotal) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Uang tunai tidak mencukupi. Total belanja: Rp${calculatedTotal.toLocaleString('id-ID')}, Uang diserahkan: Rp${parsedCashPaid.toLocaleString('id-ID')}.`
      });
    }

    const changeReturned = parsedCashPaid - calculatedTotal;

    // 5. Save decremented stock for all products
    for (const product of products) {
      await product.save({ transaction });
    }

    // 6. Generate unique invoice number
    let invoiceNumber = generateInvoiceNumber();
    // Safety check for invoice collision
    let collisionCheck = await Sale.findOne({ where: { invoice_number: invoiceNumber }, transaction });
    while (collisionCheck) {
      invoiceNumber = generateInvoiceNumber();
      collisionCheck = await Sale.findOne({ where: { invoice_number: invoiceNumber }, transaction });
    }

    // 7. Create Sale record
    const sale = await Sale.create(
      {
        invoice_number: invoiceNumber,
        user_id: req.user.id,
        total_amount: calculatedTotal,
        cash_paid: parsedCashPaid,
        change_returned: changeReturned,
        transaction_date: new Date()
      },
      { transaction }
    );

    // 8. Create SaleItem records with snapshot
    const itemRecords = saleItemsPayload.map(item => ({
      ...item,
      sale_id: sale.id
    }));
    await SaleItem.bulkCreate(itemRecords, { transaction });

    // 9. Commit transaction
    await transaction.commit();

    // 10. Fetch populated sale for response
    const populatedSale = await Sale.findByPk(sale.id, {
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
      ]
    });

    const storeProfile = await BusinessProfile.findOne();

    return res.status(201).json({
      success: true,
      message: 'Transaksi checkout penjualan berhasil diselesaikan.',
      data: {
        sale: populatedSale,
        store: storeProfile
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: Get sales history
 * GET /api/sales
 * Accessible by: Owner (all dates), Cashier (strictly restricted to today)
 */
async function getSales(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (req.user.role === 'cashier') {
      // Cashier is strictly restricted to transactions on the current calendar day
      whereClause.transaction_date = {
        [Op.gte]: new Date(`${todayStr} 00:00:00`),
        [Op.lte]: new Date(`${todayStr} 23:59:59`)
      };
    } else {
      // Owner can filter by custom range
      if (start_date && end_date) {
        whereClause.transaction_date = {
          [Op.gte]: new Date(`${start_date} 00:00:00`),
          [Op.lte]: new Date(`${end_date} 23:59:59`)
        };
      } else if (start_date) {
        whereClause.transaction_date = {
          [Op.gte]: new Date(`${start_date} 00:00:00`)
        };
      }
    }

    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
      ],
      order: [['transaction_date', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: sales
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get sale details by ID (for receipt reprinting)
 * GET /api/sales/:id
 */
async function getSaleById(req, res, next) {
  try {
    const saleId = Number(req.params.id);

    const sale = await Sale.findByPk(saleId, {
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Faktur transaksi tidak ditemukan.'
      });
    }

    const store = await BusinessProfile.findOne();

    return res.status(200).json({
      success: true,
      data: {
        sale,
        store
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  getSales,
  getSaleById
};
