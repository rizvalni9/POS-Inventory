// ==============================================================================
// FILE: controllers/productController.js
// DESKRIPSI: Pengendali katalog master produk barang toko.
// Berisi fungsi melihat daftar produk, menambah produk baru, mengubah nama/harga,
// dan mengaktifkan / menonaktifkan produk (Soft Deactivation).
// Catatan: Mengubah stok secara langsung di sini dilarang demi keamanan audit stok!
// ==============================================================================

const { Op } = require('sequelize');
const { Product } = require('../models');

/**
 * Controller: getAllProducts
 * GET /api/products
 * Dapat diakses oleh: Owner dan Cashier
 * Mengambil daftar produk untuk ditampilkan di etalase kasir dan halaman master produk.
 */
async function getAllProducts(req, res, next) {
  try {
    const { search, is_active } = req.query;

    // Menyiapkan filter query
    const whereClause = {};

    // Filter berdasarkan status aktif (misal kasir hanya butuh produk aktif)
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true' || is_active === true;
    }

    // Filter pencarian berdasarkan nama produk atau barcode SKU
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { sku: { [Op.like]: searchTerm } }
      ];
    }

    // Ambil data dari database MySQL, urutkan dari yang aktif terlebih dahulu
    const products = await Product.findAll({
      where: whereClause,
      order: [
        ['is_active', 'DESC'],
        ['name', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: createProduct
 * POST /api/products
 * Dapat diakses oleh: Owner saja
 * Menambahkan barang baru ke katalog toko dengan stok awal 0.
 */
async function createProduct(req, res, next) {
  try {
    const { sku, name, price } = req.body;

    // LANGKAH 1: Validasi kelengkapan form
    if (!sku || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'SKU / Barcode, nama produk, dan harga jual wajib diisi.'
      });
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Harga jual harus berupa bilangan bulat lebih dari 0 Rupiah.'
      });
    }

    // LANGKAH 2: Cek apakah SKU sudah pernah dipakai sebelumnya
    const trimmedSku = String(sku).trim();
    const existing = await Product.findOne({ where: { sku: trimmedSku } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Produk dengan SKU '${trimmedSku}' sudah terdaftar. Silakan gunakan barcode lain.`
      });
    }

    // LANGKAH 3: Simpan produk baru ke database (stok awal selalu 0)
    // Stok hanya boleh bertambah lewat formulir Stok Masuk resmi
    const product = await Product.create({
      sku: trimmedSku,
      name: String(name).trim(),
      price: parsedPrice,
      stock: 0,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke katalog.',
      data: product
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: updateProduct
 * PUT /api/products/:id
 * Dapat diakses oleh: Owner saja
 * Mengubah informasi produk seperti nama dan harga jual.
 */
async function updateProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const { name, price, is_active } = req.body;

    // Cari produk berdasarkan ID
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    // Perbarui nama jika ada
    if (name) product.name = String(name).trim();

    // Perbarui harga jika ada dan valid
    if (price !== undefined) {
      const parsedPrice = parseInt(price, 10);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Harga jual harus berupa bilangan bulat positif.'
        });
      }
      product.price = parsedPrice;
    }

    // Perbarui status aktif jika ada
    if (is_active !== undefined) {
      product.is_active = Boolean(is_active);
    }

    // Simpan perubahan ke database
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Data produk berhasil diperbarui.',
      data: product
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: updateProductStatus
 * PATCH /api/products/:id/status
 * Dapat diakses oleh: Owner saja
 * Mengaktifkan atau mengarsipkan barang (soft-delete).
 */
async function updateProductStatus(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Nilai status is_active harus berupa boolean (true atau false).'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    // Ubah status dan simpan
    product.is_active = is_active;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Status produk '${product.name}' berhasil diubah menjadi ${is_active ? 'Aktif' : 'Non-Aktif'}.`,
      data: product
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  updateProductStatus
};
