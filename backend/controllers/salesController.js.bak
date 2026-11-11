// ==============================================================================
// FILE: controllers/salesController.js
// DESKRIPSI: Pengendali transaksi kasir (POS Checkout) dan riwayat penjualan.
// Menerapkan prinsip ACID Transaction dan Row Locking agar stok akurat dan tidak minus.
// ==============================================================================

const { Op } = require('sequelize');
const { sequelize, Sale, SaleItem, Product, User, BusinessProfile, Member, MemberPointHistory } = require('../models');

/**
 * Fungsi Pembantu: Membuat nomor nota faktur otomatis
 * Format: TRX-YYYYMMDD-XXXX (contoh: TRX-20261027-4821)
 */
function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  // Menghasilkan 4 digit angka acak (1000 - 9999)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Controller: checkout
 * POST /api/sales/checkout
 * Dapat diakses oleh: Owner dan Cashier
 * Fungsi utama kasir saat memproses transaksi pembayaran belanjaan pembeli dengan dukungan Loyalty Member.
 */
async function checkout(req, res, next) {
  // LANGKAH 1: Buka Transaksi Database ACID
  // Transaksi memastikan: jika salah satu langkah gagal, semua perubahan dibatalkan (Rollback)
  const transaction = await sequelize.transaction();

  try {
    const { cash_paid, items, member_id, redeem_points } = req.body;

    // LANGKAH 2: Validasi dasar input keranjang belanja
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

    // LANGKAH 3: Rapikan dan kelompokkan item barang jika ada duplikasi ID
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

    // LANGKAH 4: Ambil produk dari MySQL dengan Kunci Baris (SELECT ... FOR UPDATE)
    // Ini mengunci baris produk agar kasir lain harus mengantre jika membeli barang yang sama
    const products = await Product.findAll({
      where: { id: productIds },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    // Pastikan semua produk yang ada di keranjang benar-benar terdaftar di database
    if (products.length !== productIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Beberapa produk dalam keranjang belanja tidak ditemukan di database.'
      });
    }

    // LANGKAH 5: Validasi status produk, kecukupan stok, dan hitung total kotor di sisi SERVER
    let calculatedTotal = 0;
    const saleItemsPayload = [];

    for (const product of products) {
      const requestedQty = itemMap.get(product.id);

      // Cek apakah produk sedang diarsipkan/non-aktif
      if (!product.is_active) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Produk '${product.name}' sudah dinonaktifkan dan tidak dapat ditransaksikan.`
        });
      }

      // Cek apakah stok fisik mencukupi (Mencegah stok menjadi minus)
      if (product.stock < requestedQty) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok produk '${product.name}' tidak mencukupi. Tersedia: ${product.stock}, diminta: ${requestedQty}.`
        });
      }

      // Hitung subtotal produk
      const itemSubtotal = product.price * requestedQty;
      calculatedTotal += itemSubtotal;

      // Siapkan snapshot data untuk tabel sale_items
      saleItemsPayload.push({
        product_id: product.id,
        product_name_at_sale: product.name,
        price_at_sale: product.price,
        quantity: requestedQty,
        subtotal: itemSubtotal
      });

      // Kurangi stok produk di memori
      product.stock -= requestedQty;
    }

    // LANGKAH 6: Proses Loyalty Member (Validasi, Penukaran Poin Diskon, & Perolehan Poin)
    let member = null;
    let discountAmount = 0;
    let pointsToRedeem = 0;
    let pointsEarned = 0;

    if (member_id) {
      // Kunci data member untuk mencegah balapan penukaran poin ganda (Pessimistic Locking)
      member = await Member.findByPk(Number(member_id), {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!member) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Loyalty member yang dipilih tidak ditemukan di sistem.'
        });
      }

      if (!member.is_active) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Member '${member.name}' berstatus non-aktif dan tidak dapat digunakan.`
        });
      }

      // Hitung diskon dari penukaran poin (1 Poin = Rp 100 diskon)
      pointsToRedeem = parseInt(redeem_points, 10) || 0;
      if (pointsToRedeem > 0) {
        if (pointsToRedeem > member.points) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Poin member tidak mencukupi untuk ditukar. Saldo tersedia: ${member.points} poin, diminta: ${pointsToRedeem} poin.`
          });
        }

        discountAmount = pointsToRedeem * 100;
        // Diskon tidak boleh melebihi total belanja kotor
        if (discountAmount > calculatedTotal) {
          discountAmount = calculatedTotal;
          pointsToRedeem = Math.ceil(discountAmount / 100);
        }
      }
    }

    // Hitung Total Bersih (Net Total) setelah diskon loyalty
    const finalTotal = Math.max(0, calculatedTotal - discountAmount);

    // Hitung perolehan poin belanja member (Berdasarkan Net Total belanja aktual)
    if (member && finalTotal > 0) {
      // Pengali poin berdasarkan Tier Member
      // Bronze: 1x, Silver: 1.2x, Gold: 1.5x, Platinum: 2x
      const multiplierMap = {
        Bronze: 1.0,
        Silver: 1.2,
        Gold: 1.5,
        Platinum: 2.0
      };
      const multiplier = multiplierMap[member.tier] || 1.0;
      pointsEarned = Math.floor((finalTotal / 10000) * multiplier);
    }

    // LANGKAH 7: Validasi apakah uang pembayaran kasir cukup
    if (parsedCashPaid < finalTotal) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Uang tunai tidak mencukupi. Total tagihan: Rp${finalTotal.toLocaleString('id-ID')}, Uang diserahkan: Rp${parsedCashPaid.toLocaleString('id-ID')}.`
      });
    }

    // Hitung uang kembalian
    const changeReturned = parsedCashPaid - finalTotal;

    // LANGKAH 8: Simpan pengurangan stok barang ke database MySQL
    for (const product of products) {
      await product.save({ transaction });
    }

    // LANGKAH 9: Buat nomor nota faktur yang unik
    let invoiceNumber = generateInvoiceNumber();
    let collisionCheck = await Sale.findOne({ where: { invoice_number: invoiceNumber }, transaction });
    while (collisionCheck) {
      invoiceNumber = generateInvoiceNumber();
      collisionCheck = await Sale.findOne({ where: { invoice_number: invoiceNumber }, transaction });
    }

    // LANGKAH 10: Simpan data nota penjualan (Sale)
    const sale = await Sale.create(
      {
        invoice_number: invoiceNumber,
        user_id: req.user.id,
        member_id: member ? member.id : null,
        subtotal_amount: calculatedTotal,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        points_earned: pointsEarned,
        points_redeemed: pointsToRedeem,
        cash_paid: parsedCashPaid,
        change_returned: changeReturned,
        transaction_date: new Date()
      },
      { transaction }
    );

    // LANGKAH 11: Simpan rincian barang nota (SaleItem)
    const itemRecords = saleItemsPayload.map((item) => ({
      ...item,
      sale_id: sale.id
    }));
    await SaleItem.bulkCreate(itemRecords, { transaction });

    // LANGKAH 12: Simpan mutasi poin & pembaruan total belanja member
    if (member) {
      // 12.1 Catat mutasi penukaran poin (REDEEM) jika ada
      if (pointsToRedeem > 0) {
        member.points -= pointsToRedeem;
        await MemberPointHistory.create(
          {
            member_id: member.id,
            sale_id: sale.id,
            type: 'REDEEM',
            points: -pointsToRedeem,
            balance_after: member.points,
            description: `Tukar ${pointsToRedeem} poin (Diskon Rp${discountAmount.toLocaleString('id-ID')}) pada nota ${invoiceNumber}`,
            created_by_user_id: req.user.id
          },
          { transaction }
        );
      }

      // 12.2 Catat mutasi perolehan poin belanja (EARN) jika ada
      if (pointsEarned > 0) {
        member.points += pointsEarned;
        await MemberPointHistory.create(
          {
            member_id: member.id,
            sale_id: sale.id,
            type: 'EARN',
            points: pointsEarned,
            balance_after: member.points,
            description: `Perolehan ${pointsEarned} poin dari transaksi belanja nota ${invoiceNumber}`,
            created_by_user_id: req.user.id
          },
          { transaction }
        );
      }

      // 12.3 Akumulasi total belanja seumur hidup (total_spent)
      member.total_spent = Number(member.total_spent || 0) + finalTotal;

      // 12.4 Kenaikan Tier Otomatis (Tier Progression)
      if (member.total_spent >= 15000000) {
        member.tier = 'Platinum';
      } else if (member.total_spent >= 5000000) {
        member.tier = 'Gold';
      } else if (member.total_spent >= 1000000) {
        member.tier = 'Silver';
      }

      await member.save({ transaction });
    }

    // LANGKAH 13: Simpan seluruh perubahan secara permanen (Commit)
    await transaction.commit();

    // LANGKAH 14: Ambil data lengkap nota beserta member dan profil toko untuk dicetak
    const populatedSale = await Sale.findByPk(sale.id, {
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] },
        { model: Member, as: 'member', attributes: ['id', 'member_code', 'name', 'phone', 'tier', 'points'] }
      ]
    });

    const storeProfile = await BusinessProfile.findOne();

    // Berikan respon sukses beserta data struk belanja
    return res.status(201).json({
      success: true,
      message: 'Transaksi checkout penjualan berhasil diselesaikan.',
      data: {
        sale: populatedSale,
        store: storeProfile
      }
    });
  } catch (error) {
    // Jika ada error apapun, batalkan semua transaksi
    await transaction.rollback();
    next(error);
  }
}

/**
 * Controller: getSales
 * GET /api/sales
 * Melihat riwayat penjualan.
 * Aturan: Kasir hanya boleh melihat transaksi hari ini, sedangkan Pemilik (Owner) boleh filter tanggal bebas.
 */
async function getSales(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (req.user.role === 'cashier') {
      // Pembatasan hak akses kasir: hanya melihat transaksi hari ini
      whereClause.transaction_date = {
        [Op.gte]: new Date(`${todayStr} 00:00:00`),
        [Op.lte]: new Date(`${todayStr} 23:59:59`)
      };
    } else {
      // Pemilik toko dapat memfilter sesuai tanggal yang dipilih
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
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] },
        { model: Member, as: 'member', attributes: ['id', 'member_code', 'name', 'phone', 'tier', 'points'] }
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
 * Controller: getSaleById
 * GET /api/sales/:id
 * Mengambil satu nota transaksi berdasarkan ID (untuk cetak ulang struk).
 */
async function getSaleById(req, res, next) {
  try {
    const saleId = Number(req.params.id);

    const sale = await Sale.findByPk(saleId, {
      include: [
        { model: SaleItem, as: 'items' },
        { model: User, as: 'cashier', attributes: ['id', 'username', 'full_name'] },
        { model: Member, as: 'member', attributes: ['id', 'member_code', 'name', 'phone', 'tier', 'points'] }
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
