// ==============================================================================
// FILE: controllers/stockMovementController.js
// DESKRIPSI: Pengendali pencatatan barang masuk (Stok Masuk).
// Setiap penambahan stok toko WAJIB dicatat di sini sebagai bukti riwayat (audit trail).
// ==============================================================================

const { sequelize, Product, StockMovement, User } = require('../models');

/**
 * Controller: createStockIn
 * POST /api/stock-movements
 * Dapat diakses oleh: Owner saja
 * Menambah stok fisik barang dan mencatat siapa yang memasukkan barang tersebut.
 */
async function createStockIn(req, res, next) {
  // Buka transaksi database agar aman jika terjadi kendala di tengah proses
  const transaction = await sequelize.transaction();

  try {
    const { product_id, quantity, reference_number, notes } = req.body;

    // LANGKAH 1: Validasi form input
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

    // LANGKAH 2: Cari produk dan kunci barisnya di database (Row Lock)
    const product = await Product.findByPk(product_id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan di database.'
      });
    }

    // LANGKAH 3: Tambah stok produk di tabel products
    product.stock += parsedQty;
    await product.save({ transaction });

    // LANGKAH 4: Catat riwayat mutasi ke tabel stock_movements
    const movement = await StockMovement.create(
      {
        product_id: product.id,
        quantity: parsedQty,
        type: 'in', // Jenis 'in' = stok masuk
        reference_number: reference_number ? String(reference_number).trim() : null, // Nomor faktur/surat jalan
        notes: notes ? String(notes).trim() : null, // Catatan tambahan
        created_by_user_id: req.user.id // ID pemilik yang memasukkan barang
      },
      { transaction }
    );

    // LANGKAH 5: Simpan permanen transaksi
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
    // Jika ada error, batalkan transaksi
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: getStockMovements
 * GET /api/stock-movements
 * Dapat diakses oleh: Owner saja
 * Melihat seluruh riwayat barang masuk dari waktu ke waktu.
 */
async function getStockMovements(req, res, next) {
  try {
    const { product_id } = req.query;
    const whereClause = {};

    // Jika ingin memfilter riwayat untuk satu produk tertentu saja
    if (product_id) {
      whereClause.product_id = Number(product_id);
    }

    // Ambil data mutasi dan gabungkan (JOIN) dengan tabel Product dan User pembuatnya
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
