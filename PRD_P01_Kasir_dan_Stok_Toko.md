# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Proyek P01 • Aplikasi Kasir dan Stok Toko (Point of Sale & Inventory System)

---

### Informasi Dokumen
- **Kode Proyek**: P01
- **Nama Proyek**: Kasir dan Stok Toko
- **Penanggung Jawab (PIC)**: Rizqon Nauval Zaloni
- **Institusi Penyelenggara**: PT Flash Tech Indonesia & BPVP Padang
- **Program**: On-the-Job Training (OJT) Fullstack Web Developer 2026
- **Periode Pelaksanaan**: 22 Oktober 2026 – 19 November 2026 (20 Hari Kerja)
- **Status Versi Dokumen**: v1.0 (Berdasarkan Kurikulum & Jobdesk OJT v1.2)
- **Basis Referensi Dokumen**: Surat BPVP B-2.15/852/LP.03.00/X/2026 & Kurikulum Flash Tech v1.2

---

## 1. Ringkasan Eksekutif & Latar Belakang (Executive Summary)

### 1.1 Latar Belakang
Banyak toko kecil/kelontong (single outlet, single location) menghadapi permasalahan operasional mendasar:
1. **Pencatatan Stok Tidak Akurat**: Stok barang di etalase seringkali tidak sesuai dengan catatan buku, rentan kehilangan barang, dan tidak ada jejak riwayat masuk/keluar barang.
2. **Perhitungan Kasir Rawan Salah**: Kasir manual mengandalkan kalkulator fisik yang rawan kesalahan hitung kembalian dan total belanja.
3. **Ketiadaan Bukti Transaksi Resmi**: Pelanggan tidak menerima nota cetak yang jelas, serta kesulitan melacak histori penjualan masa lalu.
4. **Rekapitulasi Kas Harian Manual**: Pemilik toko harus meluangkan waktu berjam-jam tiap malam menghitung fisik uang dan nota kertas untuk mengetahui omset hari itu.
5. **Rendahnya Retensi Pelanggan**: Toko konvensional tidak memiliki sistem keanggotaan dan apresiasi loyalitas belanja berulang, sehingga pelanggan mudah berpindah ke minimarket berjejaring besar.

### 1.2 Solusi Produk
Aplikasi **P01 • Kasir, Manajemen Stok Toko & Loyalty Member** adalah sistem POS (Point of Sale), Inventaris, dan Retensi Pelanggan berbasis Web terpadu, dirancang untuk toko ritel dengan skema penjualan barang satuan, transaksi tunai (*cash*), dan program loyalitas pelanggan bertingkat (*Tier-based loyalty*).

Aplikasi ini mengedepankan **integritas data finansial, pergerakan stok, dan keamanan audit poin**, di mana:
- Stok tidak dapat dimanipulasi manual di luar transaksi resmi.
- Perhitungan transaksi dan perolehan/penukaran poin dilakukan secara ketat di sisi server (*server-side calculation*).
- Transaksi penjualan, pemotongan stok, dan mutasi poin dieksekusi secara atomik (*database transaction ACID*) guna mencegah selisih stok dan manipulasi poin.
- Setiap pergerakan poin tersimpan permanen dalam buku audit (*immutable audit trail*).

---

## 2. Tujuan & Sasaran Produk (Goals & Non-Goals)

### 2.1 Tujuan Produk (Product Goals)
- **Akurasi Stok 100%**: Menjamin stok barang di database selalu sinkron dengan riwayat barang masuk (*stock movement*) dan penjualan kasir (*sales*), tanpa kemungkinan stok minus.
- **Integritas Finansial**: Memastikan harga item yang tercetak pada nota bersifat permanen (*immutable historical snapshot*), tidak berubah meskipun harga master produk diubah di kemudian hari.
- **Kemudahan Operasional Kasir**: Antarmuka kasir yang responsif, cepat, intuitif, mendukung pencarian barang cepat, dan langsung menghasilkan nota siap cetak browser.
- **Transparansi Pemilik**: Pemilik toko dapat memantau pergerakan stok masuk, riwayat penjualan, dan rekap penerimaan kas harian secara *real-time*.

### 2.2 Batasan Versi Awal (Out of Scope / Non-Goals untuk MVP)
Sesuai arahan kurikulum Flash Tech v1.2, fitur-fitur berikut **DILARANG** dimasukkan ke dalam ruang lingkup MVP 20 hari kerja guna menjaga fokus penyelesaian fondasi utama:
- ❌ Multi-cabang / multi-outlet (Aplikasi hanya untuk 1 lokasi instalasi).
- ❌ Modul Supplier, PO (Purchase Order), dan Hutang Pembelian.
- ❌ Retur barang, refund dana, atau pembatalan transaksi setelah nota terbit.
- ❌ Harga bertingkat (grosir/eceran), diskon kompleks, voucher promosi, atau formula pajak PPN.
- ❌ Mode offline (PWA offline sync / local storage sync).
- ❌ Integrasi Payment Gateway otomatis (QRIS dinamis, EDC perbankan, e-wallet API).
- ❌ Registrasi publik / pendaftaran mandiri (User dibuat manual melalui seed database / manajemen admin).

---

## 3. Persona & Hak Akses Pengguna (User Roles & Matrix RBAC)

Aplikasi memiliki 2 (dua) peran pengguna dengan batasan hak akses yang ditegakkan di level API middleware backend:

### 3.1 Peran Pengguna
1. **Pemilik (Owner / Admin)**:
   - Pemilik toko yang memiliki otoritas penuh terhadap setup identitas toko, master produk, harga, stok masuk, transaksi kasir, serta seluruh laporan omset dan audit trail.
2. **Kasir (Operator / Cashier)**:
   - Karyawan toko yang bertugas di meja kasir. Hanya berhak mengakses modul transaksi penjualan, melihat katalog produk (pembacaan stok untuk melayani pembeli), mencetak nota, dan melihat riwayat transaksinya sendiri. Dilarang mengubah master produk atau menginput stok masuk.

### 3.2 Matriks Hak Akses (Role-Based Access Control)

| Fitur / Modul | Pemilik (Owner) | Kasir (Cashier) | Keterangan Aturan |
| :--- | :---: | :---: | :--- |
| **Login & Logout** | ✅ Ya | ✅ Ya | Autentikasi JWT |
| **Ubah Profil Toko** | ✅ Ya | ❌ Ditolak | Nama toko, alamat, kontak, footer nota |
| **Lihat Katalog Produk** | ✅ Ya | ✅ Ya | Kasir hanya membaca (Read-only) |
| **Tambah / Edit Produk** | ✅ Ya | ❌ Ditolak | Ditolak oleh middleware `authorize(['owner'])` |
| **Nonaktifkan Produk** | ✅ Ya | ❌ Ditolak | Soft-deactivation (tidak hapus fisik) |
| **Input Stok Masuk** | ✅ Ya | ❌ Ditolak | Mutasi stok hanya melalui pencatatan resmi |
| **Lihat Riwayat Stok** | ✅ Ya | ❌ Ditolak | Log histori pergerakan stok masuk |
| **Buka Kasir & Keranjang**| ✅ Ya | ✅ Ya | Pemilihan produk & input kuantitas |
| **Proses Checkout & Bayar**| ✅ Ya | ✅ Ya | Eksekusi transaksi atomik |
| **Cetak Nota Transaksi** | ✅ Ya | ✅ Ya | Cetak via browser print |
| **Lihat Riwayat Penjualan**| ✅ Ya | ✅ Terbatas | Kasir hanya riwayat hari berjalan |
| **Lihat Rekap Harian** | ✅ Ya | ❌ Ditolak | Total omset & ringkasan uang tunai |
| **Cari & Lihat Member** | ✅ Ya | ✅ Ya | Autocomplete nama, nomor HP, dan kode kartu |
| **Daftar Member Baru** | ✅ Ya | ✅ Ya | Pendaftaran cepat langsung di loket kasir / halaman member |
| **Tukar Poin Diskon Kasir**| ✅ Ya | ✅ Ya | 1 Poin = Rp 100 diskon tunai langsung |
| **Penyesuaian Poin Manual** | ✅ Ya | ❌ Ditolak | Hanya Owner dengan alasan audit wajib (Pessimistic Lock) |
| **Ubah Status / Tier Member**| ✅ Ya | ❌ Ditolak | Wewenang pengaturan status/level dipegang Owner |
| **Hapus / Arsipkan Member** | ✅ Ya | ❌ Ditolak | Soft-archive (diarsipkan) jika sudah punya riwayat belanja |

---

## 4. Alur Bisnis Inti (Core Business Flow)

Alur operasional utama P01 mengikuti diagram sekuensial berikut:

```
[Master Produk]
      │
      ▼
[Pencatatan Stok Masuk] ──▶ (Stok Tersedia Bertambah di Database)
      │
      ▼
[Modul Kasir] ──▶ Tambah Item ke Keranjang ──▶ Validasi Kuantitas vs Stok
      │
      ├─────────────────▶ [Cari / Pasang Member Pelanggan]
      │                         │
      │                         ▼
      │                   [Opsi Tukar Poin (Redeem)] ──▶ Diskon 1 Pts = Rp 100
      │                         │
      ▼                         ▼
[Pembayaran Tunai] ──▶ Input Uang Diterima ──▶ Hitung Kembalian (Server-side)
      │
      ▼
[Simpan Checkout Atomik] ──▶ [Insert Sale & SaleItems] + [Kurangi Stok Product]
      │                        + [Mutasi Poin: Redeem & Earn] + [Auto Tier Progression]
      ▼
[Cetak Nota Browser] ──▶ Nota Transaksi + Sisa Saldo Poin Diserahkan ke Pelanggan
      │
      ▼
[Rekap Harian & Dashboard] ──▶ Pemilik Memverifikasi Total Kas & Liabilitas Poin
```

---

## 5. Aturan Bisnis Kritis (Core Business Rules & Data Integrity)

Berikut adalah aturan bisnis mutlak (*non-negotiable business rules*) yang harus dipenuhi:

1. **Aturan Mutasi Stok (No Direct Stock Mutation)**:
   - Nilai kolom `stock` pada tabel `products` **DILARANG KERAS** diubah secara bebas melalui form edit produk master.
   - Penambahan stok hanya diizinkan melalui form **Stok Masuk** yang akan membuat *record* baru pada tabel `stock_movements`.
   - Pengurangan stok hanya diizinkan melalui proses **Checkout Penjualan** pada tabel `sales`.

2. **Aturan Nilai Historis & Immutabilitas Nota (Price & Name Snapshotting)**:
   - Pada saat checkout terjadi, nama produk dan harga jual saat itu disalin secara permanen (*snapshot*) ke dalam tabel `sale_items` (`price_at_sale`, `product_name_at_sale`).
   - Apabila Pemilik Toko di kemudian hari menaikkan atau menurunkan harga master di tabel `products`, **seluruh nota dan riwayat penjualan yang sudah terjadi di masa lalu TIDAK BOLEH BERUBAH sedikitpun**.

3. **Integritas Transaksi Atomik (ACID Transaction on Checkout)**:
   - Operasi checkout penjualan harus dibungkus dalam satu blok transaksi database database (`sequelize.transaction`).
   - Langkah checkout:
     1. Kunci baris produk (`SELECT ... FOR UPDATE`).
     2. Validasi ulang ketersediaan stok fisik di database.
     3. Kurangi stok produk.
     4. Buat entri `sales`.
     5. Buat entri `sale_items`.
   - Jika salah satu item gagal (misalnya stok tiba-tiba habis oleh transaksi lain), maka **seluruh transaksi harus di-ROLLBACK secara penuh**. Tidak boleh ada data parsial tersimpan (*zero orphan records*).

4. **Penolakan Stok Negatif & Validasi Bilangan Bulat Positif**:
   - Nilai kuantitas barang masuk maupun barang yang dibeli harus berupa bilangan bulat positif (`quantity >= 1`, *integer*). Tidak ada kuantitas desimal atau negatif.
   - Nilai stok produk tidak boleh bernilai negatif (`stock >= 0`). Jika sisa stok < kuantitas yang diminta, sistem wajib menolak transaksi dengan respon error `400 Bad Request`.

5. **Soft-Deactivation untuk Integritas Relasi Data**:
   - Produk yang sudah memiliki riwayat mutasi stok masuk atau riwayat penjualan **DILARANG DIHAPUS FISIK (HARD DELETE)** dari database.
   - Penghapusan produk digantikan dengan pengubahan status menjadi `is_active = false`. Produk non-aktif tidak akan muncul di layar kasir, namun tetap valid pada riwayat penjualan lampau.

6. **Perhitungan Server-Side & Mata Uang Bulat**:
   - Perhitungan total belanja (`subtotal`, `grand_total`), kembalian (`change`), dan validasi kecukupan uang tunai (`cash_paid >= grand_total`) **wajib dihitung ulang di server**, bukan hanya mempercayai kalkulasi dari antarmuka frontend.
   - Seluruh nilai nominal uang menggunakan mata uang Rupiah bulat (bilangan bulat *integer*, tanpa desimal sen).

7. **Zona Waktu Tunggal**:
   - Semua pencatatan waktu transaksi menggunakan acuan zona waktu Indonesia Barat (`Asia/Jakarta` / UTC+7).

8. **Valuasi & Penukaran Poin Loyalty (1 Poin = Rp 100)**:
   - Setiap 1 Poin member memiliki nilai tetap sebesar **Rp 100** diskon langsung (`discountAmount = pointsToRedeem * 100`).
   - Penukaran poin maksimal sebesar subtotal belanja (`discountAmount <= subtotal`).
   - Poin yang ditukar langsung dipotong secara transaksional dari saldo aktif member dan dicatat permanen pada tabel `member_point_histories` dengan tipe `REDEEM`.

9. **Perolehan Poin (Earn Rate) & Pengali Level Tier Otomatis**:
   - Poin baru dihitung dari nilai belanja bersih setelah potongan diskon poin (`finalTotal = subtotal - discountAmount`).
   - Formula perolehan poin: `Math.floor((finalTotal / 10000) * multiplier)`.
   - Rasio pengali (*multiplier*) ditentukan oleh level tier akumulasi belanja seumur hidup (`total_spent`):
     - **Bronze** (`total_spent < Rp 1.000.000`): Pengali **1.0x** (1 Pts per Rp 10.000).
     - **Silver** (`total_spent >= Rp 1.000.000`): Pengali **1.2x** (1.2 Pts per Rp 10.000).
     - **Gold** (`total_spent >= Rp 5.000.000`): Pengali **1.5x** (1.5 Pts per Rp 10.000).
     - **Platinum** (`total_spent >= Rp 15.000.000`): Pengali **2.0x** (2.0 Pts per Rp 10.000).
   - Evaluasi kenaikan tier dilakukan otomatis (*auto-tier upgrade*) begitu nilai `total_spent` bertambah dan melampaui ambang batas tier berikutnya.

10. **Integritas Transaksional, Pessimistic Locking & Audit Trail Mutasi Poin**:
    - Penyesuaian poin manual oleh Owner (`ADJUSTMENT`) wajib menggunakan transaksi database dengan Pessimistic Locking (`transaction.LOCK.UPDATE`) untuk mencegah benturan data dengan transaksi kasir yang berlangsung bersamaan.
    - Setiap penyesuaian manual wajib menyertakan alasan tertulis (*audit reason*) minimal 4 karakter.
    - Seluruh mutasi saldo poin (`EARN`, `REDEEM`, `BONUS`, `ADJUSTMENT`) bersifat *immutable* (tidak dapat diedit maupun dihapus), membentuk buku besar audit (*ledger*) yang akurat.
    - Member yang sudah memiliki riwayat transaksi dilindungi dari penghapusan fisik (*hard delete* ditolak) dan dialihkan ke status non-aktif (`is_active = false`) demi menjaga integritas data riwayat nota.

---

## 6. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### 6.1 Modul 1: Autentikasi, Akun & Profil Usaha
- **FR-AUTH-01**: Pengguna dapat masuk (*login*) menggunakan username/email dan password.
- **FR-AUTH-02**: Sistem memverifikasi kata sandi menggunakan hashing `bcryptjs`.
- **FR-AUTH-03**: Sistem menghasilkan JWT token yang menyimpan `id`, `name`, dan `role` pengguna dengan masa berlaku tertentu.
- **FR-AUTH-04**: Sistem menyediakan proteksi rute di frontend dan middleware otorisasi di backend.
- **FR-PROF-01**: Pemilik toko dapat melihat dan mengubah profil usaha:
  - Nama Toko
  - Alamat Toko
  - Nomor Telepon / Kontak
  - Pesan Footer Nota (misal: "Barang yang sudah dibeli tidak dapat ditukar").

### 6.2 Modul 2: Manajemen Produk & Katalog
- **FR-PROD-01**: Pemilik toko dapat menambahkan produk baru dengan atribut: SKU (unik), Nama Produk, Harga Jual (Rupiah bulat > 0). Stok awal otomatis diset 0 (diisi via stok masuk).
- **FR-PROD-02**: Pemilik toko dapat memperbarui Nama Produk dan Harga Jual. (Perubahan harga tidak mempengaruhi transaksi masa lalu).
- **FR-PROD-03**: Pemilik toko dapat mengaktifkan atau menonaktifkan status produk (`is_active`).
- **FR-PROD-04**: Kasir dan Pemilik dapat melakukan pencarian produk secara instan berdasarkan nama produk atau barcode/SKU.
- **FR-PROD-05**: Daftar produk menampilkan informasi stok *real-time* saat ini.

### 6.3 Modul 3: Manajemen Stok Masuk (Stock In)
- **FR-STOK-01**: Pemilik toko dapat mencatat barang masuk dengan memilih produk, mengisi kuantitas masuk (integer bulat > 0), nomor referensi/surat jalan/catatan, dan tanggal masuk.
- **FR-STOK-02**: Sistem otomatis mencatat identitas user penginput (`created_by_user_id`) dan menambah kolom `stock` pada tabel `products` secara atomik.
- **FR-STOK-03**: Sistem mencatat histori pergerakan stok pada tabel `stock_movements`.
- **FR-STOK-04**: Pemilik toko dapat melihat log riwayat pergerakan barang masuk beserta keterangan tanggal, referensi, jumlah kuantitas, dan operator yang mencatat.

### 6.4 Modul 4: Antarmuka Kasir & Checkout Transaksi (POS)
- **FR-POS-01**: Antarmuka kasir menampilkan katalog produk aktif yang dapat diklik atau dicari menggunakan pencarian SKU/nama.
- **FR-POS-02**: Kasir dapat menambahkan produk ke keranjang belanja (*cart*).
- **FR-POS-03**: Kasir dapat mengubah kuantitas beli pada keranjang atau menghapus item dari keranjang.
- **FR-POS-04**: Sistem memvalidasi bahwa kuantitas yang diminta dalam keranjang tidak melebihi sisa stok yang tersedia di database.
- **FR-POS-05**: Kasir menginput nominal pembayaran tunai (`cash_paid`).
- **FR-POS-06**: Antarmuka menampilkan kalkulasi kembalian (`change = cash_paid - total_amount`). Jika `cash_paid < total_amount`, tombol checkout dinonaktifkan.
- **FR-POS-07**: Ketika tombol "Proses Pembayaran" ditekan:
  - Sistem mengirim payload checkout ke backend.
  - Backend membuka transaksi atomik (`transaction`).
  - Backend mengunci baris data stok produk.
  - Memastikan stok masih cukup (mencegah *race condition*).
  - Mengurangi stok produk.
  - Membuat record penjualan dengan nomor faktur unik (Format: `TRX-YYYYMMDD-XXXX`).
  - Menyimpan rincian item dengan harga snapshot.
  - Melakukan commit database.
- **FR-POS-08**: Penanganan *Idempotency*: Menolak request ganda dari klik berulang kasir (*prevent double submission*).

### 6.5 Modul 5: Nota Penjualan & Cetak
- **FR-NOTA-01**: Setelah checkout berhasil, aplikasi langsung menampilkan pop-up / tampilan Nota Penjualan.
- **FR-NOTA-02**: Nota memuat informasi:
  - Header: Nama Toko, Alamat, No. Telp.
  - Info Transaksi: Nomor Faktur (Invoice), Tanggal & Jam (WIB), Nama Kasir.
  - Rincian Belanja: Nama Item (snapshot), Kuantitas, Harga Satuan (snapshot), Subtotal per item.
  - Total Belanja, Uang Tunai Diterima, Uang Kembalian.
  - Footer: Ucapan terima kasih dan pesan toko.
- **FR-NOTA-03**: Terdapat tombol "Cetak Nota" yang memicu dialog cetak browser (`window.print()`) dengan CSS teroptimasi untuk ukuran kertas struk kasir (*thermal printer 58mm/80mm*).
- **FR-NOTA-04**: Kasir dapat mencetak ulang nota dari menu Riwayat Penjualan jika diperlukan.

### 6.6 Modul 6: Riwayat Penjualan & Rekap Harian
- **FR-REP-01**: Daftar Riwayat Transaksi menampilkan seluruh transaksi yang telah terjadi, dilengkapi filter rentang tanggal.
- **FR-REP-02**: Pengguna dapat melihat detail item dari setiap transaksi masa lalu.
- **FR-REP-03**: Dashboard Ringkasan Harian (khusus Pemilik) menampilkan metrik:
  - Total Omset Penerimaan Kas Hari Ini (Rp).
  - Jumlah Transaksi Berhasil Hari Ini.
  - Total Kuantitas Barang Terjual Hari Ini.
  - Tabel ringkasan pergerakan uang per tanggal.

### 6.7 Modul 7: Loyalty Member & Program Poin Pelanggan
- **FR-MBR-01**: Kasir dan Pemilik dapat mendaftarkan member baru dengan atribut: Nama Pelanggan, Nomor Telepon/WhatsApp (unik), Email (opsional), dan Alamat (opsional). Sistem menghasilkan Kode Member unik otomatis (`MBR-YYYYMMDD-XXXX`), saldo poin awal 0 (atau bonus registrasi), dan tier awal `Bronze`.
- **FR-MBR-02**: Kasir dan Pemilik dapat melakukan pencarian data member secara instan (*debounced search*) berdasarkan nama, nomor telepon, atau kode member.
- **FR-MBR-03**: Kasir dapat memilih dan menghubungkan data member aktif ke dalam keranjang transaksi belanja kasir POS (*customer attachment*).
- **FR-MBR-04**: Kasir dapat mengaktifkan opsi penukaran poin (*redeem points*) untuk memotong total tagihan belanja, di mana setiap 1 Poin bernilai diskon tunai langsung sebesar **Rp 100**.
- **FR-MBR-05**: Sistem memvalidasi bahwa poin yang ditukarkan tidak melebihi sisa saldo poin aktif member dan nilai nominal diskon tidak melebihi subtotal belanja (`discount_amount <= subtotal`).
- **FR-MBR-06**: Sistem menghitung perolehan poin baru secara otomatis berdasarkan nilai belanja bersih setelah diskon poin (`finalTotal = subtotal - discount_amount`) dikalikan dengan rasio pengali tier member:
  - Bronze (`total_spent < Rp 1.000.000`): Pengali 1.0x (1 Pts per Rp 10.000).
  - Silver (`total_spent >= Rp 1.000.000`): Pengali 1.2x (1.2 Pts per Rp 10.000).
  - Gold (`total_spent >= Rp 5.000.000`): Pengali 1.5x (1.5 Pts per Rp 10.000).
  - Platinum (`total_spent >= Rp 15.000.000`): Pengali 2.0x (2.0 Pts per Rp 10.000).
- **FR-MBR-07**: Sistem memperbarui akumulasi belanja seumur hidup (`total_spent`) member dan menaikkan level tier secara otomatis (*auto-tier upgrade*) begitu syarat akumulasi tercapai.
- **FR-MBR-08**: Sistem mencatat setiap penambahan dan pengurangan saldo poin ke dalam buku besar audit permanen (`member_point_histories`) dengan tipe mutasi: `EARN` (belanja), `REDEEM` (diskon kasir), `BONUS` (daftar), dan `ADJUSTMENT` (penyesuaian manual).
- **FR-MBR-09**: Pengguna dapat melihat profil digital member berbentuk **VIP Loyalty Card** lengkap dengan nama, kode, tier badge, saldo poin, total belanja akumulatif, dan riwayat mutasi poin.
- **FR-MBR-10**: Sistem menyediakan **Modal Dialog Interaktif "Panduan Poin & Kasir"** pada antarmuka Member yang menampilkan matriks perolehan poin per tier, penjelasan nilai 1 Poin = Rp 100, serta 3 template kalimat sapaan/penawaran (*speaking scripts*) kasir saat melayani pelanggan.
- **FR-MBR-11**: Khusus Pemilik Toko (Owner), sistem menyediakan antarmuka penyesuaian saldo poin manual (`ADJUSTMENT`) dengan validasi alasan audit wajib (minimal 4 karakter) dan proteksi *pessimistic row locking*.
- **FR-MBR-12**: Sistem melindungi member yang telah memiliki riwayat belanja dari penghapusan fisik (*hard delete* ditolak) dan mengalihkannya menjadi *soft-deactivation* (`is_active = false`) guna menjamin konsistensi laporan masa lalu.

---

## 7. Model Data & Perancangan Basis Data (Database Design)

Database: **MySQL 8.0** dengan Storage Engine **InnoDB**.

### 7.1 Entity Relationship Diagram (ERD Relasional)

```
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────────┐
│  business_profiles   │         │        users         │────────▶│    refresh_tokens    │
├──────────────────────┤         ├──────────────────────┤  1:N    ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │         │ id (PK)              │
│ store_name           │         │ username (UQ)        │         │ user_id (FK)         │
│ address              │         │ password_hash        │         │ token (UQ)           │
│ phone                │         │ full_name            │         │ expires_at           │
│ receipt_footer       │         │ role (owner/cashier) │         │ created_at           │
│ created_at           │         │ is_active            │         └──────────────────────┘
│ updated_at           │         │ created_at           │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         │ 1:N (created_by)                    │ 1:N (cashier)
                         ▼                                     ▼
┌──────────────────────────────┐                      ┌──────────────────────────────┐
│       stock_movements        │                      │            sales             │
├──────────────────────────────┤                      ├──────────────────────────────┤
│ id (PK)                      │                      │ id (PK)                      │
│ product_id (FK)              │◄────────┐            │ invoice_number (UQ)          │
│ quantity (INT > 0)           │         │            │ user_id (FK) [kasir]         │
│ type (enum: 'in')            │         │            │ member_id (FK, nullable)     │◄───┐
│ reference_number             │         │            │ total_amount (INT)           │    │
│ notes                        │         │            │ discount_amount (INT)        │    │
│ created_by_user_id (FK)      │         │            │ cash_paid (INT)              │    │
│ created_at                   │         │            │ change_returned (INT)        │    │
└──────────────────────────────┘         │            │ points_earned (INT)          │    │
                                         │            │ points_redeemed (INT)        │    │
                                         │            │ transaction_date (DATETIME)  │    │
                                         │            │ created_at                   │    │
                                         │            └──────────────┬───────────────┘    │
                                         │                           │ 1:N                │ 1:N
                                         │                           ▼                    │ (belanja)
┌──────────────────────────────┐         │            ┌──────────────────────────────┐    │
│           products           │         │            │          sale_items          │    │
├──────────────────────────────┤         │            ├──────────────────────────────┤    │
│ id (PK)                      │         │            │ id (PK)                      │    │
│ sku (UQ, VARCHAR 50)         │         │            │ sale_id (FK)                 │    │
│ name (VARCHAR 150)           │         │            │ product_id (FK, nullable)    │    │
│ price (INT, IDR)             │─────────┼───────────▶│ product_name_at_sale         │    │
│ stock (INT >= 0)             │         │            │ price_at_sale (INT)          │    │
│ is_active (BOOLEAN)          │         │            │ quantity (INT > 0)           │    │
│ created_at                   │         │            │ subtotal (INT)               │    │
│ updated_at                   │         │            │ created_at                   │    │
└──────────────────────────────┘         │            └──────────────────────────────┘    │
                                         │                                                │
                                         └─ (Relasi audit jejak stok)                     │
                                                                                          │
┌──────────────────────────────┐         1:N (audit poin)     ┌───────────────────────────┴──┐
│    member_point_histories    │◀─────────────────────────────│           members            │
├──────────────────────────────┤                              ├──────────────────────────────┤
│ id (PK)                      │                              │ id (PK)                      │
│ member_id (FK)               │                              │ member_code (UQ)             │
│ sale_id (FK, nullable)       │                              │ name                         │
│ type (EARN/REDEEM/...)       │                              │ phone (UQ)                   │
│ points (INT)                 │                              │ email (nullable)             │
│ balance_after (INT)          │                              │ address (nullable)           │
│ reason (VARCHAR)             │                              │ points (INT >= 0)            │
│ created_by (FK, nullable)    │                              │ total_spent (BIGINT)         │
│ created_at                   │                              │ tier (bronze..platinum)      │
└──────────────────────────────┘                              │ is_active (BOOLEAN)          │
                                                              │ created_at / updated_at      │
                                                              └──────────────────────────────┘
```

### 7.2 Spesifikasi Skema Tabel (Data Dictionary)

#### 1. Tabel `users`
Menyimpan akun pengguna untuk otentikasi.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik pengguna |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Username login |
| `password_hash`| VARCHAR(255) | NOT NULL | Password terenkripsi bcrypt |
| `full_name` | VARCHAR(100) | NOT NULL | Nama lengkap personil |
| `role` | ENUM('owner','cashier') | NOT NULL | Hak akses peran |
| `is_active` | BOOLEAN | DEFAULT TRUE | Status keaktifan akun |
| `created_at` | DATETIME | NOT NULL | Waktu pembuatan |
| `updated_at` | DATETIME | NOT NULL | Waktu perubahan terakhir |

#### 2. Tabel `business_profiles`
Menyimpan konfigurasi identitas toko fisik.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik profil |
| `store_name` | VARCHAR(100) | NOT NULL | Nama Toko |
| `address` | TEXT | NULL | Alamat fisik toko |
| `phone` | VARCHAR(25) | NULL | Nomor telepon / kontak |
| `receipt_footer`| VARCHAR(255) | NULL | Kalimat penutup pada struk nota |
| `updated_at` | DATETIME | NOT NULL | Waktu perubahan terakhir |

#### 3. Tabel `products`
Menyimpan data master komoditas barang dagangan.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik produk |
| `sku` | VARCHAR(50) | NOT NULL, UNIQUE | Kode unik barang / barcode |
| `name` | VARCHAR(150) | NOT NULL | Nama barang |
| `price` | INT UNSIGNED | NOT NULL | Harga jual satuan (Rupiah bulat) |
| `stock` | INT | NOT NULL, DEFAULT 0 | Jumlah stok fisik saat ini (wajib >= 0) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Status produk (false = diarsipkan) |
| `created_at` | DATETIME | NOT NULL | Waktu pendaftaran produk |
| `updated_at` | DATETIME | NOT NULL | Waktu pembaruan master |

#### 4. Tabel `stock_movements`
Jurnal audit penambahan stok barang masuk (*audit trail*).
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID riwayat mutasi |
| `product_id` | INT | NOT NULL, FK `products(id)` | Produk yang bertambah |
| `quantity` | INT | NOT NULL (CHECK > 0) | Jumlah barang masuk (bulat positif) |
| `type` | ENUM('in') | NOT NULL, DEFAULT 'in' | Tipe mutasi (MVP hanya 'in') |
| `reference_number`| VARCHAR(100) | NULL | No faktur pemasok / surat jalan |
| `notes` | VARCHAR(255) | NULL | Catatan tambahan |
| `created_by_user_id`| INT | NOT NULL, FK `users(id)` | User pemilik yang mencatat |
| `created_at` | DATETIME | NOT NULL | Waktu input mutasi masuk |

#### 5. Tabel `sales`
Header transaksi penjualan kasir terintegrasi Loyalty Member.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID transaksi |
| `invoice_number` | VARCHAR(50) | NOT NULL, UNIQUE | Nomor nota unik (`TRX-YYYYMMDD-XXXX`) |
| `user_id` | INT | NOT NULL, FK `users(id)` | Kasir yang melayani |
| `member_id` | INT | NULL, FK `members(id)` | Relasi member pelanggan (opsional) |
| `total_amount` | INT UNSIGNED | NOT NULL | Total belanja bersih setelah diskon (Rupiah bulat) |
| `discount_amount`| INT UNSIGNED | NOT NULL, DEFAULT 0 | Potongan harga dari penukaran poin |
| `cash_paid` | INT UNSIGNED | NOT NULL | Nominal uang yang diserahkan pembeli |
| `change_returned`| INT UNSIGNED | NOT NULL | Nominal uang kembalian |
| `points_earned` | INT UNSIGNED | NOT NULL, DEFAULT 0 | Poin baru yang didapatkan transaksi ini |
| `points_redeemed`| INT UNSIGNED | NOT NULL, DEFAULT 0 | Poin yang ditukar menjadi diskon |
| `transaction_date`| DATETIME | NOT NULL | Waktu terjadinya transaksi |
| `created_at` | DATETIME | NOT NULL | Timestamp sistem |

#### 6. Tabel `sale_items`
Rincian item per transaksi dengan perlindungan *historical snapshot*.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID baris item transaksi |
| `sale_id` | INT | NOT NULL, FK `sales(id)` ON DELETE CASCADE | Relasi ke faktur induk |
| `product_id` | INT | NULL, FK `products(id)` ON DELETE SET NULL | Relasi produk asal |
| `product_name_at_sale`| VARCHAR(150)| NOT NULL | Snapshot nama saat checkout |
| `price_at_sale` | INT UNSIGNED | NOT NULL | Snapshot harga saat checkout |
| `quantity` | INT UNSIGNED | NOT NULL (CHECK > 0) | Kuantitas yang dibeli |
| `subtotal` | INT UNSIGNED | NOT NULL | `price_at_sale * quantity` |
| `created_at` | DATETIME | NOT NULL | Timestamp sistem |

#### 7. Tabel `members`
Menyimpan profil pelanggan program loyalitas bertingkat (*Tiered Loyalty*).
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik member |
| `member_code` | VARCHAR(50) | NOT NULL, UNIQUE | Kode kartu member (`MBR-YYYYMMDD-XXXX`) |
| `name` | VARCHAR(100) | NOT NULL | Nama lengkap pelanggan |
| `phone` | VARCHAR(25) | NOT NULL, UNIQUE | Nomor WhatsApp / telepon |
| `email` | VARCHAR(100) | NULL | Alamat surel (opsional) |
| `address` | TEXT | NULL | Alamat tempat tinggal |
| `points` | INT | NOT NULL, DEFAULT 0 | Saldo poin aktif saat ini |
| `total_spent` | BIGINT UNSIGNED | NOT NULL, DEFAULT 0 | Akumulasi belanja seumur hidup (Rp) |
| `tier` | ENUM('bronze','silver','gold','platinum') | NOT NULL, DEFAULT 'bronze' | Level tingkatan member |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Status keaktifan akun |
| `created_at` | DATETIME | NOT NULL | Waktu pendaftaran |
| `updated_at` | DATETIME | NOT NULL | Waktu perubahan profil |

#### 8. Tabel `member_point_histories`
Buku besar audit (*audit trail ledger*) seluruh pergerakan poin member.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik mutasi poin |
| `member_id` | INT | NOT NULL, FK `members(id)` ON DELETE CASCADE | Member pemilik poin |
| `sale_id` | INT | NULL, FK `sales(id)` ON DELETE SET NULL | Relasi faktur nota transaksi (jika dari POS) |
| `type` | ENUM('EARN','REDEEM','BONUS','ADJUSTMENT') | NOT NULL | Kategori mutasi poin |
| `points` | INT | NOT NULL | Nominal mutasi (+ poin masuk / - poin keluar) |
| `balance_after`| INT | NOT NULL | Snapshot saldo akhir member setelah mutasi |
| `reason` | VARCHAR(255) | NULL | Alasan manual audit atau keterangan nota |
| `created_by` | INT | NULL, FK `users(id)` ON DELETE SET NULL | Operator/Owner yang mengeksekusi |
| `created_at` | DATETIME | NOT NULL | Waktu mutasi poin tercatat |

#### 9. Tabel `refresh_tokens`
Menyimpan token sesi refresh berbasis rotasi aman.
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | PK | ID unik sesi token |
| `user_id` | INT | NOT NULL, FK `users(id)` ON DELETE CASCADE | Pemilik sesi login |
| `token` | VARCHAR(255) | NOT NULL, UNIQUE | String token refresh acak aman |
| `expires_at` | DATETIME | NOT NULL | Waktu batas kedaluwarsa sesi |
| `created_at` | DATETIME | NOT NULL | Waktu token dibuat |

---

## 8. Spesifikasi & Kontrak API (API Specifications)

Format Respon Standar:
- Respon Sukses: `{ "success": true, "message": "...", "data": { ... } }`
- Respon Gagal: `{ "success": false, "message": "...", "errors": [ ... ] }`

### 8.1 Modul Autentikasi (`/api/auth`)
- `POST /api/auth/login`
  - Akses: Publik
  - Body: `{ "username": "admin", "password": "password123" }`
  - Respon: Token JWT, data user `{ id, username, full_name, role }`.
- `GET /api/auth/me`
  - Akses: Logged-in (Bearer Token)
  - Respon: Data sesi pengguna aktif saat ini.

### 8.2 Modul Profil Usaha (`/api/business-profile`)
- `GET /api/business-profile`
  - Akses: Owner, Cashier
  - Respon: Informasi data toko untuk header nota.
- `PUT /api/business-profile`
  - Akses: Owner
  - Body: `{ "store_name": "Toko Berkah", "address": "Jl. Sudirman No. 12", "phone": "08123456789", "receipt_footer": "Terima kasih atas kunjungan Anda" }`

### 8.3 Modul Master Produk (`/api/products`)
- `GET /api/products`
  - Akses: Owner, Cashier
  - Query Params: `?search=kopi&is_active=true`
  - Respon: Array daftar produk beserta sisa stok saat ini.
- `POST /api/products`
  - Akses: Owner
  - Body: `{ "sku": "BRG-001", "name": "Beras Ramos 5kg", "price": 68000 }`
  - Validasi: SKU harus unik, harga > 0.
- `PUT /api/products/:id`
  - Akses: Owner
  - Body: `{ "name": "Beras Ramos 5kg Premium", "price": 70000, "is_active": true }`
  - Catatan: Tidak menerima manipulasi kolom `stock`.
- `PATCH /api/products/:id/status`
  - Akses: Owner
  - Body: `{ "is_active": false }`
  - Catatan: Soft-deactivation.

### 8.4 Modul Stok Masuk (`/api/stock-movements`)
- `POST /api/stock-movements`
  - Akses: Owner
  - Body:
    ```json
    {
      "product_id": 1,
      "quantity": 25,
      "reference_number": "SJ-2026-10-001",
      "notes": "Kiriman distributor pusat"
    }
    ```
  - Validasi: `quantity` integer > 0.
  - Efek: Menambah `products.stock` dan mencatat audit pergerakan.
- `GET /api/stock-movements`
  - Akses: Owner
  - Query Params: `?product_id=1&start_date=2026-10-01`
  - Respon: Histori pergerakan barang masuk lengkap dengan nama pencatat.

### 8.5 Modul Kasir & Transaksi (`/api/sales`)
- `POST /api/sales/checkout`
  - Akses: Owner, Cashier
  - Body:
    ```json
    {
      "cash_paid": 100000,
      "member_id": 1,
      "points_to_redeem": 20,
      "items": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 4, "quantity": 1 }
      ]
    }
    ```
  - Aturan Backend:
    1. Membuka `sequelize.transaction`.
    2. Query produk dengan lock: `SELECT * FROM products WHERE id IN (...) FOR UPDATE`.
    3. Validasi apakah semua produk berstatus `is_active = true`.
    4. Validasi apakah setiap `product.stock >= item.quantity`. Jika ada yang kurang -> Rollback & Return `400 Bad Request`.
    5. Hitung kotor `subtotal = sum(product.price * item.quantity)`.
    6. Jika `member_id` disertakan:
       - Kunci baris member: `SELECT * FROM members WHERE id = ? FOR UPDATE`.
       - Validasi keaktifan member (`is_active = true`).
       - Jika `points_to_redeem > 0`: validasi `member.points >= points_to_redeem`.
       - Hitung diskon: `discount_amount = points_to_redeem * 100`.
       - Validasi `discount_amount <= subtotal`.
       - Hitung total bersih: `total_amount = subtotal - discount_amount`.
       - Potong saldo poin member dan catat mutasi `REDEEM` di `member_point_histories`.
    7. Validasi `cash_paid >= total_amount`. Jika kurang -> Rollback & Return `400 Bad Request`.
    8. Generate nomor invoice unik (`TRX-YYYYMMDD-XXXX`).
    9. Potong stok pada masing-masing produk: `stock = stock - item.quantity`.
    10. Jika member aktif:
        - Hitung perolehan poin: `points_earned = Math.floor((total_amount / 10000) * multiplier)`.
        - Tambah saldo poin member & catat mutasi `EARN` di `member_point_histories`.
        - Tambah `member.total_spent += total_amount` dan evaluasi kenaikan level tier otomatis.
    11. Simpan record tabel `sales` dan array tabel `sale_items`.
    12. Commit transaksi.
  - Respon: Faktur lengkap siap cetak (`sales` join `sale_items` dan data member jika ada).
- `GET /api/sales`
  - Akses: Owner, Cashier (Cashier dibatasi hari ini)
  - Query Params: `?start_date=2026-10-23&end_date=2026-10-23`
  - Respon: Riwayat daftar transaksi penjualan.
- `GET /api/sales/:id`
  - Akses: Owner, Cashier
  - Respon: Detail spesifik faktur beserta rincian snapshot item untuk cetak ulang nota.

### 8.6 Modul Rekapitulasi Kas Harian (`/api/reports`)
- `GET /api/reports/daily-summary`
  - Akses: Owner
  - Query Params: `?date=2026-10-23`
  - Respon:
    ```json
    {
      "date": "2026-10-23",
      "total_sales_count": 42,
      "total_revenue": 2850000,
      "total_items_sold": 115
    }
    ```

### 8.7 Modul Loyalty Member & Poin (`/api/members`)
- `GET /api/members`
  - Akses: Owner, Cashier
  - Query Params: `?search=budi&tier=silver&is_active=true&page=1&limit=10`
  - Respon: Daftar pelanggan terpaginasi, total poin, dan statistik ringkas.
- `POST /api/members`
  - Akses: Owner, Cashier
  - Body: `{ "name": "Budi Hartono", "phone": "081288889999", "email": "budi@email.com", "address": "Jl. Mawar No. 10" }`
  - Validasi: `name` dan `phone` wajib, nomor telepon harus unik.
  - Efek: Generate `member_code` unik, saldo awal poin, tier awal `bronze`.
- `GET /api/members/:id`
  - Akses: Owner, Cashier
  - Respon: Profil lengkap member, tier, total akumulasi belanja, dan saldo poin aktif.
- `PUT /api/members/:id`
  - Akses: Owner, Cashier
  - Body: `{ "name": "Budi Hartono Sp.", "phone": "081288889999", "email": "budi.new@email.com", "address": "Padang" }`
  - Respon: Data member terupdate.
- `DELETE /api/members/:id`
  - Akses: Owner
  - Efek: Jika member belum pernah transaksi -> Hard delete. Jika sudah memiliki riwayat transaksi -> Soft-archive (`is_active = false`).
- `GET /api/members/:id/history`
  - Akses: Owner, Cashier
  - Respon: Buku besar audit jejak mutasi poin (`EARN`, `REDEEM`, `BONUS`, `ADJUSTMENT`) dengan saldo setelah mutasi dan alasan audit.
- `POST /api/members/:id/adjust-points`
  - Akses: Owner Only
  - Body: `{ "type": "add", "points": 50, "reason": "Bonus apresiasi pelanggan terloyal" }`
  - Validasi: `reason` minimal 4 karakter, poin bulat positif.
  - Efek: Eksekusi atomik dengan *row locking*, update saldo member, dan mencatat mutasi `ADJUSTMENT`.

---

## 9. Skenario Pengujian Mutlak (Mandatory Test Scenarios A01 - A05)

Berdasarkan Halaman 6 Kurikulum OJT v1.2 dan pengembangan modul loyalty, proyek P01 memiliki 5 skenario uji wajib yang harus dibuktikan secara otomatis dan saat demo evaluasi:

### Skenario A01: Uji Perhitungan Normal & Pemotongan Stok
- **Kondisi Awal**:
  - Produk X: Harga Rp10.000, Stok = 10.
  - Produk Y: Harga Rp15.000, Stok = 5.
- **Aksi Transaksi**:
  - Keranjang: 2 unit Produk X + 1 unit Produk Y.
  - Pembayaran tunai: Rp50.000 diserahkan pembeli.
- **Hasil yang Diharapkan (Expected Result)**:
  - Total belanja tepat: (2 × 10.000) + (1 × 15.000) = **Rp35.000**.
  - Kembalian tepat: Rp50.000 - Rp35.000 = **Rp15.000**.
  - Stok Produk X berkurang menjadi **8**.
  - Stok Produk Y berkurang menjadi **4**.
  - Nota terbit dengan nilai snapshot yang akurat.

### Skenario A02: Uji Persaingan Stok Terakhir (Concurrency / Race Condition)
- **Kondisi Awal**:
  - Produk Z memiliki sisa stok = **1 unit**.
- **Aksi Pengujian**:
  - Dua request checkout (`Request A` dan `Request B`) dikirimkan secara simultan/bersamaan meminta 1 unit Produk Z.
- **Hasil yang Diharapkan (Expected Result)**:
  - Maksimal hanya 1 request yang berhasil (sukses `201 Created`).
  - Request lainnya ditolak oleh server dengan pesan error stok habis (`400 Bad Request: Stok tidak mencukupi`).
  - Sisa stok di database akhir tepat bernilai **0**, **TIDAK BOLEH MENJADI NEGATIF (-1)**.

### Skenario A03: Uji Kegagalan Simpan & Request Ganda (Atomicity & Idempotency)
- **Kondisi Awal**:
  - Simulasikan *error* database saat menyimpan item kedua dalam keranjang belanja atau matikan koneksi saat insert berlangsung.
  - Kirim ulang payload checkout yang identik dua kali secara beruntun (*double-click / double-request*).
- **Hasil yang Diharapkan (Expected Result)**:
  - Rollback otomatis bekerja: tidak ada record penjualan parsial / yatim piatu (*orphan record*) yang tersimpan.
  - Stok barang tidak terpotong jika transaksi gagal secara sistem.
  - Pengiriman request ganda tidak menghasilkan dua nota invoice yang menduplikasi penerimaan kas toko.

### Skenario A04: Uji Pembatasan Hak Akses & Immutabilitas Harga Historis
- **Pengujian Hak Akses (RBAC)**:
  - Akun ber-role `cashier` mencoba menembak endpoint `POST /api/stock-movements` atau `POST /api/products`.
  - *Expected*: Server merespon `403 Forbidden` dan menolak operasi.
- **Pengujian Immutabilitas Harga**:
  - Buat transaksi penjualan untuk Produk A dengan harga Rp20.000. Nota berhasil dicetak dengan harga Rp20.000.
  - Pemilik toko kemudian mengedit harga master Produk A menjadi Rp30.000 di katalog master.
  - Buka kembali faktur/nota transaksi lama.
  - *Expected*: Nota transaksi lama **tetap mencantumkan harga Rp20.000**. Snapshot historis tidak terpengaruh oleh kenaikan harga baru.

### Skenario A05: Uji Modul Loyalty Member, Diskon Poin, Pengali Tier & Jejak Audit
- **Kondisi Awal**:
  - Member "Budi Hartono": Tier Bronze (pengali 1.0x), Saldo Poin = 100 Pts, Total Belanja Terakumulasi = Rp 950.000.
  - Keranjang Belanja Kasir: Belanja barang senilai kotor Rp 100.000.
- **Aksi Pengujian**:
  - Kasir memilih member Budi Hartono.
  - Kasir mencentang opsi penukaran 50 Poin.
  - Pembeli membayar dengan uang tunai Rp 100.000.
- **Hasil yang Diharapkan (Expected Result)**:
  - Nilai diskon potongan harga tepat: 50 Pts × Rp 100 = **Rp 5.000**.
  - Total tagihan bersih setelah diskon: Rp 100.000 - Rp 5.000 = **Rp 95.000**.
  - Kembalian uang tunai: Rp 100.000 - Rp 95.000 = **Rp 5.000**.
  - Poin baru yang didapatkan dihitung dari belanja bersih: `Math.floor((95.000 / 10.000) * 1.0) =` **+9 Pts**.
  - Saldo poin akhir member: 100 - 50 + 9 = **59 Pts**.
  - Akumulasi belanja seumur hidup bertambah: Rp 950.000 + Rp 95.000 = **Rp 1.045.000**.
  - Tier member otomatis naik (*auto-upgrade*) dari **Bronze** menjadi **Silver** (karena akumulasi belanja telah melampaui Rp 1.000.000).
  - Tabel `member_point_histories` mencatat 2 mutasi audit transaksional yang tidak dapat diubah:
    1. Tipe `REDEEM`: -50 Pts (saldo setelah: 50 Pts).
    2. Tipe `EARN`: +9 Pts (saldo setelah: 59 Pts).
  - Nota kasir mencantumkan identitas member, diskon poin, poin yang didapatkan, dan sisa saldo akhir.

---

## 10. Standar Teknis & Arsitektur Implementasi

### 10.1 Tech Stack Wajib
- **Frontend**:
  - React 18+ (SPA)
  - Build Tool: Vite
  - CSS / Styling: Tailwind CSS
  - Routing: React Router DOM v6
  - State & HTTP: React Context API / Zustand + Axios Client
  - Iconography: Lucide-React
- **Backend**:
  - Runtime: Node.js (LTS v20+)
  - Framework: Express.js
  - ORM: Sequelize v6
  - Driver Database: `mysql2`
  - Autentikasi: `jsonwebtoken` (JWT) & `bcryptjs`
  - Validasi Input: `express-validator` atau `joi`
- **Database**:
  - MySQL 8.0 (InnoDB Engine, utf8mb4)
- **DevOps & Packaging**:
  - Docker & Docker Compose (Frontend container, Backend container, MySQL container terisolasi)
  - Nginx Reverse Proxy (jika dideploy ke VPS staging)
  - GitHub Actions CI (Automated Lint, Unit Test, Build Check)

### 10.2 Struktur Repositori & Folder
```
p01-kasir-dan-stok/
├── .github/
│   └── workflows/
│       └── ci.yml               # Lint, Test & Build automation
├── backend/
│   ├── config/                  # Konfigurasi DB Sequelize & env
│   ├── controllers/             # Handler logic per modul
│   ├── middlewares/             # Auth JWT, Role Checker, Error Handler
│   ├── migrations/              # Sequelize database migrations
│   ├── models/                  # Sequelize model definitions & associations
│   ├── routes/                  # API routing endpoints
│   ├── seeders/                 # Data dummy awal (owner, cashier, sample products)
│   ├── tests/                   # Automated tests (Jest / Supertest skenario A01-A04)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios instance & API caller functions
│   │   ├── components/          # Reusable UI (Navbar, Modal, Button, Table, Input)
│   │   ├── contexts/            # AuthContext, CartContext
│   │   ├── pages/               # Login, Dashboard, Products, StockIn, Cashier, Receipt, Reports
│   │   ├── utils/               # Currency formatter (Rp), Date formatter (WIB)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   ├── PRD.md                   # Dokumen PRD ini
│   ├── ERD.png / ERD.md         # Dokumentasi skema data
│   ├── API_CONTRACT.md          # Spesifikasi request/response JSON
│   ├── USER_MANUAL.md           # Panduan operasional toko & kasir
│   └── BACKUP_RESTORE.md        # Panduan backup/pemulihan database
├── docker-compose.yml           # Orkestrasi 3 layanan (mysql, backend, frontend)
└── README.md                    # Setup awal & instruksi instalasi lokal
```

---

## 11. Rencana Eksekusi 20 Hari Kerja OJT (Roadmap & Checkpoint)

| Periode | Fokus Kegiatan Utama | Output & Bukti Deliverable | Status Target |
| :--- | :--- | :--- | :--- |
| **Hari 1** | Orientasi, wawancara/observasi toko, asesmen bekal SQL/React. | Catatan observasi toko, scope checklist. | Target Awal |
| **Hari 2** | Finalisasi PRD, Wireframe UI, ERD relasional, Kontrak API. | Scope terkunci, dokumen PRD & ERD disetujui. | Target Awal |
| **Hari 3** | Setup repo git, monorepo backend/frontend, Express, Vite, Tailwind, DB. | Skeleton app berjalan lokal, commit awal bersih. | Setup |
| **Hari 4** | Autentikasi JWT, hashing bcrypt, RBAC middleware, User & Profil Toko. | Login multi-role bekerja, endpoint terlindungi. | Auth |
| **Hari 5** | **CHECKPOINT 1**: CRUD Master Produk, form Stok Masuk, tabel mutasi. | Demo mandiri produk & stok awal tersimpan. | **Milestone 1** |
| **Hari 6** | UI Halaman Kasir, katalog produk interaktif, manajemen State Keranjang. | Antarmuka kasir siap input barang belanjaan. | Core UI |
| **Hari 7** | Backend API Checkout Penjualan atomik (`sequelize.transaction`). | Transaksi tersimpan konsisten, stok berkurang. | Core Backend |
| **Hari 8** | Implementasi aturan bisnis: kunci baris stok, tolak stok minus, snapshot harga. | Proteksi race condition & freeze harga lama. | Business Logic |
| **Hari 9** | Integrasi Frontend Kasir ke Backend Checkout & Modal Konfirmasi Bayar. | Alur belanja -> bayar -> sukses berjalan penuh. | E2E Integration |
| **Hari 10** | **CHECKPOINT 2**: Cetak Nota Transaksi browser & validasi stok konsisten. | Demo kasir end-to-end tanpa bug penghambat. | **Milestone 2** |
| **Hari 11** | Riwayat transaksi penjualan, rincian faktur lama, cetak ulang nota. | Halaman riwayat faktur & modal detail aktif. | History & Doc |
| **Hari 12** | Rekap kas harian, dashboard ringkasan omset & kuantitas terjual. | Dashboard metrik toko berbasis data riil. | Dashboard |
| **Hari 13** | Pengujian menyeluruh Skenario Kritis (A01, A02, A03, A04). | Laporan pengujian otomatis & log hasil uji. | Critical Test |
| **Hari 14** | Bug fixing, perbaikan error handling, styling refinement, review kode. | Regresi lulus, UX mulus, kode rapi & bersih. | Polishing |
| **Hari 15** | **CHECKPOINT 3**: Fitur lengkap beku (*feature freeze*), persiapan rilis. | Demo aplikasi lengkap, daftar batasan tercatat. | **Milestone 3** |
| **Hari 16** | Packaging Docker & Docker-Compose terisolasi, setup GitHub Actions CI. | `docker-compose up` berjalan tanpa konfigurasi rumit. | DevOps |
| **Hari 17** | Staging deployment (VPS Flash Tech), uji backup & restore database MySQL. | URL demo staging aktif, file dump restore valid. | Staging & Ops |
| **Hari 18** | Simulasi UAT (User Acceptance Test) mandiri / calon pemilik toko. | Lembar form UAT terisi dan ditandatangani. | UAT |
| **Hari 19** | Finalisasi README, Panduan Pengguna Kasir, dataset demo lengkap. | Berkas dokumentasi lengkap & siap serah terima. | Documentation |
| **Hari 20** | **CHECKPOINT 4**: Presentasi Akhir, Demo Mandiri, Tanya Jawab & Evaluasi. | Serah terima repositori ke PT Flash Tech Indonesia. | **Final Handover** |

---

## 12. Kriteria Penerimaan & Evaluasi Kelulusan (Definition of Done)

Berdasarkan Rubrik Penilaian Halaman 19:
1. **Kode & Arsitektur (Bobot 25%)**: Struktur folder rapi, penggunaan Sequelize transaction pada checkout, clean code, bebas *hardcoded credentials*.
2. **Fitur & Integrasi (Bobot 30%)**: Alur lengkap `Produk -> Stok Masuk -> Kasir -> Pembayaran -> Nota -> Rekap` berjalan 100% tanpa crash, skenario A01-A04 terverifikasi.
3. **DevOps & Deployment (Bobot 20%)**: Docker Compose berjalan mulus, database memiliki seed dummy realistis, tersedianya panduan backup dan restore SQL.
4. **Kehadiran & Disiplin (Bobot 15%)**: Mengisi logbook harian tepat waktu, menyelesaikan checkpoint sesuai jadwal.
5. **Presentasi & Dokumentasi (Bobot 10%)**: Dokumen PRD, ERD, API Contract, dan Panduan Kasir lengkap; mampu mempertanggungjawabkan kode secara mandiri.

---
*Dokumen PRD ini disusun sebagai acuan kerja resmi pengembang mandiri P01 (Rizqon Nauval Zaloni) pada program OJT Fullstack Web Developer Flash Tech Indonesia & BPVP Padang 2026.*
