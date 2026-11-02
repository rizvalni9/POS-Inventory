# 📖 Bagian 1: Panduan Penggunaan Aplikasi (User Manual)

Dokumen ini berisi panduan operasional langkah demi langkah bagi **Kasir (*Cashier*)** dan **Pemilik Toko (*Owner*)** untuk menjalankan aktivitas penjualan harian, pengelolaan stok barang, program loyalty member, dan konfigurasi toko.

---

## 📑 Daftar Isi
1. [Akses Sistem & Login](#1-akses-sistem--login)
2. [Panduan Operasional Kasir (Cashier)](#2-panduan-operasional-kasir-cashier)
   - 2.1 [Transaksi Kasir POS](#21-transaksi-kasir-pos)
   - 2.2 [Pencarian & Pemilihan Pelanggan Member](#22-pencarian--pemilihan-pelanggan-member)
   - 2.3 [Pendaftaran Member Baru di Meja Kasir](#23-pendaftaran-member-baru-di-meja-kasir)
   - 2.4 [Penukaran Poin Diskon (Redeem Points)](#24-penukaran-poin-diskon-redeem-points)
   - 2.5 [Pembayaran, Kembalian, & Cetak Nota Thermal](#25-pembayaran-kembalian--cetak-nota-thermal)
   - 2.6 [Melihat Riwayat Transaksi Hari Ini](#26-melihat-riwayat-transaksi-hari-ini)
3. [Panduan Operasional Pemilik Toko (Owner)](#3-panduan-operasional-pemilik-toko-owner)
   - 3.1 [Monitoring Dashboard Bisnis](#31-monitoring-dashboard-bisnis)
   - 3.2 [Manajemen Master Produk](#32-manajemen-master-produk)
   - 3.3 [Pencatatan Stok Masuk (Restock Barang)](#33-pencatatan-stok-masuk-restock-barang)
   - 3.4 [Manajemen Loyalty Member & Audit Poin](#34-manajemen-loyalty-member--audit-poin)
   - 3.5 [Riwayat Penjualan Lengkap & Cetak Ulang Nota](#35-riwayat-penjualan-lengkap--cetak-ulang-nota)
   - 3.6 [Manajemen Pengguna (Kelola Akun Kasir)](#36-manajemen-pengguna-kelola-akun-kasir)
   - 3.7 [Pengaturan Profil Toko](#37-pengaturan-profil-toko)
4. [Fitur Mandiri: Ganti Kata Sandi](#4-fitur-mandiri-ganti-kata-sandi)

---

## 1. Akses Sistem & Login

1. Buka browser web (disarankan Google Chrome, Microsoft Edge, atau Mozilla Firefox).
2. Kunjungi alamat: `http://localhost:5173`.
3. Masukkan **Username** dan **Password** Anda:
   - Kasir: `cashier` / `Cashier123!`
   - Pemilik Toko: `owner` / `Owner123!`
4. Klik tombol **Masuk ke Sistem**.
5. Sistem akan mengarahkan pengguna secara otomatis sesuai peran (*role*):
   - **Kasir** $\rightarrow$ langsung masuk ke menu **Kasir POS** (`/pos`).
   - **Owner** $\rightarrow$ langsung masuk ke menu **Dashboard** (`/`).

---

## 2. Panduan Operasional Kasir (Cashier)

### 2.1 Transaksi Kasir POS
1. Klik menu **Kasir POS** pada bilah navigasi kiri.
2. Di layar tengah, Anda akan melihat katalog produk:
   - **Cari Produk:** Gunakan kolom pencarian di bagian atas (bisa cari berdasarkan nama produk atau scan barcode/SKU).
   - **Filter Kategori:** Klik tab kategori (misal: Sembako, Minuman, Makanan Ringan) untuk menyaring produk.
3. **Memasukkan Produk ke Keranjang:**
   - Klik kartu produk atau tombol **+ Tambah**.
   - Di panel keranjang sebelah kanan, Anda dapat menekan tombol `+` atau `-` untuk mengubah kuantitas barang.
   - Tombol ikon tempat sampah dapat diklik untuk menghapus barang dari keranjang.

### 2.2 Pencarian & Pemilihan Pelanggan Member
1. Pada panel sebelah kanan (di atas daftar keranjang), temukan bagian **Loyalty Member**.
2. Ketik nama member atau nomor telepon pelanggan pada kolom pencarian cepat (*Quick Search*).
3. Klik nama member yang sesuai dari daftar hasil pencarian.
4. Informasi member (Nama, Nomor Telepon, Tier: Bronze/Silver/Gold/Platinum, dan Saldo Poin saat ini) akan langsung terpasang pada transaksi.

### 2.3 Pendaftaran Member Baru di Meja Kasir
Jika pelanggan yang datang belum terdaftar sebagai member:
1. Klik tombol **+ Daftar Member Baru** pada bagian Loyalty Member di halaman Kasir.
2. Modal popup pendaftaran akan muncul. Isi data:
   - **Nama Lengkap Pelanggan** (Wajib).
   - **Nomor Telepon / WhatsApp** (Wajib, format: 08xxxxxxxx).
   - **Email** (Opsional).
   - **Poin Awal Selamat Datang** (Bisa diberikan bonus poin awal, misal: 25 poin).
3. Klik tombol **Simpan & Pilih Member**.
4. Pelanggan baru otomatis terdaftar di database dan langsung terpilih untuk transaksi saat ini.

### 2.4 Penukaran Poin Diskon (Redeem Points)
1. Setelah member terpilih, jika member memiliki saldo poin:
2. Pada panel keranjang akan muncul opsi **Tukar Poin Diskon**.
3. Masukkan jumlah poin yang ingin ditukarkan (Contoh: `20` Poin = Potongan harga `Rp2.000`).
4. Sistem akan otomatis menghitung potongan harga dan mengurangi nilai **TOTAL BERSIH** yang harus dibayar.

### 2.5 Pembayaran, Kembalian, & Cetak Nota Thermal
1. Di bagian bawah panel keranjang, periksa **Total Pembayaran**.
2. Masukkan nominal uang yang diterima dari pelanggan pada kolom **Uang Tunai (Cash)**:
   - Bisa mengetik langsung (misal: `150000`).
   - Atau menggunakan tombol nominal cepat (Uang Pas, 50.000, 100.000, dsb.).
3. Nilai **Kembalian** akan dihitung secara instan otomatis oleh sistem.
4. Klik tombol hijau **Proses Bayar & Cetak Nota**.
5. Modal popup **Struk Transaksi** akan tampil di layar menampilkan rincian nota belanja, informasi poin baru yang didapat pelanggan, dan sisa saldo poinnya.
6. Klik tombol **Cetak Nota**:
   - Dialog printer browser akan terbuka secara otomatis.
   - Tampilan cetak telah dioptimasi khusus untuk printer thermal POS ukuran **58mm** dan **80mm** (teks hitam tajam, border putus-putus rapi, dan bebas halaman kosong).
   - Klik **Print** untuk mencetak ke printer fisik.
7. Klik **Tutup** untuk kembali ke halaman kasir yang sudah siap untuk transaksi berikutnya.

### 2.6 Melihat Riwayat Transaksi Hari Ini
1. Klik menu **Riwayat Hari Ini** pada navigasi kiri.
2. Kasir dapat melihat daftar seluruh transaksi yang berhasil diproses pada hari berjalan.
3. Kasir dapat mengklik tombol **Cetak Nota** di setiap baris transaksi untuk mencetak ulang nota jika pelanggan memintanya.

---

## 3. Panduan Operasional Pemilik Toko (Owner)

### 3.1 Monitoring Dashboard Bisnis
Halaman utama bagi Pemilik Toko untuk memantau performa toko secara *real-time*:
- **Total Omset Penjualan:** Nilai kotor pendapatan toko.
- **Estimasi Laba Kotor (*Gross Profit*):** Selisih antara harga jual dan harga modal (*HPP/Cost Price*).
- **Jumlah Transaksi & Produk Terjual:** Volume penjualan harian/bulanan.
- **Peringatan Stok Menipis (*Low Stock Alert*):** Daftar produk yang kuantitas stoknya sudah mendekati atau di bawah batas minimum.
- **Grafik Tren Penjualan:** Grafik visual performa penjualan 7 hari terakhir.
- **Produk Terlaris (*Top Selling Products*):** Daftar barang yang paling banyak dibeli pelanggan.

### 3.2 Manajemen Master Produk
1. Buka menu **Master Produk** (`/products`).
2. **Menambah Produk Baru:**
   - Klik tombol **+ Tambah Produk**.
   - Isi form: Nama Produk, SKU / Kode Barcode, Kategori, Harga Modal (Beli), Harga Jual, Stok Awal, dan Stok Minimum.
   - Klik **Simpan Produk**.
3. **Mengubah / Menghapus Produk:**
   - Gunakan tombol **Edit** (ikon pensil) untuk mengubah harga atau data produk.
   - Gunakan tombol **Hapus** (ikon sampah) jika produk sudah tidak dijual lagi.

### 3.3 Pencatatan Stok Masuk (Restock Barang)
Digunakan saat pasokan barang tiba dari pemasok/supplier untuk menambah jumlah stok barang secara resmi:
1. Buka menu **Stok Masuk** (`/stock-in`).
2. Klik tombol **+ Catat Stok Masuk**.
3. Pilih produk yang dipasok, masukkan jumlah kuantitas masuk, nama supplier, dan catatan (misal: Nomor Faktur Supplier).
4. Klik **Simpan**.
5. Stok produk di gudang dan kasir akan **otomatis bertambah** sesuai kuantitas yang diinput, dan riwayat mutasi stok tercatat permanen untuk keperluan audit.

### 3.4 Manajemen Loyalty Member & Audit Poin
1. Buka menu **Loyalty Member** (`/members`).
2. **Statistik Program Loyalitas:**
   - Melihat total member terdaftar, total poin yang beredar, member aktif, dan distribusi tier (Bronze, Silver, Gold, Platinum).
3. **Melihat Riwayat Mutasi Poin Lengkap (*Point Audit Trail*):**
   - Klik nama member untuk melihat riwayat mutasi poin (perolehan dari belanja, penukaran diskon, atau bonus penyesuaian).
4. **Penyesuaian Poin Manual Resmi (*Adjust Points* - Khusus Owner):**
   - Owner dapat menambah atau mengurangi saldo poin member secara manual (misal: kompensasi pelayanan atau hadiah ulang tahun).
   - Klik tombol **Sesuaikan Poin**, masukkan nilai perubahan (misal `+50` atau `-10`), dan wajib mengisi **Alasan Penyesuaian**.

### 3.5 Riwayat Penjualan Lengkap & Cetak Ulang Nota
1. Buka menu **Riwayat Penjualan** (`/sales-history`).
2. **Filter Fleksibel:** Filter transaksi berdasarkan Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir, atau Rentang Tanggal Khusus (*Custom Date*).
3. **Cetak Ulang Nota (*Reprint Receipt*):** Klik tombol **Cetak Nota** di transaksi mana pun untuk memunculkan struk transaksi asli dan mencetaknya ulang kapan saja.

### 3.6 Manajemen Pengguna (Kelola Akun Kasir)
1. Buka menu **Kelola Pengguna** (`/users`).
2. **Menambah Kasir Baru:**
   - Klik tombol **+ Tambah Pengguna**.
   - Masukkan Nama Lengkap, Username, Password, dan pilih Peran (`cashier`).
3. **Mengatur Status Akun:**
   - Owner dapat menonaktifkan akun kasir yang sudah tidak bekerja tanpa menghapus riwayat transaksi masa lalunya.

### 3.7 Pengaturan Profil Toko
1. Buka menu **Profil Toko** (`/store-profile`).
2. Perbarui informasi identitas usaha:
   - **Nama Toko / Perusahaan** (misal: *Toko Berkah Kelontong*).
   - **Alamat Toko** (tercantum di header web dan struk nota).
   - **Nomor Telepon / WhatsApp Toko**.
   - **Pesan Kaki Struk (*Receipt Footer*)**: Kalimat penutup di bagian bawah nota (misal: *Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan. Terima kasih!*).
3. Klik **Simpan Profil Toko**. Informasi ini akan langsung terbarui di seluruh sistem kasir dan cetak struk.

---

## 4. Fitur Mandiri: Ganti Kata Sandi

Setiap pengguna (baik Kasir maupun Owner) dapat mengganti password akun masing-masing demi keamanan:
1. Di bagian atas kanan layar (komputer) atau header atas (smartphone), klik **Ikon Avatar Profil**.
2. Pada menu dropdown yang muncul, klik **Ubah Password**.
3. Masukkan:
   - **Kata Sandi Lama**.
   - **Kata Sandi Baru** (Minimal 6 karakter, disarankan kombinasi huruf dan angka).
   - **Konfirmasi Kata Sandi Baru**.
4. Klik tombol **Simpan Kata Sandi**.
