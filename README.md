# P01 • Aplikasi Kasir dan Stok Toko (Point of Sale & Inventory System)
## Enterprise Authentication, Authorization & User Access Management
**Program**: On-the-Job Training (OJT) Fullstack Web Developer 2026  
**Penyelenggara**: PT Flash Tech Indonesia & BPVP Padang  
**Penanggung Jawab (PIC)**: Rizqon Nauval Zaloni  

---

## 1. Ringkasan Proyek & Arsitektur Keamanan

Aplikasi **P01 • Kasir dan Stok Toko** adalah sistem POS dan inventaris toko berbasis web production-ready dengan skema otentikasi JWT enterprise, kontrol akses berbasis peran (RBAC - Role-Based Access Control) yang ditegakkan secara otoritatif di sisi server, serta integritas transaksi database ACID menggunakan MySQL dan Sequelize ORM.

### Arsitektur Autentikasi & Sesi
- **Access Token**: Short-lived JWT (15 menit) disimpan murni di memory frontend (tidak pernah disimpan di `localStorage` atau `sessionStorage` untuk mencegah pencurian token via XSS).
- **Refresh Token**: Long-lived JWT (7 hari) disimpan dalam cookie browser `HttpOnly, Secure (pada HTTPS production), SameSite=Lax/Strict`.
- **Token Rotation & Anti-Reuse**: Setiap penggunaan refresh token menghasilkan token baru, dan hash token dicatat dalam tabel `user_sessions`. Deteksi penggunaan ganda (*token reuse*) secara otomatis membatalkan seluruh sesi aktif pengguna.
- **Immediate Revocation**: Ketika akun pengguna dinonaktifkan atau password direset oleh pemilik toko, seluruh sesi aktif pengguna langsung dicabut seketika.
- **Deny-by-Default RBAC**: Setiap route dan resource dilindungi middleware `authenticateToken` dan `authorizeRoles(['owner'])`.

---

## 2. Kredensial Akun Bawaan (Default Seed Data)

Database telah dilengkapi seeder akun awal untuk pengujian peran:

| Peran (Role) | Username | Password | Hak Akses Utama |
|---|---|---|---|
| **Pemilik Toko (Owner)** | `owner` | `Owner123!` | Akses penuh: Dashboard, Master Produk, Stok Masuk, Kasir POS, Riwayat Penjualan Lengkap, Kelola Pengguna, Profil Toko. |
| **Kasir (Cashier)** | `cashier` | `Cashier123!` | Akses terbatas: Kasir POS, Katalog (baca saja), Riwayat Penjualan Hari Ini, Cetak Nota. Ditolak dari menu master dan laporan keuangan. |

---

## 3. Matriks Hak Akses (Role-Based Access Control)

| Fitur / Modul | Endpoint API | Pemilik (`owner`) | Kasir (`cashier`) | Mekanisme Proteksi |
|---|---|:---:|:---:|---|
| **Login Pengguna** | `POST /api/auth/login` | ✅ Ya | ✅ Ya | Rate Limiter, Bcrypt verify |
| **Silent Refresh Token** | `POST /api/auth/refresh` | ✅ Ya | ✅ Ya | HttpOnly Cookie, Session DB |
| **Logout & Cabut Sesi** | `POST /api/auth/logout` | ✅ Ya | ✅ Ya | Invalidation DB, Clear Cookie |
| **Profil Toko (Baca)** | `GET /api/business-profile` | ✅ Ya | ✅ Ya | `authenticateToken` |
| **Ubah Profil Toko** | `PUT /api/business-profile` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Lihat Katalog Produk** | `GET /api/products` | ✅ Ya | ✅ Ya | `authenticateToken` |
| **Tambah Produk Master** | `POST /api/products` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Edit Nama & Harga Produk**| `PUT /api/products/:id` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Arsipkan Produk (Soft)** | `PATCH /api/products/:id/status` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Formulir Stok Masuk** | `POST /api/stock-movements` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Jurnal Audit Stok** | `GET /api/stock-movements` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Checkout Transaksi Kasir**| `POST /api/sales/checkout` | ✅ Ya | ✅ Ya | ACID `transaction` & Row Lock |
| **Riwayat Penjualan** | `GET /api/sales` | ✅ Semua | ⚠️ Hari Ini Saja | Filter tanggal di backend |
| **Cetak Ulang Nota** | `GET /api/sales/:id` | ✅ Ya | ✅ Ya | Snapshot item immutability |
| **Dashboard Rekap Omset** | `GET /api/reports/daily-summary`| ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Kelola Akun & Hak Akses**| `/api/users/*` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Loyalty Member (Lihat & Daftar)**| `GET / POST /api/members` | ✅ Ya | ✅ Ya | `authenticateToken` |
| **Penyesuaian Poin Manual**| `POST /api/members/:id/adjust-points` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |
| **Ubah Status / Hapus Member**| `PATCH / DELETE /api/members/:id` | ✅ Ya | ❌ Ditolak | `authorizeRoles('owner')` |

---

## 4. Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js v18 atau v20+
- MySQL Server 8.0 aktif (XAMPP / MySQL Service)
- Port 5000 (Backend) dan Port 5173 (Frontend) bebas

### Langkah 1: Setup Backend
```bash
cd backend
npm install

# Sesuaikan konfigurasi DB pada file .env jika MySQL Anda memiliki password:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=pos_kasir_stok
# DB_USER=root
# DB_PASSWORD=

# Jalankan Seeder Database (Otomatis membuat DB & tabel jika belum ada)
npm run seed

# Jalankan Backend Server
npm run dev
# Server aktif pada http://localhost:5000
```

### Langkah 2: Setup Frontend
Buka terminal baru:
```bash
cd frontend
npm install

# Jalankan Vite Development Server
npm run dev
# Aplikasi terbuka pada http://localhost:5173
```

---

## 5. Menjalankan Menggunakan Docker Compose

Jika menggunakan Docker:
```bash
# Di direktori utama proyek:
docker-compose up -d --build

# Buka browser pada:
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000/api
```

---

## 6. Verifikasi 5 Skenario Mutlak (A01 - A05)

1. **Skenario A01: Uji Perhitungan Normal & Pemotongan Stok Atomik**
   - Kasir memilih 2 unit Beras (Rp68.000) = Rp136.000. Bayar Rp150.000.
   - Kembalian dihitung akurat di sisi server (Rp14.000). Stok berkurang atomik.
2. **Skenario A02: Concurrency & Proteksi Stok Minus**
   - Transaksi dibungkus `SELECT ... FOR UPDATE`. Jika sisa stok 1 dan ada 2 kasir checkout bersamaan, request kedua otomatis ditolak dengan `400 Bad Request: Stok tidak mencukupi`. Sisa stok tetap 0 (tidak pernah minus).
3. **Skenario A03: Atomicity & Anti-Double Submission**
   - Rollback database otomatis jika terdapat kendala sistem saat insert. Tombol checkout dinonaktifkan saat pengiriman untuk mencegah pembuatan nota ganda.
4. **Skenario A04: RBAC & Snapshot Immutabilitas Harga Historis**
   - Kasir menembak endpoint owner -> Ditolak `403 Forbidden`.
   - Pemilik menaikkan harga master beras menjadi Rp75.000. Buka kembali riwayat faktur lama -> Harga tetap tercatat Rp68.000 sesuai snapshot permanen pada `sale_items`.
5. **Skenario A05: Loyalty Member, Diskon Poin, Pengali Tier & Jejak Audit**
   - Kasir memilih member di meja kasir, menukar 50 Poin (Diskon Rp 5.000 dengan valuasi 1 Poin = Rp 100).
   - Perolehan poin baru dihitung dari nilai belanja bersih setelah diskon dikalikan rasio tier member.
   - Kenaikan tier dievaluasi otomatis (*auto-upgrade*), dan setiap mutasi poin tercatat permanen di buku besar audit `member_point_histories`.

---

## 7. Dokumentasi Lengkap Proyek

- [PRD (Product Requirement Document)](./PRD_P01_Kasir_dan_Stok_Toko.md): Spesifikasi lengkap kebutuhan sistem, alur bisnis, ERD database, data dictionary, kontrak API, dan skenario pengujian.
- [Panduan Belajar & Arsitektur Kode](./PANDUAN_BELAJAR_DAN_ARSITEKTUR_KODE.md): Panduan komprehensif konsep analogi, arsitektur kode frontend & backend baris-per-baris, modal dialog panduan kasir, dan tutorial penggunaan.
- [Dokumen Word Cetak (DOCX)](./PANDUAN_BELAJAR_DAN_KODE_LENGKAP.docx): Dokumen cetak laporan OJT lengkap siap saji.
