# 📚 Dokumentasi Proyek P01 • POS & Manajemen Inventori Usaha

Selamat datang di pusat dokumentasi resmi **Proyek P01 (Point of Sale, Inventory Management, & Loyalty Member System)**.

Dokumentasi ini disusun khusus untuk peserta magang, pengembang (*developer*), dan pengguna (*user/operator*) guna memahami cara pengoperasian sistem, alur kerja arsitektur perangkat lunak, serta panduan membedah dan mempelajari kode program.

---

## 🗂️ Struktur Navigasi Dokumentasi

Dokumentasi ini dibagi menjadi 3 bagian utama yang saling melengkapi:

| No | Modul Dokumentasi | Deskripsi Singkat | Tautan Dokumen |
|:---:|:---|:---|:---|
| 1 | **Panduan Penggunaan Aplikasi** | Panduan operasional langkah demi langkah bagi Kasir dan Pemilik Toko (*Owner*), mencakup transaksi POS, loyalty member, stok masuk, hingga cetak nota. | [Buka Panduan Penggunaan](./01-panduan-penggunaan.md) |
| 2 | **Alur Kerja Fitur & Sistem** | Penjelasan arsitektur perangkat lunak, diagram alir proses (Auth JWT & RBAC, transaksi atomik kasir, kalkulasi poin loyalty, dan skema database). | [Buka Alur Kerja Sistem](./02-alur-kerja-sistem.md) |
| 3 | **Panduan Belajar Kode Proyek** | Panduan membedah kode sumber (*source code*) Backend Express & Sequelize, Frontend React & Tailwind CSS, komponen kunci, dan tips *debugging*. | [Buka Panduan Belajar Kode](./03-panduan-belajar-kode.md) |

---

## 🚀 Petunjuk Cepat Menjalankan Aplikasi (*Quick Start*)

### 1. Menjalankan Backend API
```bash
# 1. Pindah ke direktori backend
cd backend

# 2. Salin konfigurasi environment (jika belum ada)
# Pastikan konfigurasi DB_NAME, DB_USER, DB_PASSWORD di file .env sesuai MySQL Anda

# 3. Jalankan migrasi dan seeder awal (opsional jika database masih kosong)
npm run seed

# 4. Jalankan server backend (port 5000)
npm run dev
```

### 2. Menjalankan Frontend React
```bash
# 1. Buka terminal baru dan pindah ke direktori frontend
cd frontend

# 2. Jalankan server pengembangan Vite (port 5173)
npm run dev
```

### 3. Akun Pengguna Bawaan (*Default Accounts*)

| Peran (*Role*) | Username | Password | Hak Akses Utama |
|---|---|---|---|
| **Pemilik Toko (Owner)** | `owner` | `Owner123!` | Akses Penuh: Dashboard, Master Produk, Stok Masuk, Loyalty Member, Riwayat Penjualan, Kelola Pengguna, dan Profil Toko. |
| **Kasir (Cashier)** | `cashier` | `Cashier123!` | Akses Kasir: Transaksi Kasir POS, Loyalty Member (Pencarian & Pendaftaran), dan Riwayat Penjualan Hari Ini. |

---

> [!TIP]
> Jika Anda adalah programmer baru atau peserta magang, mulailah membaca dari **[01-panduan-penggunaan.md](./01-panduan-penggunaan.md)** untuk memahami kebutuhan bisnis, lalu lanjutkan ke **[02-alur-kerja-sistem.md](./02-alur-kerja-sistem.md)** dan **[03-panduan-belajar-kode.md](./03-panduan-belajar-kode.md)**.
