# PANDUAN LENGKAP BELAJAR KODE PROGRAM & ARSITEKTUR APLIKASI
## Proyek P01 • Sistem Kasir & Manajemen Stok Toko (Point of Sale, Inventory, & Loyalty Member)
> **Level Pembelajaran**: Junior Programmer / Peserta Magang Fullstack Web Developer  
> **Penyelenggara**: PT Flash Tech Indonesia & BPVP Padang  
> **Penanggung Jawab (PIC)**: Rizqon Nauval Zaloni  
> **Bahasa Pengantar**: Bahasa Indonesia Santai, Jelas, dan Mudah Dipahami  

---

## DAFTAR ISI PEMBELAJARAN
1. [Tentang Projek Ini & Pengantar Santai](#1-tentang-projek-ini--pengantar-santai)
   - 1.1 [Profil & Latar Belakang Projek P01](#11-profil--latar-belakang-projek-p01)
   - 1.2 [Masalah Nyata Toko Ritel yang Diselesaikan](#12-masalah-nyata-toko-ritel-yang-diselesaikan)
   - 1.3 [Tech Stack & Standar Rekayasa Perangkat Lunak](#13-tech-stack--standar-rekayasa-perangkat-lunak)
2. [Peta Besar Sistem (Bagaimana Frontend & Backend Ngobrol)](#2-peta-besar-sistem)
3. [Konsep-Konsep Keren yang Wajib Kamu Pahami (Dengan Analogi Sehari-Hari)](#3-konsep-konsep-keren-yang-wajib-kamu-pahami)
   - 3.1 [Analogi Tiket Konser: Access Token & Refresh Token](#31-analogi-tiket-konser-access-token--refresh-token)
   - 3.2 [Analogi Kamar Pas: Kenapa Database Harus Dikunci (Row Locking)](#32-analogi-kamar-pas-kenapa-database-harus-dikunci-row-locking)
   - 3.3 [Analogi Kertas Struk Fisik: Snapshot Harga Historis](#33-analogi-kertas-struk-fisik-snapshot-harga-historis)
   - 3.4 [Analogi Kartu Akses Gedung: Role-Based Access Control (RBAC)](#34-analogi-kartu-akses-gedung-role-based-access-control-rbac)
   - 3.5 [Analogi Kartu Stempel Kedai Kopi: Arsitektur Modul Loyalty & Mutasi Poin](#35-analogi-kartu-stempel-kedai-kopi-arsitektur-modul-loyalty--mutasi-poin)
4. [Mengenal Database Kita (Ada 9 Tabel yang Saling Terhubung)](#4-mengenal-database-kita)
5. [Bedah Kode Backend (Langkah demi Langkah)](#5-bedah-kode-backend)
   - 5.1 [server.js - Pintu Gerbang Backend](#51-serverjs---pintu-gerbang-backend)
   - 5.2 [middlewares/auth.js - Satpam Pemeriksa Token & Role (RBAC)](#52-middlewaresauthjs---satpam-pemeriksa-token--role-rbac)
   - 5.3 [models/Member.js & models/MemberPointHistory.js - Model Loyalty Member](#53-modelsmemberjs--modelsmemberpointhistoryjs---model-loyalty-member)
   - 5.4 [controllers/memberController.js - Pengendali Modul Loyalty Member](#54-controllersmembercontrollerjs---pengendali-modul-loyalty-member)
   - 5.5 [controllers/salesController.js - Mesin Kasir & Checkout Atomik Terintegrasi Loyalty](#55-controllerssalescontrollerjs---mesin-kasir--checkout-atomik-terintegrasi-loyalty)
   - 5.6 [controllers/productController.js - Kelola Master Barang](#56-controllersproductcontrollerjs---kelola-master-barang)
   - 5.7 [controllers/stockMovementController.js - Buku Catatan Barang Masuk](#57-controllersstockmovementcontrollerjs---buku-catatan-barang-masuk)
   - 5.8 [controllers/authController.js - Login, Refresh, & Ganti Password](#58-controllersauthcontrollerjs---login-refresh--ganti-password)
6. [Bedah Kode Frontend (React, Vite, & Tailwind)](#6-bedah-kode-frontend)
   - 6.1 [src/api/axios.js - Kurir Pengantar Data Pintar](#61-srcapiaxiosjs---kurir-pengantar-data-pintar)
   - 6.2 [src/contexts/AuthContext.jsx - Kantong Data Status Login](#62-srccontextsauthcontextjsx---kantong-data-status-login)
   - 6.3 [src/components/Navbar.jsx & TopHeader.jsx - Navigasi Responsif](#63-srccomponentsnavbarjsx--topheaderjsx---navigasi-responsif)
   - 6.4 [src/pages/MembersPage.jsx - Layar Manajemen Loyalty Member & Analitik Poin](#64-srcpagesmemberspagejsx---layar-manajemen-loyalty-member--analitik-poin)
   - 6.5 [src/pages/CashierPage.jsx - Layar Kasir POS Terintegrasi Loyalty](#65-srcpagescashierpagejsx---layar-kasir-pos-terintegrasi-loyalty)
   - 6.6 [src/components/ReceiptModal.jsx - Kertas Struk Thermal Siap Cetak](#66-srccomponentsreceiptmodaljsx---kertas-struk-thermal-siap-cetak)
7. [Tutorial Lengkap Penggunaan Aplikasi (Langkah demi Langkah)](#7-tutorial-lengkap-penggunaan-aplikasi-langkah-demi-langkah)
   - 7.1 [Tutorial 1: Setup Lingkungan & Database (Seed Data)](#tutorial-1-setup-lingkungan--database-seed-data)
   - 7.2 [Tutorial 2: Transaksi Kasir POS & Cetak Struk Thermal](#tutorial-2-transaksi-kasir-pos--cetak-struk-thermal)
   - 7.3 [Tutorial 3: Pendaftaran Cepat Member Baru di Meja Kasir](#tutorial-3-pendaftaran-cepat-member-baru-di-meja-kasir)
   - 7.4 [Tutorial 4: Belanja Member & Penukaran Diskon Poin](#tutorial-4-belanja-member--penukaran-diskon-poin)
   - 7.5 [Tutorial 5: Monitoring Analitik & Penyesuaian Poin Manual (Owner)](#tutorial-5-monitoring-analitik--penyesuaian-poin-manual-owner)
   - 7.6 [Tutorial 6: Manajemen Stok Masuk Gudang & Master Produk](#tutorial-6-manajemen-stok-masuk-gudang--master-produk)
8. [Panduan Pengujian 5 Skenario Mutlak Sistem](#8-panduan-pengujian-5-skenario-mutlak-sistem)
9. [Tips Belajar & Cara Menelusuri Bug untuk Junior](#9-tips-belajar--cara-menelusuri-bug-untuk-junior)

---

## 1. Tentang Projek Ini & Pengantar Santai

### 1.1 Profil & Latar Belakang Projek P01
Proyek **P01 • Sistem Kasir, Manajemen Stok Toko & Loyalty Member** adalah aplikasi web enterprise skala menengah yang dirancang sebagai kurikulum resmi pelatihan kerja **On-the-Job Training (OJT) Fullstack Web Developer 2026**.

| Informasi Proyek | Detail Keterangan |
|---|---|
| **Program Resmi** | Pelatihan Berbasis Kompetensi OJT Fullstack Web Developer 2026 |
| **Penyelenggara** | PT Flash Tech Indonesia bekerja sama dengan BPVP Padang |
| **Penanggung Jawab (PIC)** | Rizqon Nauval Zaloni |
| **Target Pembelajaran** | Programmer Pemula / Junior Web Developer |
| **Kategori Sistem** | Point of Sale (POS), Real-time Inventory Management, & Customer Loyalty Program |
| **Kesiapan Sistem** | Production-Grade, Dual-Token Security, Pessimistic Row Lock, ACID Transaction |

### 1.2 Masalah Nyata Toko Ritel yang Diselesaikan
Halo rekan programmer! 👋 Jika kamu baru pertama kali melihat proyek fullstack yang lengkap seperti ini, jangan khawatir dan jangan merasa minder dulu ya!

Pada dasarnya, aplikasi ini dibangun untuk menyelesaikan masalah nyata di toko kelontong atau minimarket modern:
1. **Dulu kasir pakai kalkulator tangan**: Sering salah hitung kembalian atau salah jumlah barang. Di aplikasi kita, komputer yang menghitung semuanya dengan tepat dan instan.
2. **Dulu catatan stok sering selisih**: Barang di etalase hilang atau habis tapi di buku masih tercatat ada. Di aplikasi kita, stok hanya bisa bertambah lewat menu **Stok Masuk resmi** dan otomatis berkurang saat kasir menekan tombol **Bayar**.
3. **Dulu nota ditulis tangan**: Sering tidak terbaca atau hilang. Di aplikasi kita, setelah checkout berhasil, struk otomatis tampil di layar dan langsung bisa dicetak ke printer kasir (*thermal printer* 58mm/80mm).
4. **Dulu kasir bisa iseng buka laporan omset**: Di aplikasi kita, ada pembagian peran yang tegas (*Role-Based Access Control*): kasir hanya bisa buka kasir, sedangkan laporan uang omset hanya bisa dilihat oleh pemilik toko (*Owner*).
5. **Dulu pelanggan sering kabur ke toko sebelah**: Toko modern mempertahankan pelanggan dengan program **Loyalty Member**. Pelanggan mendapatkan kartu keanggotaan, mengumpulkan poin dari setiap belanjaan, naik level tingkatan (*Tier* Bronze -> Silver -> Gold -> Platinum), dan bisa menukarkan poinnya menjadi potongan harga (*diskon*) langsung di meja kasir!

### 1.3 Tech Stack & Standar Rekayasa Perangkat Lunak
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React Icons, React Router DOM 6.
- **Backend API**: Node.js, Express.js 4, Sequelize ORM 6, Bcrypt.js, JsonWebToken.
- **Database**: MySQL 8.0 dengan dukungan foreign keys berindeks, UTF-8 MB4, dan storage engine InnoDB.
- **Keamanan**: Helmet security headers, CORS ber-kredensial, Express Rate Limiter, HttpOnly Cookies anti-XSS.

## 2. Peta Besar Sistem

Aplikasi ini dibagi menjadi 2 bagian utama yang saling berkomunikasi:

```
[ FRONTEND (Tampilan di Browser) ]
  Teknologi: React 18, Vite, Tailwind CSS, Lucide Icons
  Tugas: Menampilkan antarmuka kasir yang cantik, menerima klik tombol kasir,
         mencari data member pelanggan via autocomplete secara cepat,
         menyimpan sementara barang di keranjang belanja, menghitung diskon poin,
         dan memunculkan struk belanja siap cetak.
        │
        │ Mengirim data via internet (HTTP REST API)
        │ Contoh: "Tolong checkout 2 Beras, pakai Member Siti, tukar 20 Poin, uang Rp150.000!"
        ▼
[ BACKEND (Otak & Logika Bisnis) ]
  Teknologi: Node.js, Express.js, Sequelize ORM
  Tugas: Mengecek keamanan (apakah kasir membawa token JWT yang sah?),
         mengunci baris produk & baris member di database MySQL (Row Locking),
         menghitung ulang harga asli dan diskon poin di sisi server,
         mengurangi stok barang, menambah perolehan poin belanja member,
         mencatat buku audit mutasi poin, dan menyimpan transaksi secara atomik (ACID).
        │
        │ Menyimpan data ke tempat aman
        ▼
[ DATABASE (Gudang Penyimpanan) ]
  Teknologi: MySQL 8.0
  Tugas: Menyimpan 9 tabel data: user kasir, sesi login, produk, stok masuk,
         loyalty member, riwayat mutasi poin, nota penjualan, dan rincian belanjaan.
```

---

## 3. Konsep-Konsep Keren yang Wajib Kamu Pahami

Sebelum kita membaca kodenya baris per baris, ada 5 konsep penting yang sering ditanyakan saat wawancara kerja programming:

### 3.1 Analogi Tiket Konser: Access Token & Refresh Token
- **Masalah**: Bagaimana server tahu bahwa seseorang sudah login tanpa harus meminta password setiap detik?
- **Analogi**: Bayangkan kamu datang ke festival musik:
  - Di gerbang utama, kamu menunjukkan KTP dan bukti pembayaran (ini proses **Login** dengan username & password).
  - Panitia memberikanmu **Gelang Kertas Akses** (ini adalah **Access Token**). Gelang ini memiliki masa aktif pendek (misal 15 menit) agar jika gelangmu jatuh atau dicuri orang, si pencuri tidak bisa memakainya lama-lama.
  - Namun kamu juga diberi **Kupon Khusus Tersegel** di dalam saku celanamu yang tidak bisa dilihat orang lain (ini adalah **Refresh Token** di cookie `HttpOnly`).
  - Saat gelang kertasmu rusak/kedaluwarsa, kamu cukup menunjukkan kupon khusus tersebut ke loket untuk mendapatkan gelang baru secara otomatis (**Silent Refresh**), tanpa perlu membeli tiket dari awal lagi!
- **Di Kode Kita**:
  - `Access Token` disimpan di variabel memori browser (`frontend/src/api/axios.js`). Tidak disimpan di `localStorage` agar kebal dari pencurian script jahat (XSS)!
  - `Refresh Token` disimpan di cookie browser bertanda `HttpOnly` (JavaScript tidak bisa membaca cookie ini, sehingga aman dari pencurian).

---

### 3.2 Analogi Kamar Pas: Kenapa Database Harus Dikunci (Row Locking)
- **Masalah Concurrency (Balapan Data)**:
  - Bayangkan sisa stok Minyak Goreng tinggal **1 botol**.
  - Kasir A dan Kasir B sama-sama melayani pembeli di komputer berbeda pada detik yang sama persis.
  - Kalau tidak ada sistem antrean, kedua kasir membaca stok = 1, lalu keduanya sama-sama menekan tombol bayar. Hasilnya: stok di database menjadi `-1` (minus), padahal barang fisiknya cuma ada 1! Toko bisa rugi!
- **Solusi Kita (`SELECT ... FOR UPDATE`)**:
  - Analogi seperti kamar pas pakaian: Begitu Kasir A masuk ke kamar pas untuk memeriksa Minyak Goreng, **pintu kamar pas dikunci dari dalam**.
  - Kasir B yang mau masuk harus **menunggu di luar** sampai Kasir A selesai membayar dan keluar kamar pas.
  - Saat Kasir A selesai, stok Minyak Goreng sudah menjadi 0.
  - Giliran Kasir B masuk, Kasir B melihat stok sudah 0, sehingga sistem menolak: *"Maaf stok tidak mencukupi"*. Stok tidak pernah jadi minus!
  - Prinsip yang sama kita terapkan pada data **Saldo Poin Member** saat ditukar di meja kasir.

---

### 3.3 Analogi Kertas Struk Fisik: Snapshot Harga Historis
- **Pertanyaan**: Kenapa saat transaksi, nama dan harga barang dicatat ulang di tabel `sale_items`? Kenapa tidak sekadar mencatat `product_id`-nya saja?
- **Analogi**:
  - Bayangkan hari ini kamu beli Beras seharga **Rp68.000**, lalu kamu simpan struk kertasnya di dompet.
  - Minggu depan, harga beras di toko naik menjadi **Rp75.000**.
  - Apakah angka di struk kertas yang ada di dalam dompetmu tiba-tiba berubah sendiri jadi Rp75.000? Tentu tidak!
- **Di Kode Kita**:
  - Tabel `sale_items` memiliki kolom `product_name_at_sale` dan `price_at_sale`.
  - Berapa pun harga produk diubah oleh pemilik toko di kemudian hari, nota penjualan lama yang sudah terbit akan tetap menampilkan harga asli saat transaksi terjadi. Ini dinamakan **Snapshot Immutability**.

---

### 3.4 Analogi Kartu Akses Gedung: Role-Based Access Control (RBAC)
- **Konsep**: Tidak semua orang boleh masuk ke semua ruangan.
- **Di Toko Kita**:
  - **Pemilik Toko (Owner)**: Memiliki kartu *Master Key*. Boleh melihat Dashboard omset toko, menambah master barang, memasukkan stok masuk, mengatur akun karyawan, mengubah status member, serta melakukan **penyesuaian saldo poin manual**.
  - **Kasir (Cashier)**: Hanya memiliki kartu akses ke meja kasir dan loyalty dasar. Boleh melakukan checkout kasir, mencari member pelanggan, mendaftarkan member baru, dan melihat riwayat nota hari ini. Kasir **DITOLAK** jika mencoba mengubah harga barang atau memanipulasi saldo poin member secara manual.
- **Prinsip Keamanan**: Menyembunyikan tombol di tampilan website **bukanlah keamanan**. Backend harus tetap memeriksa token dan role setiap kali ada request lewat middleware `authorizeRoles('owner')`.

---

### 3.5 Analogi Kartu Stempel Kedai Kopi: Arsitektur Modul Loyalty & Mutasi Poin
- **Masalah Bisnis**: Bagaimana cara membuat pembeli senang kembali lagi berbelanja di toko kita dan tidak pindah ke toko sebelah?
- **Analogi Kartu Stempel**:
  - Saat kamu beli kopi di cafe langganan, kasir memberikanmu kartu stempel.
  - Setiap kali kamu beli 1 cup kopi, kamu dapat 1 stempel.
  - Setelah terkumpul banyak, stempel itu bisa kamu tukarkan untuk mendapat potongan harga atau traktiran kopi gratis.
- **Di Modul Loyalty Member Kita**:
  Program ini memberikan insentif akumulasi poin bertingkat (*Tier-based points*) dan penukaran poin menjadi potongan diskon tunai langsung saat checkout kasir.

#### A. Aturan Perolehan & Penukaran Poin
| Parameter | Nilai / Rumus | Keterangan & Contoh |
|---|---|---|
| **Nilai Tukar Poin (*Redeem*)** | **1 Poin = Rp 100 Diskon** | Member punya saldo 50 Poin $\rightarrow$ Dapat diskon Rp 5.000 saat belanja di kasir. |
| **Batas Maksimal Penukaran** | $\le$ Subtotal Belanja Kotor | Diskon poin tidak boleh melebihi total belanja (tidak ada nota minus). |
| **Perolehan Poin (*Earn*)** | **$\lfloor (\text{Net Total} / 10.000) \times \text{Multiplier} \rfloor$** | Dihitung dari total belanja bersih setelah diskon poin. Setiap Rp 10.000 dapat 1 poin basis dikalikan pengali Tier. |
| **Bonus Pendaftaran Perdana** | Default **10 Poin** (Dapat disesuaikan) | Diberikan otomatis saat kasir mendaftarkan member baru sebagai hadiah selamat datang (*Welcome Bonus*). |

#### B. Tingkatan Keanggotaan & Kenaikan Otomatis (*Tier Progression*)
Member akan otomatis naik tingkatan (*auto-upgrade*) di backend setiap kali menyelesaikan transaksi belanja berdasarkan akumulasi belanja seumur hidup (`total_spent`):

| Tingkat (*Tier*) | Syarat Akumulasi Belanja | Pengali Poin (*Multiplier*) | Simulasi Belanja Bersih Rp 100.000 |
|---|---|:---:|---|
| **Bronze** | Tier Awal (< Rp 1.000.000) | **1.0x** | $\lfloor (100.000 / 10.000) \times 1.0 \rfloor =$ **+10 Poin** |
| **Silver** | $\ge$ Rp 1.000.000 | **1.2x** | $\lfloor (100.000 / 10.000) \times 1.2 \rfloor =$ **+12 Poin** |
| **Gold** | $\ge$ Rp 5.000.000 | **1.5x** | $\lfloor (100.000 / 10.000) \times 1.5 \rfloor =$ **+15 Poin** |
| **Platinum** | $\ge$ Rp 15.000.000 | **2.0x** | $\lfloor (100.000 / 10.000) \times 2.0 \rfloor =$ **+20 Poin** |

#### C. Buku Catatan Mutasi Poin (Audit Trail - `member_point_histories`)
Poin tidak boleh bertambah atau berkurang secara gaib tanpa catatan akuntansi yang jelas! Setiap perubahan poin wajib mencatat:
1. `BONUS`: Poin hadiah selamat datang saat registrasi awal.
2. `EARN`: Poin yang didapatkan dari transaksi belanja nota tertentu.
3. `REDEEM`: Poin yang ditukarkan menjadi potongan harga pada nota belanja tertentu.
4. `ADJUSTMENT`: Penyesuaian poin manual oleh Owner (misal kompensasi gangguan kasir atau reward hari raya) dengan wajib mencantumkan alasan audit resmi.

#### D. Matriks Hak Akses (RBAC) Modul Loyalty Member
| Aksi / Fitur | Kasir (`cashier`) | Pemilik Toko (`owner`) | Alasan Desain Keamanan |
|---|:---:|:---:|---|
| **Pencarian Cepat Member (Autocomplete)** | ✅ Ya | ✅ Ya | Agar kasir bisa mencari pelanggan dalam hitungan milidetik saat melayani antrean. |
| **Pendaftaran Member Baru (Quick Register)** | ✅ Ya | ✅ Ya | Kasir dapat langsung mendaftarkan pembeli di loket kasir tanpa meninggalkan meja POS. |
| **Lihat Kartu Digital & Riwayat Poin** | ✅ Ya | ✅ Ya | Kasir perlu membantu mengecek sisa saldo poin pembeli jika ada pertanyaan. |
| **Edit Data Kontak (Nama/HP/Alamat)** | ✅ Ya | ✅ Ya | Kasir bisa memperbarui nomor WhatsApp pelanggan jika ada perubahan. |
| **Ringkasan Analitik & Valuasi Poin Toko** | ❌ Terbatas | ✅ Akses Penuh | Owner memantau peredaran poin dan potensi liabilitas diskon toko. |
| **Penyesuaian Poin Manual (+ / -)** | ❌ Ditolak (403) | ✅ Diizinkan | Mencegah kasir nakal menambah saldo poin miliknya sendiri secara curang. |
| **Ubah Tier & Status Keaktifan Manual** | ❌ Ditolak (403) | ✅ Diizinkan | Penetapan status VIP atau penonaktifan member adalah wewenang mutlak pemilik toko. |
| **Hapus Data Member** | ❌ Ditolak (403) | ✅ Diizinkan (Aman) | Jika member sudah pernah belanja, sistem otomatis mengarsipkan (Non-Aktif) agar data nota lama tetap valid. |


---

## 4. Mengenal Database Kita

Database kita bernama `pos_kasir_stok` dan memiliki 9 tabel yang saling terhubung:

```
[users] ─────────< [user_sessions]
   │
   ├─────────────< [stock_movements] >──────────┐
   │                                            │
   ├─────────────< [member_point_histories]     │
   │                        │                   ▼
   ▼                        ▼              [products]
[sales] ─────────< [sale_items] >───────────────┘
   ▲
   │ (opsional)
[members]
   │
[business_profiles]
```

### Rincian 9 Tabel Database:
1. **`users`**: Menyimpan username, nama lengkap, role (`owner` / `cashier`), status aktif, dan password yang diacak aman menggunakan Bcrypt.
2. **`user_sessions`**: Menyimpan catatan refresh token aktif pengguna (agar jika ada akun kasir yang dinonaktifkan, sesi loginnya bisa langsung dicabut).
3. **`products`**: Menyimpan daftar barang toko (SKU barcode, nama barang, harga jual, stok fisik, status aktif).
4. **`stock_movements`**: Jurnal resmi penambahan barang masuk ke gudang toko (siapa penginputnya, jumlah unit, tanggal, surat jalan).
5. **`members`**: Data pelanggan setia toko (kode unik `MBR-YYYYMMDD-XXXX`, nama lengkap, no. HP unik, email, alamat, tier, saldo poin aktif, total akumulasi belanja seumur hidup, dan status aktif).
6. **`member_point_histories`**: Buku audit mutasi perolehan dan penukaran poin (id member, id nota penjualan, jenis mutasi `EARN`/`REDEEM`/`ADJUSTMENT`/`BONUS`, nilai mutasi, saldo poin sesudahnya, dan catatan audit).
7. **`sales`**: Kepala nota faktur penjualan kasir (nomor faktur `TRX-...`, kasir yang bertugas, id member yang belanja, subtotal kotor, nominal diskon poin, total tagihan bersih, uang tunai pembeli, kembalian, perolehan poin transaksi, dan poin yang ditukar).
8. **`sale_items`**: Rincian setiap barang belanjaan pada nota (snapshot nama barang saat itu, snapshot harga saat itu, kuantitas, dan subtotal).
9. **`business_profiles`**: Identitas toko fisik (nama toko, alamat, telepon, dan kalimat penutup struk).

---

## 5. Bedah Kode Backend

Mari kita bedah file-file penting di dalam folder `backend/`:

### 5.1 `server.js` - Pintu Gerbang Backend
File ini adalah entry point tempat backend pertama kali dinyalakan:
- **Helmet**: Memasang perisai keamanan standar HTTP.
- **CORS**: Membatasi hanya domain frontend kita (`localhost:5173`) yang diizinkan mengakses backend. Opsi `credentials: true` wajib aktif agar cookie token bisa dikirim.
- **Body & Cookie Parser**: Membaca request JSON dan cookie `HttpOnly`.
- **General Rate Limiter**: Mencegah serangan brute-force dan spam ke API.
- **Pendaftaran Rute Modular**:
  - `/api/auth` -> Login, token refresh, logout.
  - `/api/users` -> Kelola akun kasir/admin.
  - `/api/products` -> Katalog master produk.
  - `/api/stock-movements` -> Stok masuk gudang.
  - `/api/sales` -> Checkout kasir dan riwayat nota.
  - `/api/members` -> **Modul Loyalty Member & Poin**.
  - `/api/reports` -> Laporan omset harian.
- **`startServer()`**: Menghubungkan database MySQL, menyinkronkan tabel Sequelize (`sequelize.sync()`), lalu mengaktifkan server di port 5000.

---

### 5.2 `middlewares/auth.js` - Satpam Pemeriksa Token & Role (RBAC)
Bertindak seperti satpam pemeriksa kartu identitas:
1. **`authenticateToken`**:
   - Membaca header `Authorization: Bearer <token>`.
   - Memeriksa keabsahan dan masa berlaku JWT.
   - Jika token sudah kedaluwarsa (lewat 15 menit), satpam merespon kode `TOKEN_EXPIRED`, sehingga Axios di frontend tahu harus menukar refresh token secara otomatis.
   - Mengambil data user dari database MySQL dan menyimpannya di `req.user`.
2. **`authorizeRoles(...allowedRoles)`**:
   - Memeriksa apakah role pengguna ada di dalam daftar yang diizinkan.
   - Contoh: Rute penyesuaian poin manual dilindungi oleh `authorizeRoles('owner')`. Jika akun kasir mencoba menembak URL ini, satpam langsung menolak dengan status **403 Forbidden**.

---

### 5.3 `models/Member.js` & `models/MemberPointHistory.js` - Model Loyalty Member
Dua tabel Sequelize yang dirancang dengan integritas data tinggi dan indeks relasi optimal:

#### 1. `models/Member.js` (Tabel `members`)
```javascript
// Cuplikan Skema Sequelize Member.js
Member.init({
  member_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { name: 'unique_member_code', msg: 'Kode member sudah terdaftar' }
  },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: { name: 'unique_member_phone', msg: 'Nomor telepon member sudah terdaftar' }
  },
  email: { type: DataTypes.STRING(100), allowNull: true, validate: { isEmail: true } },
  tier: {
    type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
    allowNull: false,
    defaultValue: 'Bronze'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: { args: [0], msg: 'Saldo poin tidak boleh negatif' } }
  },
  total_spent: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  joined_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Member',
  tableName: 'members',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['member_code'], unique: true },
    { fields: ['phone'], unique: true },
    { fields: ['tier'] },
    { fields: ['is_active'] }
  ]
});
```
- **Poin Penting**: Kolom `phone` dan `member_code` diproteksi indeks unik di tingkat database MySQL. Saldo `points` diberi validator `min: 0` agar tidak pernah minus.

#### 2. `models/MemberPointHistory.js` (Tabel `member_point_histories`)
```javascript
// Cuplikan Skema Sequelize MemberPointHistory.js (Audit Trail)
MemberPointHistory.init({
  member_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'members', key: 'id' } },
  sale_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'sales', key: 'id' } },
  type: {
    type: DataTypes.ENUM('EARN', 'REDEEM', 'ADJUSTMENT', 'BONUS'),
    allowNull: false
  },
  points: { type: DataTypes.INTEGER, allowNull: false }, // Nilai delta (+/-)
  balance_after: { type: DataTypes.INTEGER, allowNull: false }, // Snapshot saldo akhir
  description: { type: DataTypes.STRING(255), allowNull: true },
  created_by_user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } }
}, {
  sequelize,
  modelName: 'MemberPointHistory',
  tableName: 'member_point_histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Riwayat mutasi bersifat immutable (tidak boleh di-edit)
});
```

---

### 5.4 `controllers/memberController.js` - Pengendali Modul Loyalty Member
Mengimplementasikan seluruh endpoint REST API manajemen member dan logika keamanan data:

#### A. Rangkuman Fungsi Controller:
1. **`getMembers`**: Mengambil seluruh daftar member dengan dukungan *debounced search* multi-kolom (nama, telepon, kode, email) dan filter tier/status.
2. **`searchMembersQuick`**: Didesain khusus untuk layar kasir POS. Merespons pencarian cepat limit 10 record teratas berdasarkan kemiripan nomor HP atau nama dengan latensi rendah.
3. **`getMemberById`**: Mengambil profil member, 30 riwayat mutasi poin terakhir, dan 10 riwayat transaksi belanja terbaru.
4. **`createMember`**: Mendaftarkan member baru dengan pembuatan kode otomatis `MBR-YYYYMMDD-XXXX` dan pencatatan mutasi bonus selamat datang (`BONUS`).
5. **`updateMember`**: Kasir hanya boleh mengubah data kontak (nama, no. HP, alamat). Perubahan `tier` dan `is_active` hanya diproses jika dilakukan oleh `owner`.
6. **`adjustMemberPoints` (Khusus Owner)**: Penyesuaian poin manual dengan **Pessimistic Locking** (`lock: transaction.LOCK.UPDATE`) dan kewajiban mengisi alasan audit.
7. **`toggleMemberStatus` & `deleteMember` (Khusus Owner)**: Jika member sudah pernah memiliki riwayat belanja di tabel `sales`, sistem menolak penghapusan fisik dan secara otomatis mengubah statusnya menjadi Non-Aktif (*soft archive*) agar data faktur keuangan masa lalu tidak korup.
8. **`getLoyaltySummary`**: Analitik ringkasan toko: total member terdaftar, member aktif, saldo poin yang beredar di masyarakat (beserta nilai liabilitas rupiah diskonnya), total poin yang sudah pernah ditukarkan, distribusi tier, dan 5 member paling loyal.

#### B. Contoh Kode Kunci: Penyesuaian Poin Manual dengan Pessimistic Locking
```javascript
// backend/controllers/memberController.js -> adjustMemberPoints
const transaction = await sequelize.transaction();
try {
  const { id } = req.params;
  const { points_delta, reason } = req.body;
  const delta = parseInt(points_delta, 10);

  // Kunci baris member di MySQL (SELECT ... FOR UPDATE) agar tidak balapan data
  const member = await Member.findByPk(id, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  const newBalance = member.points + delta;
  if (newBalance < 0) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: 'Saldo poin tidak boleh negatif.' });
  }

  member.points = newBalance;
  await member.save({ transaction });

  // Catat permanen di buku audit trail
  await MemberPointHistory.create({
    member_id: member.id,
    type: 'ADJUSTMENT',
    points: delta,
    balance_after: newBalance,
    description: `Penyesuaian manual oleh Owner: ${reason.trim()}`,
    created_by_user_id: req.user.id
  }, { transaction });

  await transaction.commit();
  return res.status(200).json({ success: true, message: 'Saldo poin berhasil disesuaikan.' });
} catch (error) {
  await transaction.rollback();
  next(error);
}
```

---

### 5.5 `controllers/salesController.js` - Mesin Kasir & Checkout Atomik Terintegrasi Loyalty
Fungsi `checkout` adalah inti proses transaksi POS:
1. **Buka Transaksi Database ACID** (`sequelize.transaction()`): Menjamin jika salah satu proses gagal, seluruh perubahan dibatalkan (*Rollback*).
2. **Kunci Baris Produk** (`lock: transaction.LOCK.UPDATE`): Menjamin stok fisik tidak balapan dengan kasir lain.
3. **Validasi & Kunci Baris Member** (jika pelanggan membawa kartu member):
   - Jika member memilih menukarkan poin (`redeem_points > 0`), sistem memvalidasi apakah saldo poin member cukup.
   - Menghitung diskon: `discountAmount = pointsToRedeem * 100`.
   - Mengurangi total tagihan: `finalTotal = subtotal - discountAmount`.
4. **Hitung Perolehan Poin Transaksi Baru**:
   - Dihitung berdasarkan nilai belanja bersih (`finalTotal`).
   - Dikalikan dengan pengali Tier member (Bronze 1.0x, Silver 1.2x, Gold 1.5x, Platinum 2.0x).
5. **Validasi Uang Tunai Kasir**: Memastikan uang tunai yang diserahkan pembeli cukup untuk melunasi tagihan bersih.
6. **Simpan Pengurangan Stok Produk**.
7. **Simpan Nota Penjualan (`Sale`) & Rincian Item (`SaleItem`)**.
8. **Perbarui Data Member**:
   - Saldo poin dipotong sesuai poin yang ditukarkan.
   - Saldo poin ditambah sesuai poin yang baru didapatkan.
   - Total belanja seumur hidup (`total_spent`) diakumulasikan.
   - Jika total belanja melampaui batas tier, tier member otomatis naik tingkat (*Tier Progression*)!
9. **Catat Mutasi Poin ke `member_point_histories`** (riwayat `REDEEM` dan `EARN`).
10. **Commit Transaksi**: Seluruh perubahan disimpan secara permanen.
11. **Kirim Data ke Frontend**: Lengkap dengan identitas toko dan saldo poin terkini untuk langsung dicetak ke struk.

---

### 5.6 `controllers/productController.js` - Kelola Master Barang
- **`getAllProducts`**: Menampilkan daftar barang lengkap dengan status stok untuk etalase kasir.
- **`createProduct`**: Menambah produk baru dengan stok awal 0 (Owner only).
- **`updateProduct`**: Mengubah nama dan harga barang. Stok tidak boleh diubah langsung di sini demi mencegah manipulasi data!
- **`updateProductStatus`**: Mengarsipkan barang (Soft Delete) agar barang yang sudah tidak dijual tidak muncul lagi di kasir tanpa merusak riwayat transaksi lama.

---

### 5.7 `controllers/stockMovementController.js` - Buku Catatan Barang Masuk
Satu-satunya pintu resmi penambahan stok:
- Saat pemilik menginput barang masuk (misal: masuk 50 botol Minyak Goreng):
  - Sistem mengunci produk bersangkutan.
  - Menambah stok produk tersebut: `product.stock += quantity`.
  - Mencatat riwayat mutasi di tabel `stock_movements` (siapa yang memasukkan, nomor surat jalan, dan catatan tambahan).

---

### 5.8 `controllers/authController.js` - Login, Refresh, & Ganti Password
- **`login`**: Memeriksa username dan password dengan Bcrypt. Jika cocok, membuat Access Token dan Refresh Token, serta memasang cookie `HttpOnly`.
- **`refreshToken`**: Menukar token lama dengan token baru secara berkala tanpa mengganggu kenyamanan kasir yang sedang bekerja (*Silent Refresh*).
- **`logout`**: Menghapus cookie browser dan mematikan sesi di database.
- **`changePassword`**: Memvalidasi password lama, meng-hash password baru, dan langsung mencabut semua sesi aktif agar wajib login ulang dengan password baru.

---

## 6. Bedah Kode Frontend

Sekarang mari kita bedah tampilan dan logika di dalam folder `frontend/src/`:

### 6.1 `src/api/axios.js` - Kurir Pengantar Data Pintar
Axios adalah alat untuk mengirim dan menerima data dari backend:
- **Request Interceptor**: Setiap kali kita memanggil `apiClient.get()` atau `apiClient.post()`, kurir ini otomatis menempelkan Access Token ke header: `Authorization: Bearer <token>`.
- **Response Interceptor (Silent Refresh)**: Jika server menjawab *"Tokenmu habis (401)"*, Axios tidak langsung menyerah atau membuat kasir logout. Axios otomatis meminta token baru ke backend, menyimpannya di memori, lalu mengulangi transaksi yang tadi tertunda secara halus di balik layar!
- **Anti-Refresh Storm**: Jika kasir mengklik beberapa tombol sekaligus saat token habis, Axios merapikannya dalam antrean sehingga backend tidak kebanjiran request refresh.

---

### 6.2 `src/contexts/AuthContext.jsx` - Kantong Data Status Login
Dengan React Context:
- Komponen manapun (Navbar, Halaman Kasir, dll.) bisa dengan mudah memanggil `const { user, role, logout } = useAuth()`.
- Saat browser pertama kali dibuka atau di-refresh (F5), fungsi `initializeAuth` otomatis memeriksa cookie sesi di backend. Jika ada, pengguna langsung otomatis login tanpa mengetik ulang password.

---

### 6.3 `src/components/Navbar.jsx` & `TopHeader.jsx`
- **`TopHeader.jsx`**: Menampilkan status server, nama pengguna yang sedang aktif, role badge, tombol ganti kata sandi, dan tombol keluar.
- **`Navbar.jsx`**: Sidebar navigasi yang cerdas.
  - Menu disaring berdasarkan role: Menu **Loyalty Member** kini tersedia untuk **Owner** maupun **Cashier**!
  - Menu khusus Owner (Dashboard Omset, Stok Masuk, Kelola Pengguna, dan Profil Toko) otomatis disembunyikan jika yang login adalah Kasir.

---

### 6.4 `src/pages/MembersPage.jsx` - Layar Manajemen Loyalty Member & Analitik Poin
Halaman khusus program keanggotaan pelanggan toko yang mengintegrasikan analitik bisnis, kartu digital, dan jejak audit mutasi poin. Halaman ini memiliki 6 komponen antarmuka utama:

#### 1. Empat Kartu Ringkasan Statistik (KPI Loyalty Cards)
Mengambil data langsung dari endpoint `/api/members/summary/stats`:
- **Total Member Terdaftar**: Menampilkan jumlah seluruh member dan jumlah member yang berstatus aktif.
- **Total Saldo Poin Beredar**: Menghitung jumlah seluruh poin aktif yang dimiliki pelanggan di pasar, lengkap dengan estimasi liabilitas nilai diskon Rupiah toko (`total_points_in_circulation * 100`).
- **Poin Pernah Ditukar**: Menghitung total poin yang sukses ditukarkan pembeli menjadi diskon potongan harga (`total_points_redeemed * 100`).
- **Distribusi Tier Terbanyak**: Menampilkan sebaran pelanggan pada level Bronze, Silver, Gold, dan Platinum untuk mengukur efektivitas program loyalitas.

#### 2. Bilah Pencarian & Filter Cerdas (Debounced Search)
- Menggunakan teknik *Debounce* (350ms): Server tidak akan dibanjiri request pencarian setiap kali kasir mengetik huruf, melainkan menunggu 350 milidetik setelah kasir selesai mengetik.
- Mendukung pencarian multi-kolom (Nama Pelanggan, Nomor HP/WhatsApp, atau Kode Member).
- Filter dropdown dinamis berdasarkan Tier (Semua, Bronze, Silver, Gold, Platinum) dan Status Keaktifan (Aktif, Non-Aktif), serta tombol muat ulang cepat (*Refresh*).

#### 3. Tabel Data Member dengan Badge Warna Khas
- **Kolom Identitas & Kontak**: Menampilkan nama lengkap, nomor telepon, dan email dengan ikon elegan.
- **Kode Member**: Ditampilkan dengan font monospaced berlatar abu-abu netral (`MBR-...`).
- **Badge Tier Khusus**:
  - `Platinum`: Ungu elegan (`bg-purple-100 text-purple-800 border-purple-200`)
  - `Gold`: Emas mewah (`bg-amber-100 text-amber-800 border-amber-200`)
  - `Silver`: Perak bersih (`bg-slate-200 text-slate-800 border-slate-300`)
  - `Bronze`: Tembaga hangat (`bg-orange-100 text-orange-800 border-orange-200`)
- **Saldo Poin & Valuasi Diskon**: Menampilkan angka poin tebal warna oranye beserta nilai rupiahnya (`≈ RpX.XXX`).
- **Tombol Aksi Bersyarat Role**:
  - Tombol *Lihat Kartu & Riwayat Poin* (Ikon Jam) $\rightarrow$ Dapat diakses oleh Kasir & Owner.
  - Tombol *Edit Kontak* (Ikon Pensil) $\rightarrow$ Dapat diakses oleh Kasir & Owner.
  - Tombol *Penyesuaian Poin Manual* (Ikon Slider) $\rightarrow$ **Hanya muncul dan aktif untuk Owner**.
  - Tombol *Hapus / Nonaktifkan* (Ikon Sampah) $\rightarrow$ **Hanya muncul dan aktif untuk Owner**.

#### 4. Modal Kartu VIP Digital (VIP Loyalty Card)
Menampilkan representasi fisik kartu keanggotaan toko bernuansa mewah di layar:
- Desain visual *Dark Modern Gradient* (`bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800`).
- Memuat Nama Member, Kode Member, Badge Tier menyala, Total Akumulasi Belanja Seumur Hidup, dan Saldo Poin Aktif.
- Memberikan kesan profesional dan eksklusif saat ditunjukkan kepada pelanggan.

#### 5. Jejak Riwayat Mutasi Poin (Audit Trail Table)
Di dalam modal detail member, sistem memuat seluruh mutasi masuk dan keluar poin pelanggan:
- **Waktu**: Tanggal dan jam terjadinya transaksi mutasi poin.
- **Jenis Mutasi**:
  - `EARN` (Badge Hijau): Poin yang didapatkan dari pembelanjaan nota faktur.
  - `REDEEM` (Badge Amber): Poin yang dipotong untuk diskon belanja kasir.
  - `BONUS` (Badge Ungu): Poin selamat datang registrasi perdana.
  - `ADJUSTMENT` (Badge Biru): Penyesuaian manual oleh pemilik toko.
- **Mutasi Poin**: Warna hijau untuk penambahan (`+X Pts`), merah untuk pengurangan (`-X Pts`).
- **Saldo Akhir (`balance_after`)**: Snapshot saldo poin member setelah transaksi tersebut selesai.
- **Keterangan**: Catatan audit nomor nota transaksi kasir atau alasan penyesuaian manual.

#### 6. Modal Penyesuaian Poin Manual (Owner Only)
Dirancang khusus untuk pemilik toko melakukan koreksi saldo poin dengan kontrol ketat:
- **Pilihan Mode**: Tombol toggle hijau **+ Tambah Poin** atau merah **- Kurangi Poin**.
- **Live Preview Saldo Baru**: Saat pemilik mengetik angka poin, sistem langsung menampilkan estimasi saldo akhir secara langsung (*live calculation*) sebelum tombol simpan ditekan.
- **Kolom Alasan Audit Wajib**: Form memvalidasi bahwa alasan penyesuaian wajib diisi minimal 4 karakter (misal: *"Kompensasi kesalahan kasir nota TRX-..."* atau *"Bonus apresiasi pelanggan terbaik bulan ini"*). Alasan ini tercatat permanen di riwayat mutasi poin.

#### 7. Modal Dialog Panduan Kasir (Panduan Poin & Pengali Tier)
Diakses melalui tombol **'Panduan Poin & Kasir'** di header halaman:
- Membuka jendela pop-up dialog (*modal dialog*) modern dengan *backdrop blur* (`bg-slate-900/60 backdrop-blur-sm`).
- **Nilai Tukar Poin**: Menegaskan aturan emas bahwa **1 Poin = Rp 100 diskon langsung**.
- **4 Kartu Tier & Pengali**: Menjelaskan rasio pengali Bronze (1.0x), Silver (1.2x), Gold (1.5x), dan Platinum (2.0x) beserta simulasi poin dan rupiahnya saat belanja Rp 100.000.
- **3 Skrip Percakapan Kasir Siap Pakai**: Kalimat panduan ramah saat kasir menjelaskan nilai 1 poin, cara mengumpulkan poin kelipatan Rp 10.000, dan keuntungan kenaikan level tier kepada pembeli.
- Desain ini menjaga halaman utama tetap rapi dan leluasa tanpa mendorong tabel ke bawah.


---

### 6.5 `src/pages/CashierPage.jsx` - Layar Kasir POS Terintegrasi Loyalty
Halaman transaksi kasir belanjaan:
1. **Etalase Barang di Kiri**: Menampilkan produk dengan badge indikator stok warna (Hijau, Kuning, Merah).
2. **Autocomplete Pencarian Member Cepat**:
   - Kasir cukup mengetik nomor HP, nama, atau kode member pembeli di bagian atas keranjang.
   - Daftar pelanggan yang cocok langsung muncul dalam hitungan milidetik.
3. **Tombol "+ Member Baru" (Quick Register)**:
   - Jika ada pembeli yang belum terdaftar dan ingin menjadi member di meja kasir, kasir tidak perlu pindah halaman!
   - Cukup klik "+ Member", masukkan nama dan nomor WhatsApp, simpan, dan pelanggan tersebut langsung otomatis terpasang di transaksi saat itu juga.
4. **Penukaran Poin & Diskon Otomatis**:
   - Jika member memiliki saldo poin, kasir cukup mencentang **Tukarkan Poin**.
   - Sistem langsung menghitung potongan harga belanja secara otomatis (1 Poin = Rp100).
5. **Estimasi Poin Belanja**: Kasir bisa memberi tahu pembeli: *"Dari belanjaan ini, Ibu dapat tambahan +15 Poin ya!"*.
6. **Pembayaran Tunai**: Dilengkapi shortcut uang pas dan pecahan uang (+10rb, +20rb, +50rb, +100rb).
7. **Pencegahan Klik Ganda**: Tombol bayar langsung dinonaktifkan saat pengiriman berlangsung.

---

### 6.6 `src/components/ReceiptModal.jsx` - Kertas Struk Thermal Siap Cetak
- Didesain persis seperti kertas kasir minimarket berukuran 58mm / 80mm.
- **Seksi Loyalty di Struk**: Jika transaksi menggunakan kartu member, struk secara otomatis mencetak:
  - Nama dan kode member
  - Tier member
  - Rincian Diskon Penukaran Poin (jika poin ditukar)
  - Poin yang diperoleh dari transaksi saat ini
  - Sisa saldo akhir poin member setelah transaksi
- Menggunakan CSS `@media print` sehingga yang dicetak ke printer fisik hanyalah struk belanjaannya saja (*no-print* disembunyikan).

---

## 7. Tutorial Lengkap Penggunaan Aplikasi (Langkah demi Langkah)

### Tutorial 1: Setup Lingkungan & Database (Seed Data)
1. **Pastikan MySQL Aktif**: Buka XAMPP Control Panel dan pastikan modul **MySQL** sudah berstatus *Running* (port standar 3306).
2. **Jalankan Seeder Backend**:
   ```bash
   cd backend
   npm run seed
   ```
   *Penjelasan*: Perintah ini otomatis membuat database `pos_kasir_stok`, menyinkronkan 9 tabel Sequelize, serta mengisi akun bawaan (`owner` & `cashier`), profil toko, stok awal barang, dan sampel loyalty member.
3. **Jalankan Server Backend Express**:
   ```bash
   npm run dev
   ```
   *Penjelasan*: Server berjalan di `http://localhost:5000` dengan nodemon (otomatis restart saat ada perubahan file).
4. **Jalankan Frontend React Vite**:
   Buka terminal terpisah:
   ```bash
   cd frontend
   npm run dev
   ```
   *Penjelasan*: Aplikasi web kasir siap dibuka di browser pada alamat `http://localhost:5173`.

---

### Tutorial 2: Transaksi Kasir POS & Cetak Struk Thermal
1. Buka browser di `http://localhost:5173/login`.
2. Masuk menggunakan akun kasir:
   - **Username**: `cashier`
   - **Password**: `Cashier123!`
3. Sistem secara otomatis mengarahkan kamu ke layar **Kasir POS** (`/pos`).
4. **Pilih Barang**:
   - Ketik nama barang atau scan SKU barcode di kolom pencarian cepat sebelah kiri (misal: "Beras" atau "Minyak").
   - Klik kartu barang untuk memasukkannya ke keranjang belanja kasir.
   - Atur kuantitas barang belanjaan menggunakan tombol plus (`+`) atau minus (`-`).
5. **Pembayaran Tunai**:
   - Masukkan nominal uang yang diserahkan pembeli pada input "Uang Tunai Diserahkan (Cash)" atau gunakan tombol pecahan praktis (`Uang Pas`, `+10rb`, `+20rb`, `+50rb`, `+100rb`).
   - Sistem secara *real-time* menghitung uang kembalian.
6. **Proses & Cetak Struk**:
   - Klik tombol **Proses Bayar & Cetak Nota**.
   - Pop-up struk thermal kasir langsung muncul.
   - Klik tombol **Cetak Nota** untuk mengirim struk ke printer thermal kasir (58mm/80mm) atau simpan sebagai file PDF.

---

### Tutorial 3: Pendaftaran Cepat Member Baru di Meja Kasir
Fitur ini dirancang agar kasir dapat mendaftarkan pelanggan setia seketika tanpa perlu meninggalkan antrean pembayaran:
1. Saat berada di layar Kasir POS (`/pos`), perhatikan bilah Member di atas keranjang belanja sebelah kanan.
2. Klik tombol **+ Member** (ikon `UserPlus`).
3. Modal formulir cepat (*Quick Register*) akan muncul:
   - Masukkan **Nama Lengkap**: contoh `Rahmat Hidayat`.
   - Masukkan **Nomor WhatsApp / HP**: contoh `081234567891`.
   - Masukkan Email (opsional).
4. Klik tombol **Simpan & Pilih**.
5. Sistem otomatis:
   - Membuat kode member unik permanen bertipe `MBR-YYYYMMDD-XXXX`.
   - Memberikan bonus selamat datang **10 Poin Perdana**.
   - Memasang member tersebut langsung ke transaksi belanja saat ini!

---

### Tutorial 4: Belanja Member & Penukaran Diskon Poin
1. Di layar Kasir POS, pada kolom **Cari Member**, ketik minimal 2 digit nama, kode, atau nomor HP pelanggan (misal: ketik `Andi`).
2. Kotak saran *autocomplete* akan muncul secara instan menampilkan nama, tier, dan saldo poin aktif member.
3. Klik member yang dipilih. Kartu member aktif akan terpasang di atas keranjang belanja.
4. **Menukarkan Poin Menjadi Diskon**:
   - Jika member memiliki saldo poin (minimal 10 poin), centang kotak **Tukarkan Poin**.
   - Sistem otomatis menghitung potongan harga: setiap 1 Poin bernilai diskon **Rp100**.
   - Total tagihan belanja kotor otomatis dipotong diskon poin secara transparan.
5. **Melihat Estimasi Poin Baru**:
   - Kasir dapat melihat pemberitahuan: *"Estimasi poin belanja ini: +X Pts"*.
   - Kasir dapat menginfokan pembeli: *"Dari transaksi ini, Bapak/Ibu mendapatkan X poin ya!"*.
6. Klik **Proses Bayar & Cetak Nota**.
7. Pada struk kasir, tercetak lengkap nama member, nomor kartu, diskon poin, poin transaksi baru, dan sisa saldo akhir poin.

---

### Tutorial 5: Monitoring Analitik & Penyesuaian Poin Manual (Owner)
1. Logout dan masuk menggunakan akun pemilik toko:
   - **Username**: `owner`
   - **Password**: `Owner123!`
2. Buka menu samping **Loyalty Member** (`/members`).
3. **Membaca Analitik Toko**:
   - Pantau kartu statistik: Total Member, Member Aktif, Total Saldo Poin Beredar, dan Poin yang Telah Ditukarkan.
4. **Melihat Kartu VIP & Riwayat Poin Pelanggan**:
   - Pada tabel member, klik tombol ikon jam / riwayat pada salah satu member.
   - Layar menampilkan Kartu Digital VIP dengan gradien elegan, tier, serta tabel lengkap audit mutasi poin (`EARN`, `REDEEM`, `BONUS`, `ADJUSTMENT`).
5. **Melakukan Penyesuaian Poin Manual**:
   - Klik tombol ikon slider (*Penyesuaian Poin Manual*).
   - Pilih mode: **+ Tambah Poin** (misal untuk reward khusus) atau **- Kurangi Poin** (misal untuk koreksi).
   - Masukkan jumlah poin (misal `50`).
   - Masukkan **Alasan / Catatan Audit** (wajib diisi, misal: *"Bonus pelanggan terloyal bulan ini"*).
   - Klik **Simpan Penyesuaian**. Saldo poin member terupdate seketika dan tercatat di buku audit trail!

---

### Tutorial 6: Manajemen Stok Masuk Gudang & Master Produk
1. Sebagai akun Owner, buka menu **Stok Masuk** (`/stock-in`).
2. Pilih barang yang baru saja dikirim oleh pemasok/distributor (misal: *Indomie Goreng*).
3. Masukkan jumlah unit masuk (misal: `50` unit), nomor surat jalan (*reference number*), dan catatan penerimaan.
4. Klik simpan. Stok produk di etalase kasir otomatis bertambah 50 unit dan riwayat mutasi barang masuk tercatat abadi di tabel `stock_movements`.
5. Di menu **Master Produk** (`/products`), pemilik dapat menambahkan produk baru dengan harga jual resmi, atau menonaktifkan barang yang sudah tidak dijual lagi (*soft deactivation*).

---

## 8. Panduan Pengujian 5 Skenario Mutlak Sistem

### 8.1 Uji Coba 5 Skenario Pembuktian Sistem

#### Skenario 1: Uji Hitung Normal & Stok Berkurang Otomatis
1. Login sebagai `cashier` (password: `Cashier123!`).
2. Buka menu **Kasir POS**.
3. Pilih produk (misal: *Beras Ramos Super 5kg* seharga Rp68.000, stok awal 24 unit).
4. Tambahkan 2 unit ke keranjang (Subtotal: Rp136.000).
5. Masukkan uang tunai: `150000`.
6. Sistem menghitung kembalian: `Rp14.000`.
7. Klik **Proses Bayar & Cetak Nota**.
8. Struk muncul dengan nomor faktur resmi. Periksa etalase: stok Beras Ramos otomatis berkurang menjadi 22 unit!

#### Skenario 2: Uji Cegah Stok Minus (Pessimistic Row Locking)
1. Siapkan produk yang sisa stoknya tinggal **1 unit**.
2. Buka dua jendela browser yang berbeda: Jendela 1 (Normal) dan Jendela 2 (Incognito).
3. Di kedua jendela, masukkan barang tersebut ke keranjang kasir.
4. Klik bayar di Jendela 1 -> **Berhasil**. Stok sekarang menjadi 0.
5. Klik bayar di Jendela 2 -> **Ditolak oleh server**: *"Stok produk tidak mencukupi"*.
6. Cek di database MySQL: Stok tetap **0**, tidak pernah minus (-1). Balapan data berhasil dicegah!

#### Skenario 3: Uji Anti Dobel Klik (Anti-Double Submission)
1. Di kasir, masukkan barang dan isi uang tunai pas.
2. Klik tombol bayar.
3. Perhatikan tombol langsung berubah menjadi animasi loading dan statusnya terkunci (`disabled`). Kasir tidak bisa mengklik berkali-kali secara tidak sengaja, sehingga tidak akan pernah ada nota ganda untuk satu transaksi.

#### Skenario 4: Uji Keamanan Hak Akses (RBAC) & Bukti Riwayat Permanen
1. **Uji Keamanan**: Saat login sebagai `cashier`, coba ketik URL `http://localhost:5173/users` di address bar browser. Sistem langsung menolak dan menampilkan halaman **403 Unauthorized (Akses Ditolak)**.
2. **Uji Nota Permanen**:
   - Lakukan transaksi pembelian saat harga Beras Rp68.000. Cetak notanya.
   - Login sebagai `owner`, ubah harga Beras menjadi Rp75.000 di menu Master Produk.
   - Buka menu Riwayat Penjualan dan lihat kembali nota yang tadi dibuat: harganya **tetap Rp68.000**, tidak berubah menjadi Rp75.000! Integritas data finansial toko terjamin 100%.

#### Skenario 5: Uji Coba Lengkap Modul Loyalty Member (Fitur Terbaru)
1. **Pendaftaran Cepat di Meja Kasir**:
   - Login sebagai `cashier`. Buka menu **Kasir POS**.
   - Di atas keranjang kasir, klik tombol **+ Member**.
   - Masukkan Nama: `Budi Hartono`, No. HP: `081288889999`.
   - Klik **Simpan & Pilih**. Member langsung terdaftar dan otomatis terpasang di keranjang kasir dengan saldo awal 10 Poin!
2. **Perolehan Poin Belanja**:
   - Masukkan barang belanjaan senilai Rp100.000 ke keranjang.
   - Kasir akan melihat preview: `Estimasi poin belanja ini: +10 Pts`.
   - Bayar dengan uang tunai.
   - Struk thermal muncul: menampilkan nama `Budi Hartono`, poin didapat `+10 Pts`, dan saldo akhir menjadi `20 Pts`.
3. **Penukaran Poin Diskon di Kasir**:
   - Pada transaksi berikutnya, pilih kembali member `Budi Hartono`.
   - Centang opsi **Tukarkan Poin**.
   - Sistem langsung memberikan potongan harga sebesar Rp2.000 (20 Poin x Rp100).
   - Total tagihan yang harus dibayar otomatis berkurang Rp2.000!
4. **Verifikasi Hak Akses Penyesuaian Poin Manual (Owner vs Cashier)**:
   - Buka menu **Loyalty Member**.
   - Saat login sebagai `cashier`, kasir **tidak memiliki tombol penyesuaian manual**. Kasir hanya bisa melihat kartu member dan riwayat mutasi poin.
   - Login sebagai `owner`. Klik tombol ikon slider (*Penyesuaian Poin Manual*).
   - Masukkan tambahan `+50 Poin` dengan alasan: *"Bonus perayaan ulang tahun toko"*.
   - Klik simpan. Buka riwayat mutasi poin: tercatat rapi mutasi `ADJUSTMENT` dengan alasan audit resmi!

---

## 9. Tips Belajar & Cara Menelusuri Bug untuk Junior

Jika kamu menemui kendala saat mengembangkan aplikasi fullstack, ikuti urutan pengecekan ini:
1. **Cek Tab Console di Browser (Tekan F12)**: Lihat apakah ada teks error merah JavaScript.
2. **Cek Tab Network di Browser**: Klik request yang berwarna merah (misal status 400, 401, 403, atau 500) dan buka tab **Preview** atau **Response** untuk membaca pesan error yang dikirim oleh backend.
3. **Cek Terminal Backend**: Terminal backend Express akan mencetak detail letak file dan nomor baris kode yang mengalami error.
4. **Alur Standar Menambahkan Fitur Baru**:
   - Buat/update model database di folder `backend/models/`.
   - Buat logika bisnis di fungsi controller di folder `backend/controllers/`.
   - Daftarkan URL rute di folder `backend/routes/`.
   - Sambungkan ke `backend/server.js`.
   - Panggil endpoint tersebut menggunakan `apiClient` di halaman React frontend.

---
*Dokumen panduan ini disusun khusus untuk membimbing programmer magang memahami arsitektur web modern fullstack secara menyeluruh. Selamat belajar dan selamat berkarya!* 🚀
