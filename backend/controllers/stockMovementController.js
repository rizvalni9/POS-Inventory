const { sequelize, Product, StockMovement, User } = require('../models');

/**
 * Controller: Record stock in (Owner only)
 * POST /api/stock-movements
 */
async function createStockIn(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { product_id, quantity, reference_number, notes } = req.body;

    if (!product_id || quantity === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Produk dan kuantitas masuk wajib diisi.'
      });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Kuantitas masuk harus berupa bilangan bulat lebih dari 0 unit.'
      });
    }

    // Lock product row to prevent concurrency race conditions
    const product = await Product.findByPk(product_id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    // Atomic update on stock
    product.stock += parsedQty;
    await product.save({ transaction });

    // Record audit movement
    const movement = await StockMovement.create(
      {
        product_id: product.id,
        quantity: parsedQty,
        type: 'in',
        reference_number: reference_number ? String(reference_number).trim() : null,
        notes: notes ? String(notes).trim() : null,
        created_by_user_id: req.user.id
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `Berhasil menambahkan ${parsedQty} unit stok untuk produk '${product.name}'. Stok saat ini: ${product.stock}.`,
      data: {
        movement,
        current_stock: product.stock
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: Get stock movements history (Owner only)
 * GET /api/stock-movements
 */
async function getStockMovements(req, res, next) {
  try {
    const { product_id } = req.query;
    const whereClause = {};

    if (product_id) {
      whereClause.product_id = Number(product_id);
    }

    const movements = await StockMovement.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'sku', 'name', 'stock']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: movements
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStockIn,
  getStockMovements
};
