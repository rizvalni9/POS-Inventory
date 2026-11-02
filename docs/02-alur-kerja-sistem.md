# ⚙️ Bagian 2: Alur Kerja Fitur & Sistem (System & Architecture Workflows)

Dokumen ini menjelaskan arsitektur perangkat lunak, aliran data antar-komponen, logika bisnis inti, serta skema basis data relasional yang menopang seluruh operasional **Proyek P01**.

---

## 📑 Daftar Isi
1. [Arsitektur Tingkat Tinggi (High-Level Architecture)](#1-arsitektur-tingkat-tinggi-high-level-architecture)
2. [Alur Autentikasi JWT & Role-Based Access Control (RBAC)](#2-alur-autentikasi-jwt--role-based-access-control-rbac)
3. [Alur Transaksi Kasir POS (Transaksi Atomik & Kunci Baris)](#3-alur-transaksi-kasir-pos-transaksi-atomik--kunci-baris)
4. [Alur Program Loyalty Member & Mutasi Poin](#4-alur-program-loyalty-member--mutasi-poin)
5. [Alur Pengelolaan Inventori & Stok Masuk](#5-alur-pengelolaan-inventori--stok-masuk)
6. [Skema & Relasi Database (Entity Relationship)](#6-skema--relasi-database-entity-relationship)

---

## 1. Arsitektur Tingkat Tinggi (High-Level Architecture)

Aplikasi dibangun menggunakan pola arsitektur **Client-Server Terpisah (Decoupled Single Page Application & RESTful API)**:

```mermaid
graph LR
    subgraph Frontend [Frontend SPA - React & Vite]
        A[UI Pages & Components] --> B[AuthContext & State]
        B --> C[Axios API Client Interceptor]
    end

    subgraph Backend [Backend API - Express.js]
        C -- HTTP / JSON Requests --> D[Express Router]
        D --> E[Security & Auth Middleware]
        E --> F[Business Controllers]
        F --> G[Sequelize ORM]
    end

    subgraph Database [Relational Database]
        G -- SQL Queries & Transactions --> H[(MySQL Database)]
    end
```

### Prinsip Aliran Data:
1. **Frontend (Port 5173):** Komponen React menangkap interaksi pengguna $\rightarrow$ memicu fungsi pengiriman data melalui `apiClient` (Axios).
2. **Network Transport:** Request dikirim melalui HTTP dengan header `Authorization: Bearer <token_jwt>`.
3. **Middleware Backend (Port 5000):** Memeriksa keamanan (Helmet, Rate Limiting, CORS) dan memvalidasi keabsahan token JWT serta level hak akses peran (*Role*).
4. **Controller:** Menjalankan logika bisnis (validasi kuantitas stok, transaksi atomik, kalkulasi poin).
5. **Sequelize ORM:** Mengonversi perintah JavaScript menjadi kueri SQL relasional yang aman dari celah *SQL Injection*.
6. **Database MySQL:** Menyimpan data secara persisten dan konsisten.

---

## 2. Alur Autentikasi JWT & Role-Based Access Control (RBAC)

Sistem membedakan dua tingkatan peran dengan hak akses tegas:
- **`owner` (Pemilik Toko):** Memiliki akses ke seluruh endpoint dan antarmuka.
- **`cashier` (Kasir):** Hanya memiliki akses ke endpoint kasir, pencarian member, dan riwayat hari ini.

### Diagram Alir Autentikasi & Otorisasi:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Kasir/Owner)
    participant FE as Frontend React
    participant API as Express Router
    participant MW as Middleware (verifyToken & requireRole)
    participant DB as Database MySQL

    User->>FE: Input Username & Password
    FE->>API: POST /api/auth/login
    API->>DB: SELECT * FROM users WHERE username = ?
    DB-->>API: Kembalikan data user + password hash
    API->>API: Verifikasi bcrypt.compare(password, hash)
    alt Password Benar
        API->>API: Generate Access Token (JWT 15m) & Refresh Token (7d)
        API-->>FE: Return JSON { token, user: { id, role, ... } }
        FE->>FE: Simpan token & user di localStorage
        FE->>User: Redirect ke Halaman Sesuai Role
    else Password Salah
        API-->>FE: Return 401 Unauthorized
        FE->>User: Tampilkan Pesan Error
    end

    opt Mengakses Halaman Terproteksi Owner
        FE->>API: GET /api/users (dengan Bearer Token)
        API->>MW: verifyToken(req)
        alt Token Valid
            MW->>MW: requireRole(['owner'])
            alt Role == 'owner'
                MW->>API: Lanjut ke controller users
                API->>DB: Ambil data pengguna
                DB-->>FE: Return 200 OK + Data
            else Role == 'cashier'
                MW-->>FE: Return 403 Forbidden (Akses Ditolak)
            end
        else Token Invalid / Expired
            MW-->>FE: Return 401 Unauthorized (Auto Redirect ke Login)
        end
    end
```

---

## 3. Alur Transaksi Kasir POS (Transaksi Atomik & Kunci Baris)

Proses kasir adalah operasi kritis karena melibatkan perputaran uang dan pemotongan stok barang. Sistem menerapkan **Sequelize Managed Transaction (`t`)** dengan prinsip **ACID (Atomicity, Consistency, Isolation, Durability)**.

### Langkah demi Langkah Eksekusi Atomik di Backend (`checkout`):

```mermaid
flowchart TD
    Start([Kasir Klik Proses Bayar]) --> Step1[Mulai Transaksi Database: const t = await sequelize.transaction]
    Step1 --> Step2[Lock Baris Produk: SELECT ... FOR UPDATE]
    Step2 --> CheckStock{Apakah Stok Mencukupi?}
    
    CheckStock -- Tidak Cukup --> Rollback1[Rollback Transaksi]
    Rollback1 --> ErrorStock[Return 400: Stok Barang Tidak Cukup]
    
    CheckStock -- Cukup --> Step3[Potong Stok Produk: product.stock -= qty]
    Step3 --> CheckMember{Ada Member Terpilih?}
    
    CheckMember -- Ya --> CheckRedeem{Tukar Poin Diskon?}
    CheckRedeem -- Ya --> DeductPoints[Validasi & Kurangi Saldo Poin Member]
    DeductPoints --> LogPointRedeem[Catat ke point_histories: Type REDEEM]
    CheckRedeem -- Tidak --> CalcEarn[Hitung Poin Baru yang Didapat]
    LogPointRedeem --> CalcEarn
    
    CalcEarn --> AddPoints[Tambah Saldo Poin Member: member.points += earned]
    AddPoints --> LogPointEarn[Catat ke point_histories: Type EARNED]
    CheckMember -- Tidak --> CreateInvoice[Buat Header Faktur: sales]
    LogPointEarn --> CreateInvoice
    
    CreateInvoice --> CreateItems[Simpan Detail Item Penjualan: sale_items]
    CreateItems --> Commit[Commit Transaksi Database]
    Commit --> SuccessReceipt[Return 201: Sukses & Tampilkan Struk Cetak]
```

### Mengapa Perlu Snapshot Harga Historis (`price_at_sale`)?
Jika suatu produk di kemudian hari dinaikkan harganya oleh pemilik toko (misal: Beras naik dari Rp68.000 menjadi Rp75.000), maka struk dan laporan keuangan transaksi bulan lalu **TIDAK BOLEH BERUBAH**. Karena itu, harga satuan saat transaksi disimpan permanen di kolom `sale_items.price_at_sale`.

---

## 4. Alur Program Loyalty Member & Mutasi Poin

Modul loyalitas member dirancang untuk meningkatkan retensi belanja pelanggan dengan mekanisme poin transparan dan terlacak (*Audit Trail*).

### Rumus & Aturan Bisnis Loyalitas:
1. **Perolehan Poin (*Earn Points*):**
   - Setiap pembelanjaan kelipatan **Rp10.000**, pelanggan memperoleh **1 Poin**.
   - Contoh: Belanja Rp134.000 $\rightarrow$ `Math.floor(134000 / 10000) = 13 Poin`.
2. **Penukaran Poin Diskon (*Redeem Points*):**
   - **1 Poin bernilai potongan Rp100**.
   - Contoh: Menukar 20 Poin $\rightarrow$ Potongan harga langsung **Rp2.000**.
3. **Kenaikan Tingkatan Member (*Tier System*):**
   - **Bronze:** 0 - 99 Poin.
   - **Silver:** 100 - 299 Poin.
   - **Gold:** 300 - 999 Poin.
   - **Platinum:** 1000+ Poin.
4. **Audit Trail Mutasi Poin:**
   Setiap perubahan saldo poin member (baik bertambah karena belanja, berkurang karena ditukar diskon, atau disesuaikan manual oleh owner) **WAJIB** mencatat baris baru di tabel `point_histories` lengkap dengan `balance_before`, `balance_after`, dan `description`.

---

## 5. Alur Pengelolaan Inventori & Stok Masuk

Inventori barang diatur dalam dua arah pergerakan stok:

```
[Supplier] 
     │
     ▼ (Stok Masuk / stock_ins)
[Gudang / Master Produk] ─── (Stok Berkurang / sales) ───► [Pelanggan]
     │
     ▼ (Jika stok <= minimum_stock)
[Peringatan Stok Menipis di Dashboard Owner]
```

1. **Penambahan Stok:**
   - Dibuat melalui menu **Stok Masuk**.
   - Menyimpan data kuantitas, tanggal, nama pemasok (*supplier*), dan catatan.
   - Secara otomatis memperbarui kolom `products.stock` (`stock = stock + qty_masuk`).
2. **Pengurangan Stok:**
   - Terjadi secara otomatis dan real-time saat transaksi kasir di-checkout.
3. **Pendeteksian Stok Kritis:**
   - Kueri Dashboard: `SELECT * FROM products WHERE stock <= minimum_stock`.

---

## 6. Skema & Relasi Database (Entity Relationship)

Database menggunakan 8 tabel utama yang saling terhubung:

```mermaid
erDiagram
    users ||--o{ sales : "memproses transaksi (cashier)"
    users ||--o{ stock_ins : "mencatat stok masuk (creator)"
    users ||--o{ point_histories : "otorisasi penyesuaian (owner)"
    
    members ||--o{ sales : "melakukan pembelian"
    members ||--o{ point_histories : "memiliki riwayat mutasi poin"
    
    products ||--o{ sale_items : "dibeli dalam item transaksi"
    products ||--o{ stock_ins : "menerima pasokan stok"
    
    sales ||--|{ sale_items : "memiliki rincian item barang"
    sales ||--o{ point_histories : "menghasilkan referensi mutasi poin"

    store_profiles {
        int id PK
        string store_name
        string address
        string phone
        string receipt_footer
    }

    users {
        int id PK
        string full_name
        string username
        string password
        string role "owner / cashier"
        boolean is_active
    }

    products {
        int id PK
        string sku
        string name
        string category
        decimal cost_price
        decimal price
        int stock
        int minimum_stock
    }

    members {
        int id PK
        string member_code
        string name
        string phone
        string email
        string tier "Bronze/Silver/Gold/Platinum"
        int points
    }

    sales {
        int id PK
        string invoice_number
        int user_id FK
        int member_id FK
        decimal subtotal_amount
        decimal discount_amount
        int points_redeemed
        int points_earned
        decimal total_amount
        decimal cash_paid
        decimal change_returned
        datetime transaction_date
    }

    sale_items {
        int id PK
        int sale_id FK
        int product_id FK
        string product_name_at_sale
        int quantity
        decimal cost_price_at_sale
        decimal price_at_sale
        decimal subtotal
    }

    stock_ins {
        int id PK
        int product_id FK
        int quantity
        string supplier_name
        string notes
        int user_id FK
    }

    point_histories {
        int id PK
        int member_id FK
        string type "EARNED / REDEEMED / ADJUSTMENT / WELCOME_BONUS"
        int points
        int balance_before
        int balance_after
        string description
        int created_by FK
        int sale_id FK
    }
```
