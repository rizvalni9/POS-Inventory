const { Op } = require('sequelize');
const { Product } = require('../models');

/**
 * Controller: Get all products
 * GET /api/products
 * Accessible by: Owner, Cashier
 */
async function getAllProducts(req, res, next) {
  try {
    const { search, is_active } = req.query;

    const whereClause = {};

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true' || is_active === true;
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { sku: { [Op.like]: searchTerm } }
      ];
    }

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
 * Controller: Create product (Owner only)
 * POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    const { sku, name, price } = req.body;

    if (!sku || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'SKU, nama produk, dan harga jual wajib diisi.'
      });
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Harga jual harus berupa bilangan bulat lebih dari 0 Rupiah.'
      });
    }

    const trimmedSku = String(sku).trim();
    const existing = await Product.findOne({ where: { sku: trimmedSku } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Produk dengan SKU '${trimmedSku}' sudah terdaftar.`
      });
    }

    const product = await Product.create({
      sku: trimmedSku,
      name: String(name).trim(),
      price: parsedPrice,
      stock: 0, // Initial stock is always 0, populated via stock-in form
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
 * Controller: Update product (Owner only)
 * PUT /api/products/:id
 * NOTE: Direct stock mutation via this endpoint is strictly disallowed by business rules.
 */
async function updateProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const { name, price, is_active } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    if (name) product.name = String(name).trim();
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
    if (is_active !== undefined) {
      product.is_active = Boolean(is_active);
    }

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
 * Controller: Toggle product active status (Owner only)
 * PATCH /api/products/:id/status
 */
async function updateProductStatus(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Nilai is_active harus berupa boolean (true atau false).'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

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
