// ==============================================================================
// FILE: server.js
// DESKRIPSI: Pusat utama (entry point) aplikasi backend Express.js.
// Bertugas mengatur middleware keamanan, rute API, dan menghubungkan ke database MySQL.
// ==============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Membaca file konfigurasi lingkungan (.env)
dotenv.config();

// Mengimpor koneksi database dan inisialisasi tabel Sequelize
const { sequelize, testAndInitDb } = require('./config/database');

// Mengimpor seluruh model database agar relasi antar tabel terdaftar otomatis
require('./models');

// Mengimpor middleware penanganan error dan pembatas request (rate limiter)
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { generalApiLimiter } = require('./middlewares/rateLimiter');

// Mengimpor rute-rute (Routes) modular untuk setiap fitur aplikasi
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const businessProfileRoutes = require('./routes/businessProfileRoutes');
const productRoutes = require('./routes/productRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportRoutes = require('./routes/reportRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ------------------------------------------------------------------------------
// 1. MIDDLEWARE KEAMANAN DASAR (Helmet & CORS)
// ------------------------------------------------------------------------------

// Helmet: Memasang header HTTP yang aman untuk melindungi server dari serangan umum
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS (Cross-Origin Resource Sharing):
// Membatasi agar hanya domain frontend resmi kita yang diizinkan mengakses API ini.
// 'credentials: true' wajib aktif agar cookie HttpOnly bisa dikirim antara frontend dan backend.
app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika request tanpa origin (seperti Postman, Curl, atau aplikasi mobile)
    if (!origin) return callback(null, true);

    // Izinkan origin frontend localhost atau yang tercatat di file .env
    const allowedOrigins = [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS ditolak: Domain ini tidak diizinkan mengakses backend.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ------------------------------------------------------------------------------
// 2. MIDDLEWARE PEMBACA DATA REQUEST (Body Parser & Cookie Parser)
// ------------------------------------------------------------------------------

// Membaca data JSON yang dikirim di body request (dibatasi maksimal 1MB)
app.use(express.json({ limit: '1mb' }));

// Membaca data form url-encoded
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Membaca cookie yang dikirim oleh browser (khususnya refresh_token)
app.use(cookieParser());

// ------------------------------------------------------------------------------
// 3. PEMBATAS JUMLAH PERMINTAAN (Rate Limiting)
// Mencegah serangan spam, DoS, atau brute-force ke server
// ------------------------------------------------------------------------------
app.use('/api', generalApiLimiter);

// ------------------------------------------------------------------------------
// 4. ENDPOINT CEK KESEHATAN SERVER (Health Check)
// Berguna untuk memastikan server sedang berjalan normal
// ------------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend POS Kasir & Stok berjalan dengan baik dan sehat.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ------------------------------------------------------------------------------
// 5. PENDAFTARAN RUTE API MODULAR
// Setiap fitur dipisah ke dalam file rute masing-masing agar rapi dan mudah dirawat
// ------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);                   // Login, refresh token, logout, ganti password
app.use('/api/users', userRoutes);                 // Kelola data kasir/admin (Owner only)
app.use('/api/business-profile', businessProfileRoutes); // Data profil toko & nama struk
app.use('/api/products', productRoutes);           // Katalog produk master & status aktif
app.use('/api/stock-movements', stockMovementRoutes); // Jurnal stok masuk barang
app.use('/api/sales', salesRoutes);                 // Checkout kasir & histori transaksi penjualan
app.use('/api/reports', reportRoutes);             // Laporan ringkasan omset harian
app.use('/api/members', memberRoutes);             // Modul loyalty member pelanggan & poin (Owner & Cashier)

// ------------------------------------------------------------------------------
// 6. PENANGANAN ERROR (Error Handlers)
// ------------------------------------------------------------------------------
app.use(notFoundHandler); // Jika URL tidak ditemukan (Error 404)
app.use(errorHandler);    // Jika ada error internal server (Error 500)

// ------------------------------------------------------------------------------
// 7. FUNGSI MENJALANKAN SERVER (Bootstrap Server)
// ------------------------------------------------------------------------------
async function startServer() {
  try {
    // Hubungkan dan inisialisasi database MySQL
    await testAndInitDb();

    // Sinkronisasi struktur tabel Sequelize dengan database MySQL
    await sequelize.sync();
    console.log('[Sequelize] Semua tabel database berhasil disinkronkan.');

    // Jalankan server Express pada port yang telah ditentukan
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 POS Kasir & Stok Server aktif di port: ${PORT}`);
      console.log(`📍 Mode Lingkungan: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Alamat Frontend yang Diizinkan: ${CLIENT_ORIGIN}`);
      console.log(`====================================================`);
    });

    return server;
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    process.exit(1);
  }
}

// Jalankan server jika file ini dieksekusi langsung
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
