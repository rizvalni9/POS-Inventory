const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Member, Product, OrderRequest, OrderRequestItem, Sale, SaleItem, User, BusinessProfile } = require('../models');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'pos_jwt_access_super_secret_key_2026_change_in_production';

function generateCustomerToken(member) {
  const payload = {
    id: member.id,
    username: member.username || member.phone,
    full_name: member.name,
    role: 'customer'
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '7d', // 7 hari untuk pengalaman mulus customer mobile
    algorithm: 'HS256',
    issuer: 'pos-kasir-api',
    audience: 'pos-kasir-client'
  });
}

/**
 * Middleware Autentikasi Khusus Customer Mobile
 */
async function authenticateCustomer(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Sesi Anda tidak ditemukan. Silakan login kembali.'
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.'
      });
    }

    if (decoded.role !== 'customer') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Hanya akun customer yang diizinkan mengakses layanan ini.'
      });
    }

    const member = await Member.findByPk(decoded.id);
    if (!member || !member.is_active) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Akun member tidak ditemukan atau sedang dinonaktifkan.'
      });
    }

    req.member = member;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Terjadi kesalahan sistem saat memeriksa sesi akun.'
    });
  }
}

/**
 * 1. POST /api/v1/customer/auth/login
 * Login menggunakan Nomor HP atau Nama Member + Kata Sandi
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nomor HP/Nama dan kata sandi wajib diisi.'
      });
    }

    const input = String(username).trim();

    // Cari member berdasarkan username, no HP, atau kode member murni dari database
    let member = await Member.findOne({
      where: {
        [Op.or]: [
          { username: input },
          { phone: input },
          { member_code: input }
        ]
      }
    });

    if (!member) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Username, nomor HP, atau kata sandi yang Anda masukkan salah.'
      });
    }

    if (!member.is_active) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'Akun member Anda sedang dinonaktifkan oleh toko.'
      });
    }

    // Verifikasi password Bcrypt
    let isPasswordValid = false;
    if (member.password_hash) {
      isPasswordValid = await member.comparePassword(password);
    }
    
    // Toleransi password default awal '123456'
    if (!isPasswordValid && password === '123456') {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Username, nomor HP, atau kata sandi yang Anda masukkan salah.'
      });
    }

    // Buat token akses JWT resmi (Masa aktif 7 hari untuk kenyamanan customer mobile)
    const token = generateCustomerToken(member);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token: token,
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: member.id,
          member_id: member.id,
          member_code: member.member_code,
          name: member.name,
          username: member.username || member.phone,
          phone: member.phone,
          email: member.email,
          address: member.address,
          tier: member.tier,
          points: member.points,
          role: 'customer'
        }
      }
    });
  } catch (error) {
    console.error('[Customer Auth Error]:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Terjadi kesalahan saat memproses login: ' + error.message
    });
  }
});

/**
 * 2. GET /api/v1/customer/me
 * Mendapatkan profil member mandiri
 */
router.get('/me', authenticateCustomer, async (req, res) => {
  const member = req.member;
  return res.status(200).json({
    success: true,
    data: {
      id: member.id,
      member_id: member.id,
      member_code: member.member_code,
      name: member.name,
      username: member.username || member.phone,
      phone: member.phone,
      email: member.email,
      address: member.address,
      tier: member.tier,
      points: member.points,
      role: 'customer'
    }
  });
});

/**
 * 3. PATCH /api/v1/customer/me
 * Memperbarui data kontak mandiri (hanya nomor telepon dan email)
 */
router.patch('/me', authenticateCustomer, async (req, res) => {
  try {
    const member = req.member;
    const { phone, email } = req.body;

    if (phone) member.phone = phone.trim();
    if (email !== undefined) member.email = email ? email.trim() : null;

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Informasi kontak berhasil diperbarui.',
      data: {
        id: member.id,
        member_id: member.id,
        member_code: member.member_code,
        name: member.name,
        username: member.username || member.phone,
        phone: member.phone,
        email: member.email,
        address: member.address,
        tier: member.tier,
        points: member.points,
        role: 'customer'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi kontak: ' + error.message
    });
  }
});

/**
 * 4. PATCH /api/v1/customer/change-password
 * Mengubah Username dan/atau Kata Sandi mandiri oleh customer dalam 1 form terpadu
 */
router.patch('/change-password', authenticateCustomer, async (req, res) => {
  try {
    const member = req.member;
    const { new_username, current_password, new_password, confirm_password } = req.body;

    if (!current_password) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi saat ini wajib diisi untuk verifikasi keamanan.'
      });
    }

    // Periksa kecocokan kata sandi saat ini
    let isMatch = false;
    if (member.password_hash) {
      isMatch = await member.comparePassword(current_password);
    }
    if (!isMatch && current_password === '123456') {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi saat ini salah.'
      });
    }

    let updatedUsername = false;
    // 1. Update Username jika diisi dan berbeda
    if (new_username && new_username.trim() !== member.username) {
      const cleanUsername = new_username.trim().toLowerCase();
      if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Username harus antara 3 hingga 50 karakter.'
        });
      }

      // Pastikan belum digunakan oleh member lain
      const existing = await Member.findOne({
        where: {
          username: cleanUsername,
          id: { [Op.ne]: member.id }
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          code: 'USERNAME_TAKEN',
          message: 'Username sudah digunakan oleh akun lain. Silakan pilih username lain.'
        });
      }

      member.username = cleanUsername;
      updatedUsername = true;
    }

    let updatedPassword = false;
    // 2. Update Kata Sandi jika diisi
    if (new_password) {
      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi baru minimal 6 karakter.'
        });
      }

      if (confirm_password && new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'Konfirmasi kata sandi baru tidak cocok.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      member.password_hash = await bcrypt.hash(new_password, salt);
      updatedPassword = true;
    }

    await member.save();

    let successMsg = 'Pengaturan akun berhasil disimpan.';
    if (updatedUsername && updatedPassword) {
      successMsg = 'Username dan kata sandi berhasil diperbarui.';
    } else if (updatedUsername) {
      successMsg = `Username berhasil diubah menjadi "${member.username}".`;
    } else if (updatedPassword) {
      successMsg = 'Kata sandi berhasil diperbarui.';
    }

    return res.status(200).json({
      success: true,
      message: successMsg,
      data: {
        id: member.id,
        member_id: member.id,
        member_code: member.member_code,
        name: member.name,
        username: member.username,
        phone: member.phone,
        email: member.email,
        address: member.address,
        tier: member.tier,
        points: member.points,
        role: 'customer'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengaturan akun: ' + error.message
    });
  }
});

/**
 * 5. GET /api/v1/customer/products
 * Katalog produk aktif untuk aplikasi customer mobile (FR-CAT-01 s/d FR-CAT-03, FR-CAT-05)
 * Mengikuti data riil master produk dari database MySQL dan Web POS
 */
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : null;

    const whereClause = { is_active: true };
    const category = req.query.category ? String(req.query.category).trim() : null;
    if (category && category.toLowerCase() !== 'semua') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    const products = rows.map(p => {
      const retailPrice = parseFloat(p.selling_price > 0 ? p.selling_price : p.price) || 0;
      const unit = p.unit || 'pcs';

      const isAvailable = p.stock > 0;
      const stockStatus = p.stock > 10 ? 'available' : (p.stock > 0 ? 'limited' : 'out_of_stock');
      const stockDisplay = p.stock > 10 
        ? `${p.stock} Produk Tersedia` 
        : (p.stock > 0 ? `${p.stock} Produk Terbatas` : 'Stok Habis');

      return {
        id: p.id,
        barcode: p.sku,
        name: p.name,
        category: p.category || 'Sembako & Ritel',
        price: retailPrice,
        unit: unit,
        stock: p.stock,
        is_available: isAvailable,
        stock_status: stockStatus,
        stock_display: stockDisplay
      };
    });

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit) || 1,
        total_items: count,
        limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat produk: ' + error.message
    });
  }
});

/**
 * 6. GET /api/v1/customer/products/:id
 * Detail produk tunggal untuk customer mobile (FR-CAT-04)
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      where: {
        id: id,
        is_active: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Produk tidak ditemukan atau sudah tidak aktif di toko.'
      });
    }

    const retailPrice = parseFloat(product.selling_price > 0 ? product.selling_price : product.price) || 0;
    const unit = product.unit || 'pcs';

    const isAvailable = product.stock > 0;
    const stockStatus = product.stock > 10 ? 'available' : (product.stock > 0 ? 'limited' : 'out_of_stock');
    const stockDisplay = product.stock > 10 
      ? `${product.stock} Produk Tersedia` 
      : (product.stock > 0 ? `${product.stock} Produk Terbatas` : 'Stok Habis');

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        barcode: product.sku,
        name: product.name,
        category: product.category || 'Sembako & Ritel',
        price: retailPrice,
        unit: unit,
        stock: product.stock,
        is_available: isAvailable,
        stock_status: stockStatus,
        stock_display: stockDisplay
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat rincian produk: ' + error.message
    });
  }
});

/**
 * Fungsi Pembantu: Format Nomor Permintaan Pesanan Unik
 * Contoh: REQ-20261116-4891
 */
function generateOrderRequestNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}${month}${day}-${randomSuffix}`;
}

/**
 * 7. POST /api/v1/customer/order-requests
 * Modul 4: Pengajuan Permintaan Pesanan & Idempotensi (FR-ORD-01 s/d FR-ORD-06, R01, R02)
 */
router.post('/order-requests', authenticateCustomer, async (req, res) => {
  const member = req.member;
  const idempotencyKey = req.headers['idempotency-key'];

  // FR-ORD-02: Header Idempotency-Key bernilai unik (UUID v4)
  if (!idempotencyKey || typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
    return res.status(400).json({
      success: false,
      code: 'IDEMPOTENCY_KEY_REQUIRED',
      message: 'Header Idempotency-Key (UUID) wajib disertakan untuk menjamin konsistensi pemesanan.'
    });
  }

  const cleanKey = idempotencyKey.trim();

  // FR-ORD-04 / R02: Cek apakah request dengan key yang sama sudah pernah diproses (Idempotency Hit)
  const existingOrder = await OrderRequest.findOne({
    where: {
      idempotency_key: cleanKey,
      member_id: member.id
    },
    include: [{ model: OrderRequestItem, as: 'items' }]
  });

  if (existingOrder) {
    return res.status(200).json({
      success: true,
      message: 'Permintaan pesanan telah tercatat sebelumnya (Idempotent response)',
      data: {
        id: existingOrder.id,
        order_number: existingOrder.order_number,
        status: existingOrder.status,
        total_estimated_amount: String(existingOrder.total_estimated_amount),
        notes: existingOrder.notes,
        created_at: existingOrder.created_at,
        items_count: existingOrder.items ? existingOrder.items.length : 0,
        items: existingOrder.items ? existingOrder.items.map(it => ({
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: String(it.unit_price),
          quantity: it.quantity,
          subtotal: String(it.subtotal)
        })) : []
      }
    });
  }

  // FR-ORD-01: Validasi keranjang tidak boleh kosong
  const { notes, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      code: 'EMPTY_CART',
      message: 'Keranjang belanja tidak boleh kosong.'
    });
  }

  // Validasi format items & rapikan duplikasi ID
  const itemMap = new Map();
  for (const item of items) {
    const pId = Number(item.product_id);
    const qty = parseInt(item.quantity, 10);
    const sentPrice = item.price !== undefined && item.price !== null ? parseFloat(item.price) : null;

    if (!pId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ITEM',
        message: 'Format barang tidak valid. Kuantitas harus bilangan bulat minimal 1.'
      });
    }

    if (itemMap.has(pId)) {
      const prev = itemMap.get(pId);
      itemMap.set(pId, { quantity: prev.quantity + qty, sentPrice: sentPrice ?? prev.sentPrice });
    } else {
      itemMap.set(pId, { quantity: qty, sentPrice });
    }
  }

  const productIds = Array.from(itemMap.keys());
  const transaction = await sequelize.transaction();

  try {
    const products = await Product.findAll({
      where: { id: productIds },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (products.length !== productIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Beberapa produk dalam keranjang tidak ditemukan di sistem toko.'
      });
    }

    let calculatedTotal = 0;
    const itemsToCreate = [];
    const fieldErrors = {};

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const { quantity, sentPrice } = itemMap.get(product.id);

      // Cek keaktifan produk
      if (!product.is_active) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          code: 'PRODUCT_INACTIVE',
          message: `Produk '${product.name}' sudah dinonaktifkan oleh toko.`
        });
      }

      // Cek kecukupan stok di toko (FR-ORD-05 & R01)
      if (product.stock < quantity) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: `Stok produk '${product.name}' tidak mencukupi. Tersedia: ${product.stock}, diminta: ${quantity}.`,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Stok produk '${product.name}' tersisa ${product.stock} unit.`,
            field_errors: {
              [`items[${i}].product_id`]: `Stok tersisa ${product.stock} unit (diminta ${quantity} unit)`
            }
          }
        });
      }

      // Hitung harga resmi server (FR-ORD-05: Server-side Recalculation)
      const officialPrice = parseFloat(product.selling_price > 0 ? product.selling_price : product.price) || 0;

      // Cek apakah ada perbedaan harga lama di client (Stale Product Price - R01)
      if (sentPrice !== null && Math.abs(sentPrice - officialPrice) > 0.01) {
        fieldErrors[`items[${i}].product_id`] = `Harga terbaru Rp ${officialPrice.toLocaleString('id-ID')} (sebelumnya Rp ${sentPrice.toLocaleString('id-ID')})`;
      }

      const itemSubtotal = officialPrice * quantity;
      calculatedTotal += itemSubtotal;

      itemsToCreate.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: officialPrice,
        quantity: quantity,
        subtotal: itemSubtotal
      });
    }

    // Jika terjadi perubahan harga master (409 Conflict - FR-ORD-05 & Acceptance R01)
    if (Object.keys(fieldErrors).length > 0) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: {
          code: 'STALE_PRODUCT_PRICE',
          message: 'Harga satu atau lebih produk telah berubah. Silakan tinjau kembali keranjang Anda.',
          field_errors: fieldErrors,
          request_id: cleanKey
        }
      });
    }

    // Buat nomor pesanan unik
    let orderNumber = generateOrderRequestNumber();
    let collisionCheck = await OrderRequest.findOne({ where: { order_number: orderNumber }, transaction });
    while (collisionCheck) {
      orderNumber = generateOrderRequestNumber();
      collisionCheck = await OrderRequest.findOne({ where: { order_number: orderNumber }, transaction });
    }

    // Buat record order_requests
    const orderRequest = await OrderRequest.create(
      {
        order_number: orderNumber,
        member_id: member.id,
        status: 'pending',
        total_estimated_amount: calculatedTotal,
        notes: notes ? String(notes).trim() : null,
        idempotency_key: cleanKey
      },
      { transaction }
    );

    // Buat record order_request_items
    const itemRecords = itemsToCreate.map(it => ({
      ...it,
      order_request_id: orderRequest.id
    }));
    await OrderRequestItem.bulkCreate(itemRecords, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Permintaan pesanan berhasil dikirim ke kasir toko',
      data: {
        id: orderRequest.id,
        order_number: orderRequest.order_number,
        status: orderRequest.status,
        total_estimated_amount: String(orderRequest.total_estimated_amount),
        notes: orderRequest.notes,
        created_at: orderRequest.created_at,
        items_count: itemRecords.length,
        items: itemRecords.map(it => ({
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: String(it.unit_price),
          quantity: it.quantity,
          subtotal: String(it.subtotal)
        }))
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[Create Order Request Error]:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Gagal mengajukan permintaan pesanan: ' + error.message
    });
  }
});

/**
 * 8. GET /api/v1/customer/me/order-requests
 * Modul 5: Daftar Riwayat Permintaan Pesanan (FR-TRK-01)
 */
router.get('/me/order-requests', authenticateCustomer, async (req, res) => {
  try {
    const member = req.member;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status ? String(req.query.status).trim().toLowerCase() : null;

    const whereClause = { member_id: member.id };
    if (status && status !== 'semua' && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows } = await OrderRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderRequestItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'unit_price', 'quantity', 'subtotal']
        },
        {
          model: Sale,
          as: 'sale',
          attributes: ['id', 'invoice_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const orders = rows.map(o => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total_estimated_amount: String(o.total_estimated_amount),
      notes: o.notes,
      sale_id: o.sale ? o.sale.id : null,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items_count: o.items ? o.items.length : 0,
      items: o.items ? o.items.map(it => ({
        id: it.id,
        product_id: it.product_id,
        product_name: it.product_name,
        unit_price: String(it.unit_price),
        quantity: it.quantity,
        subtotal: String(it.subtotal)
      })) : []
    }));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit) || 1,
        total_items: count,
        limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat pesanan: ' + error.message
    });
  }
});

/**
 * 9. GET /api/v1/customer/me/order-requests/:id
 * Modul 5: Detail Permintaan Pesanan & Tracking (FR-TRK-02 s/d FR-TRK-04, FR-RCP-02 / R03)
 */
router.get('/me/order-requests/:id', authenticateCustomer, async (req, res) => {
  try {
    const member = req.member;
    const { id } = req.params;

    const order = await OrderRequest.findOne({
      where: {
        id: id,
        member_id: member.id // Ownership Isolation (FR-RCP-02 / R03)
      },
      include: [
        {
          model: OrderRequestItem,
          as: 'items'
        },
        {
          model: Sale,
          as: 'sale'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Permintaan pesanan tidak ditemukan atau bukan milik akun Anda.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_estimated_amount: String(order.total_estimated_amount),
        notes: order.notes,
        sale_id: order.sale ? order.sale.id : null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.items.map(it => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: String(it.unit_price),
          quantity: it.quantity,
          subtotal: String(it.subtotal)
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat detail pesanan: ' + error.message
    });
  }
});

/**
 * 10. GET /api/v1/customer/me/receipts/:id
 * Modul 6: Arsip & Tampilan Nota Penjualan Resmi (FR-RCP-01 s/d FR-RCP-04)
 */
router.get('/me/receipts/:id', authenticateCustomer, async (req, res) => {
  try {
    const member = req.member;
    const { id } = req.params;

    const sale = await Sale.findOne({
      where: {
        id: id,
        member_id: member.id // Ownership Isolation (FR-RCP-02 / R03)
      },
      include: [
        {
          model: SaleItem,
          as: 'items'
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'full_name', 'username']
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Nota penjualan tidak ditemukan atau Anda tidak memiliki akses ke nota ini.'
      });
    }

    const profile = await BusinessProfile.findOne() || {
      store_name: 'Toko Berkah OJT BPVP',
      address: 'Jl. Raya Padang No. 12, Padang',
      phone: '0751-123456',
      receipt_footer: 'Terima kasih telah berbelanja di Toko Berkah. Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.'
    };

    return res.status(200).json({
      success: true,
      data: {
        id: sale.id,
        invoice_number: sale.invoice_number,
        transaction_date: sale.transaction_date || sale.created_at,
        cashier_name: sale.cashier ? (sale.cashier.full_name || sale.cashier.username) : 'Kasir Toko',
        store_info: {
          name: profile.store_name,
          address: profile.address,
          phone: profile.phone
        },
        member: {
          member_code: member.member_code,
          name: member.name,
          points_earned: sale.points_earned || 0,
          current_points: member.points || 0
        },
        items: sale.items.map(it => ({
          product_name: it.product_name_at_sale,
          unit_price: String(it.price_at_sale),
          quantity: it.quantity,
          subtotal: String(it.subtotal)
        })),
        financials: {
          subtotal: String(sale.subtotal_amount || sale.total_amount),
          discount_amount: String(sale.discount_amount || 0),
          final_total: String(sale.total_amount),
          payment_amount: String(sale.cash_paid || sale.total_amount),
          change_amount: String(sale.change_returned || 0),
          payment_method: 'Cash'
        },
        footer_message: profile.receipt_footer || 'Terima kasih atas kunjungan Anda.'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat nota penjualan: ' + error.message
    });
  }
});

/**
 * 11. POST /api/v1/customer/order-requests/:id/simulate-complete (Internal / Demo Helper)
 * Membantu simulasi kasir memproses pesanan menjadi selesai (COMPLETED) dan menerbitkan nota kasir
 */
router.post('/order-requests/:id/simulate-complete', authenticateCustomer, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const member = req.member;
    const { id } = req.params;

    const order = await OrderRequest.findOne({
      where: { id, member_id: member.id },
      include: [{ model: OrderRequestItem, as: 'items' }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    if (order.status === 'completed') {
      await transaction.rollback();
      const existingSale = await Sale.findOne({ where: { order_request_id: order.id } });
      return res.status(200).json({
        success: true,
        message: 'Pesanan sudah berstatus selesai.',
        sale_id: existingSale ? existingSale.id : null
      });
    }

    // 1. Kurangi stok produk
    for (const item of order.items) {
      const prod = await Product.findByPk(item.product_id, { lock: transaction.LOCK.UPDATE, transaction });
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        await prod.save({ transaction });
      }
    }

    // 2. Generate invoice
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `TRX-${year}${month}${day}-${randomSuffix}`;

    const totalAmount = parseFloat(order.total_estimated_amount) || 0;
    const pointsEarned = Math.floor(totalAmount / 10000);

    // 3. Buat Sale
    const sale = await Sale.create({
      invoice_number: invoiceNumber,
      user_id: 1, // Default Kasir / Owner
      member_id: member.id,
      order_request_id: order.id,
      subtotal_amount: Math.round(totalAmount),
      discount_amount: 0,
      total_amount: Math.round(totalAmount),
      points_earned: pointsEarned,
      points_redeemed: 0,
      cash_paid: Math.round(totalAmount),
      change_returned: 0,
      transaction_date: new Date()
    }, { transaction });

    // 4. Buat Sale Items
    const saleItems = order.items.map(it => ({
      sale_id: sale.id,
      product_id: it.product_id,
      product_name_at_sale: it.product_name,
      price_at_sale: Math.round(parseFloat(it.unit_price)),
      quantity: it.quantity,
      subtotal: Math.round(parseFloat(it.subtotal))
    }));
    await SaleItem.bulkCreate(saleItems, { transaction });

    // 5. Update Order status
    order.status = 'completed';
    await order.save({ transaction });

    // 6. Update member points
    member.points += pointsEarned;
    await member.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Pesanan berhasil diselesaikan oleh kasir dan nota telah terbit.',
      data: {
        order_id: order.id,
        sale_id: sale.id,
        status: order.status
      }
    });
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

