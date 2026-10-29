// ==============================================================================
// SCRIPT: generate_docs.js
// DESKRIPSI: Skrip pembuatan dokumen Word (.docx) resmi, rapi, dan komprehensif
// untuk Panduan Belajar & Kode Lengkap Proyek P01 (POS, Stok, & Loyalty Member).
// Disusun dengan gaya bahasa ramah, mendidik, dan terstruktur khusus untuk
// level Junior Programmer & Peserta Magang OJT Fullstack Web Developer.
// ==============================================================================

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = require('docx');

async function createDocx() {
  console.log('Memulai penyusunan dokumen Word (.docx) berstandar profesional...');

  // Border standar tabel
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
  };

  // Helper Heading 1 (Bab Utama)
  const h1 = (title) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 160 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28, // 14pt
          color: '1E3A8A'
        })
      ]
    });

  // Helper Heading 2 (Sub-Bab)
  const h2 = (title) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 24, // 12pt
          color: '2563EB'
        })
      ]
    });

  // Helper Heading 3
  const h3 = (title) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 22, // 11pt
          color: '334155'
        })
      ]
    });

  // Helper Paragraf Biasa
  const p = (text, options = {}) =>
    new Paragraph({
      spacing: { before: 80, after: 80, line: 276 },
      ...options,
      children: typeof text === 'string' ? [new TextRun(text)] : text
    });

  // Helper Bullet Point
  const bullet = (boldPrefix, text) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 60, after: 60, line: 260 },
      children: [
        new TextRun({ text: boldPrefix + ' ', bold: true, color: '1E293B' }),
        new TextRun(text)
      ]
    });

  // Helper Kotak Penjelasan / Analogi / Tips Khusus Junior
  const createCallout = (badge, title, text, type = 'info') => {
    let accentColor = '2563EB'; // Blue
    let bgColor = 'EFF6FF';
    let titleColor = '1E40AF';

    if (type === 'analogy') {
      accentColor = '8B5CF6'; // Purple
      bgColor = 'F5F3FF';
      titleColor = '6D28D9';
    } else if (type === 'tip') {
      accentColor = '10B981'; // Green
      bgColor = 'ECFDF5';
      titleColor = '047857';
    } else if (type === 'warning') {
      accentColor = 'EF4444'; // Red
      bgColor = 'FEF2F2';
      titleColor = 'B91C1C';
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        left: { style: BorderStyle.SINGLE, size: 24, color: accentColor }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: bgColor },
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 60 },
                  children: [
                    new TextRun({
                      text: `[${badge}] ${title}\n`,
                      bold: true,
                      size: 22,
                      color: titleColor
                    }),
                    new TextRun({
                      text: text,
                      size: 21,
                      color: '1E293B'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  };

  // Helper Kotak Cuplikan Kode (Code Block)
  const createCodeSnippet = (codeString, description = '') => {
    const rows = [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: '0F172A' }, // Dark Slate background
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: codeString,
                    font: 'Consolas',
                    size: 18, // 9pt
                    color: '38BDF8' // Light blue / cyan syntax
                  })
                ]
              })
            ]
          })
        ]
      })
    ];

    if (description) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
              margins: { top: 60, bottom: 60, left: 140, right: 140 },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: 'Penjelasan Kode: ', bold: true, size: 19, color: '475569' }),
                    new TextRun({ text: description, italics: true, size: 19, color: '64748B' })
                  ]
                })
              ]
            })
          ]
        })
      );
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: thinBorder,
      rows: rows
    });
  };

  // Helper Tabel Data Rapi
  const createStyledTable = (headers, rowsData, colPercentages) => {
    const tableRows = [];

    // Header Row
    tableRows.push(
      new TableRow({
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: colPercentages[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: '1E3A8A' }, // Navy blue header
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF' })]
              })
            ]
          })
        )
      })
    );

    // Data Rows
    rowsData.forEach((row, rIdx) => {
      tableRows.push(
        new TableRow({
          children: row.map((cellText, cIdx) =>
            new TableCell({
              width: { size: colPercentages[cIdx], type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [new TextRun({ text: String(cellText), size: 20, color: '334155' })]
                })
              ]
            })
          )
        })
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: thinBorder,
      rows: tableRows
    });
  };

  // ============================================================================
  // MEMBANGUN KONTEN DOKUMEN LENGKAP
  // ============================================================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '1E293B'
          },
          paragraph: {
            spacing: { line: 276, before: 100, after: 100 }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // ------------------------------------------------------------------
          // COVER & JUDUL DOKUMEN
          // ------------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'PANDUAN BELAJAR KODE LENGKAP & ARSITEKTUR SISTEM',
                bold: true,
                size: 34,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'Proyek P01 • Sistem Kasir (POS), Manajemen Stok Toko & Modul Loyalty Member\n',
                bold: true,
                size: 24,
                color: '2563EB'
              }),
              new TextRun({
                text: 'Modul Pelatihan Khusus Junior Programmer & Peserta Magang Fullstack Web Developer',
                italics: true,
                size: 20,
                color: '64748B'
              })
            ]
          }),

          // KOTAK INFORMASI PROJEK & PIC
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: thinBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
                    margins: { top: 140, bottom: 140, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: 'Informasi Resmi Pelatihan:\n', bold: true, size: 21, color: '1E3A8A' }),
                          new TextRun({ text: '• Program: ', bold: true }),
                          new TextRun('On-the-Job Training (OJT) Fullstack Web Developer 2026\n'),
                          new TextRun({ text: '• Penyelenggara: ', bold: true }),
                          new TextRun('PT Flash Tech Indonesia bekerja sama dengan BPVP Padang\n'),
                          new TextRun({ text: '• Penanggung Jawab Teknis (PIC): ', bold: true }),
                          new TextRun('Rizqon Nauval Zaloni\n'),
                          new TextRun({ text: '• Level Materi: ', bold: true }),
                          new TextRun('Junior Programmer (Ramah Pemula, Disertai Analogi & Langkah Praktik)\n'),
                          new TextRun({ text: '• Bahasa Pengantar: ', bold: true }),
                          new TextRun('Bahasa Indonesia Jelas, Santai, Mudah Dipahami, dan Aplikatif')
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),

          // ------------------------------------------------------------------
          // BAB 1: TENTANG PROJEK INI
          // ------------------------------------------------------------------
          h1('BAB 1. TENTANG PROJEK INI (LATAR BELAKANG & SASARAN BELAJAR)'),
          p(
            'Halo rekan programmer junior! Selamat datang di proyek P01 Kasir, Stok Toko, dan Loyalty Member. Jika kamu baru pertama kali melihat sebuah proyek fullstack web lengkap seperti ini, jangan merasa takut atau minder ya! Dokumen ini disusun oleh mentor untuk membimbingmu langkah demi langkah memahami bagaimana aplikasi web profesional bekerja di dunia industri nyata.'
          ),
          h2('1.1 Masalah Nyata di Toko Ritel yang Kita Selesaikan'),
          p(
            'Sebelum menulis satu baris kode pun, seorang programmer profesional selalu bertanya: "Aplikasi ini dibuat untuk menyelesaikan masalah apa?". Nah, di toko kelontong atau minimarket konvensional, ada 5 masalah besar yang sering terjadi:'
          ),
          bullet('1. Kasir Pakai Kalkulator Manual:', 'Sering terjadi salah pencet angka saat antrean pembeli sedang ramai. Akibatnya, uang kembalian salah dan toko bisa rugi atau pelanggan komplain.'),
          bullet('2. Catatan Stok Selisih & Misterius:', 'Di buku catatan tertulis stok minyak goreng masih 5 botol, tapi saat dicari di rak etalase ternyata sudah habis. Di aplikasi kita, stok hanya bisa bertambah lewat penerimaan barang resmi dan otomatis berkurang saat kasir menekan tombol Bayar.'),
          bullet('3. Nota Kertas Hilang atau Rusak:', 'Nota tulisan tangan sering hilang atau tintanya luntur. Aplikasi kita langsung mencetak struk thermal standar ritel (58mm/80mm) yang rapi, profesional, dan salinannya tersimpan abadi di database.'),
          bullet('4. Kasir Bisa Mengintip Rahasia Keuangan Toko:', 'Di sistem konvensional, kasir bisa melihat total omset bulanan toko. Di sistem kita, ada pembagian peran tegas (RBAC): Kasir hanya bisa melayani transaksi kasirnya sendiri, sedangkan laporan omset keuangan hanya bisa dibuka oleh Pemilik Toko (Owner).'),
          bullet('5. Pelanggan Tidak Loyal & Pindah ke Toko Lain:', 'Minimarket modern mempertahankan pelanggan dengan program Loyalty Member. Pelanggan memiliki kartu keanggotaan, mengumpulkan poin dari setiap belanjaan, naik level (Bronze -> Silver -> Gold -> Platinum), dan bisa menukarkan poinnya menjadi potongan harga (diskon) langsung di kasir!')
          ,
          h2('1.2 Sasaran Kompetensi Peserta Magang'),
          p(
            'Setelah mempelajari dan mempraktikkan proyek ini, kamu ditargetkan menguasai keahlian fullstack berikut:'
          ),
          bullet('Pemrograman Backend Handal:', 'Menguasai Node.js dan Express.js untuk membangun RESTful API yang aman, rapi, dan modular.'),
          bullet('Manajemen Basis Data Relasional:', 'Menguasai MySQL 8.0 dan Sequelize ORM, relasi antar tabel (One-to-Many, Many-to-Many), indexing, dan transaksi database.'),
          bullet('Keamanan Web Tingkat Industri:', 'Memahami pengamanan JWT Dual-Token (Access Token + Refresh Token HttpOnly), perlindungan serangan XSS, rate limiting, dan role authorization.'),
          bullet('Frontend Interaktif & Modern:', 'Membangun Single Page Application (SPA) responsif menggunakan React 18, Vite, Tailwind CSS, dan Context API.'),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 2: PETA BESAR SISTEM & ALIRAN DATA
          // ------------------------------------------------------------------
          h1('BAB 2. PETA BESAR SISTEM & BAGAIMANA APLIKASI BEKERJA'),
          p(
            'Sebagai programmer, kamu harus memiliki "helikopter view" atau peta besar bagaimana data mengalir antara browser kasir, server backend, dan database gudang penyimpanan:'
          ),
          createCallout(
            'PETA ARSITEKTUR',
            'Alur 3 Lapisan (Three-Tier Architecture)',
            '1. FRONTEND (React 18 + Vite + Tailwind CSS):\n' +
            '   Berjalan di browser laptop/tablet kasir. Bertugas menampilkan etalase produk, merespons klik kasir, mencari member pelanggan via autocomplete, menghitung kembalian uang, dan memunculkan struk siap cetak.\n\n' +
            '2. BACKEND API (Node.js + Express.js + Sequelize ORM):\n' +
            '   Berjalan di server lokal/cloud (Port 5000). Bertindak sebagai otak dan satpam keamanan. Backend memeriksa keaslian token kasir, mengunci baris produk di MySQL agar stok tidak minus, menghitung diskon poin member, dan mencatat transaksi secara atomik.\n\n' +
            '3. DATABASE (MySQL 8.0 InnoDB):\n' +
            '   Menyimpan 9 tabel terstruktur secara permanen. Menjamin integritas data menggunakan foreign key dan indeks pencarian cepat.',
            'info'
          ),
          p(
            'Contoh Nyata Aliran Data Saat Kasir Menekan Tombol "Bayar":\n' +
            '1. Kasir memilih 2 Beras Ramos di layar React dan memilih Member Ibu Siti.\n' +
            '2. Kasir mencentang opsi "Tukarkan 20 Poin" (Diskon Rp2.000).\n' +
            '3. React mengirim data JSON ke backend lewat Axios: { items: [...], member_id: 4, redeem_points: 20, cash_paid: 150000 }.\n' +
            '4. Backend menerima request, satpam auth.js memastikan kasir sudah login.\n' +
            '5. Controller salesController.js membuka Database Transaction dan mengunci stok Beras dan saldo poin Ibu Siti (Row Locking).\n' +
            '6. Server memverifikasi harga resmi, memotong stok, memotong 20 poin diskon, menambah poin baru belanjaan, dan membuat nota faktur resmi.\n' +
            '7. Database di-commit permanen, lalu server mengembalikan data struk lengkap ke browser untuk langsung dicetak ke printer kasir thermal.'
          ),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 3: 5 KONSEP ENTERPRISE DENGAN ANALOGI SEHARI-HARI
          // ------------------------------------------------------------------
          h1('BAB 3. 5 KONSEP TEKNIKAL PENTING DENGAN ANALOGI SEHARI-HARI'),
          p(
            'Banyak programmer pemula merasa pusing saat mendengar istilah teknis seperti Concurrency, JWT, ACID, atau RBAC. Mari kita bedah kelimanya menggunakan analogi kehidupan nyata yang sangat mudah dipahami:'
          ),

          // 3.1
          h2('3.1 Analogi Gelang Konser Musik: Dual-Token JWT (Access & Refresh)'),
          createCallout(
            'ANALOGI NYATA',
            'Kenapa Token Tidak Boleh Disimpan di LocalStorage?',
            'Bayangkan kamu datang ke festival musik akbar:\n' +
            '• Saat pertama kali datang, kamu menunjukkan KTP dan bukti pembayaran (ini proses Login).\n' +
            '• Panitia memasangkan Gelang Kertas Akses di tanganmu (ini Access Token). Gelang ini memiliki masa berlaku pendek (15 menit) agar jika gelangmu jatuh atau dicuri orang lain, si pencuri tidak bisa memakainya lama-lama.\n' +
            '• Namun panitia juga menyelipkan Kupon Khusus Tersegel ke dalam kantong celanamu yang tidak bisa dilihat orang lain (ini Refresh Token yang disimpan di cookie HttpOnly).\n' +
            '• Saat gelang kertasmu rusak atau habis waktu, kamu tidak perlu mengantre beli tiket dari awal lagi! Kamu cukup menunjukkan kupon rahasia tersebut ke loket khusus untuk mendapatkan gelang baru secara otomatis (Silent Refresh).\n\n' +
            'Di Kode Kita:\n' +
            '- Access Token disimpan HANYA di memori variabel JavaScript (frontend/src/api/axios.js). Tidak disimpan di localStorage agar kebal dari pencurian script jahat (XSS).\n' +
            '- Refresh Token disimpan di cookie browser bertanda HttpOnly. JavaScript di browser tidak bisa membaca cookie ini, sehingga aman 100%.',
            'analogy'
          ),

          // 3.2
          h2('3.2 Analogi Kamar Pas Pakaian: Kenapa Database Harus Dikunci (Row Locking)'),
          createCallout(
            'ANALOGI NYATA',
            'Mencegah Balapan Data (Race Condition & Concurrency)',
            'Bayangkan sisa stok Minyak Goreng di toko tinggal 1 botol terakhir:\n' +
            '• Kasir A di lantai 1 dan Kasir B di lantai 2 sama-sama melayani pembeli pada detik yang sama persis.\n' +
            '• Jika database tidak dikunci, kedua komputer kasir sama-sama membaca sisa stok = 1.\n' +
            '• Kedua kasir sama-sama menekan tombol bayar! Hasilnya: stok di database menjadi -1 (minus), padahal botol aslinya cuma ada 1! Toko bisa nombok dan rugi.\n\n' +
            'Solusi Kita (SELECT ... FOR UPDATE):\n' +
            'Analogi seperti kamar pas pakaian di toko baju. Begitu Kasir A masuk ke kamar pas untuk memeriksa Minyak Goreng, pintu kamar pas DIKUNCI DARI DALAM.\n' +
            'Kasir B yang mau masuk harus MENUNGGU DI LUAR sampai Kasir A selesai membayar dan keluar kamar pas.\n' +
            'Saat Kasir A selesai, stok Minyak Goreng sudah menjadi 0.\n' +
            'Giliran Kasir B masuk kamar pas, Kasir B melihat stok sudah 0, sehingga sistem menolak dengan aman: "Maaf stok barang tidak mencukupi". Stok fisik toko tetap 0 dan tidak pernah minus!',
            'analogy'
          ),

          // 3.3
          h2('3.3 Analogi Kertas Struk di Dompet: Snapshot Immutability Riwayat Finansial'),
          createCallout(
            'ANALOGI NYATA',
            'Kenapa Harga Barang Dicatat Ulang di Tabel sale_items?',
            'Pertanyaan Junior: "Kak, kenapa di tabel sale_items kita harus mencatat nama dan harga barang lagi? Kenapa nggak panggil product_id-nya saja?"\n\n' +
            'Jawaban Analogi:\n' +
            '• Bayangkan hari ini kamu beli Beras seharga Rp68.000, lalu kamu simpan struk kertasnya di dalam dompetmu.\n' +
            '• Minggu depan, pemilik toko menaikkan harga Beras di etalase menjadi Rp75.000.\n' +
            '• Apakah angka di struk kertas yang ada di dalam dompetmu tiba-tiba berubah sendiri jadi Rp75.000? Tentu tidak boleh!\n\n' +
            'Di Kode Kita:\n' +
            'Tabel sale_items memiliki kolom price_at_sale dan product_name_at_sale. Berapa kali pun harga di tabel master produk diubah di masa depan, nota transaksi lama yang sudah terbit akan tetap abadi dan sah secara akuntansi.',
            'analogy'
          ),

          // 3.4
          h2('3.4 Analogi Kartu Karyawan & Master Key Gedung: Role-Based Access Control (RBAC)'),
          createCallout(
            'ANALOGI NYATA',
            'Menyembunyikan Tombol di Layar Bukanlah Keamanan!',
            'Di gedung perkantoran besar, tidak semua orang boleh masuk ke ruang brankas uang:\n' +
            '• Kasir hanya diberi Kartu Akses ke meja kasir (melayani pembeli, cek barang, lihat transaksi hari ini).\n' +
            '• Pemilik Toko (Owner) memegang Master Key (bisa masuk ke ruang brankas laporan omset, ruang gudang stok masuk, kelola akun kasir, dan penyesuaian poin manual member).\n\n' +
            'Prinsip Keamanan Web:\n' +
            'Jika kamu hanya menyembunyikan tombol "Laporan Omset" di tampilan React, itu belum aman! Siapa saja bisa menembak URL http://localhost:5000/api/reports langsung lewat Postman.\n' +
            'Oleh karena itu, satpam di backend (middlewares/auth.js) selalu memeriksa: authorizeRoles("owner"). Jika akun kasir mencoba mengakses, server langsung menolak dengan kode HTTP 403 Forbidden!',
            'warning'
          ),

          // 3.5
          h2('3.5 Analogi Kartu Stempel Kedai Kopi: Arsitektur Modul Loyalty & Jejak Audit Mutasi Poin'),
          createCallout(
            'ANALOGI NYATA',
            'Bagaimana Sistem Poin & Tier Keanggotaan Bekerja?',
            'Pernahkah kamu jajan kopi di cafe dan diberi kartu stempel?\n' +
            '• Setiap kali kamu beli 1 cup kopi, kasir memberi 1 stempel.\n' +
            '• Setelah terkumpul 10 stempel, kamu bisa menukarkannya dengan kopi gratis atau diskon belanja.\n\n' +
            'Di Sistem Loyalty Member Toko Kita:\n' +
            '1. Tingkatan Keanggotaan (Tier Progression):\n' +
            '   - Pelanggan baru mendaftar di Tier Bronze (Pengali 1.0x poin).\n' +
            '   - Total belanja tembus Rp1.000.000 -> Otomatis naik ke Tier Silver (Pengali 1.2x poin).\n' +
            '   - Total belanja tembus Rp5.000.000 -> Otomatis naik ke Tier Gold (Pengali 1.5x poin).\n' +
            '   - Total belanja tembus Rp15.000.000 -> Otomatis menjadi VIP Platinum (Pengali 2.0x poin)!\n' +
            '2. Nilai Tukar Poin Menjadi Diskon:\n' +
            '   - 1 Poin = Potongan harga Rp100 langsung di meja kasir (Misal 50 Poin = Diskon Rp5.000).\n' +
            '3. Buku Catatan Mutasi Poin (member_point_histories):\n' +
            '   - Poin tidak boleh bertambah atau berkurang tanpa alasan jelas! Setiap mutasi wajib tercatat tipenya: BONUS (hadiah selamat datang), EARN (didapat dari belanja), REDEEM (dipotong untuk diskon), atau ADJUSTMENT (penyesuaian manual pemilik toko dengan catatan audit wajib).',
            'analogy'
          ),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 4: STRUKTUR DATABASE LENGKAP (9 TABEL)
          // ------------------------------------------------------------------
          h1('BAB 4. STRUKTUR DATABASE LENGKAP (9 TABEL MYSQL & RELASINYA)'),
          p(
            'Database kita bernama pos_kasir_stok menggunakan MySQL 8.0 dengan storage engine InnoDB. Berikut adalah tabel ringkasan 9 entitas database dan fungsinya:'
          ),
          createStyledTable(
            ['No', 'Nama Tabel', 'Fungsi Utama', 'Relasi / Foreign Key'],
            [
              ['1', 'users', 'Menyimpan akun login kasir & owner dengan password Bcrypt', 'One-to-Many ke user_sessions, sales, stock_movements'],
              ['2', 'user_sessions', 'Mencatat sesi refresh token aktif untuk fitur cabut hak akses instan', 'BelongsTo ke users (CASCADE delete)'],
              ['3', 'products', 'Master data barang toko (sku barcode unik, nama, harga jual, stok fisik)', 'One-to-Many ke stock_movements dan sale_items'],
              ['4', 'stock_movements', 'Buku jurnal mutasi barang masuk resmi ke gudang', 'BelongsTo ke products dan users (pencatat)'],
              ['5', 'members', 'Master data pelanggan setia (kode member MBR-..., HP unik, tier, saldo poin)', 'One-to-Many ke sales dan member_point_histories'],
              ['6', 'member_point_histories', 'Buku jejak audit setiap perolehan dan penukaran poin member', 'BelongsTo ke members, sales, dan users (pembuat)'],
              ['7', 'sales', 'Kepala nota faktur transaksi penjualan kasir (nomor TRX-..., total, bayar)', 'BelongsTo ke users (kasir) dan members (pelanggan)'],
              ['8', 'sale_items', 'Rincian snapshot barang belanjaan per nota (nama, harga saat itu, kuantitas)', 'BelongsTo ke sales (CASCADE delete) dan products'],
              ['9', 'business_profiles', 'Data identitas fisik toko (nama toko, alamat, telepon, teks penutup struk)', 'Tabel konfigurasi tunggal (Single Record)']
            ],
            [6, 22, 42, 30]
          ),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 5: BEDAH KODE BACKEND
          // ------------------------------------------------------------------
          h1('BAB 5. BEDAH KODE BACKEND (LANGKAH DEMI LANGKAH UNTUK JUNIOR)'),
          p(
            'Sekarang mari kita bedah file-file inti backend di folder backend/ agar kamu tahu persis apa fungsi setiap baris kodenya:'
          ),

          h2('5.1 server.js - Pintu Masuk Server Express'),
          p(
            'File ini adalah entry point utama. Saat kamu mengetik npm run dev di terminal backend, Node.js pertama kali menjalankan file ini:'
          ),
          bullet('Helmet Security:', 'Memasang header HTTP standar industri agar server aman dari serangan clickjacking dan MIME-sniffing.'),
          bullet('CORS ber-Kredensial:', 'Mengunci agar hanya alamat frontend resmi kita (http://localhost:5173) yang boleh mengakses backend. credentials: true wajib aktif agar cookie HttpOnly bisa dikirim.'),
          bullet('Express Body Parser & Cookie Parser:', 'Membaca data kiriman JSON di req.body dan membaca cookie refresh_token di req.cookies.'),
          bullet('Mendaftarkan 7 Rute Modular:', 'Setiap fitur dipisah ke filenya masing-masing: /api/auth, /api/users, /api/products, /api/stock-movements, /api/sales, /api/members, dan /api/reports.'),

          h2('5.2 middlewares/auth.js - Satpam Pemeriksa Token & Role (RBAC)'),
          p(
            'Bayangkan file ini sebagai satpam yang berdiri di depan pintu masuk setiap rute API yang butuh login:'
          ),
          createCodeSnippet(
            `async function authenticateToken(req, res, next) {\n` +
            `  const authHeader = req.headers['authorization'];\n` +
            `  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;\n` +
            `  if (!token) return res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });\n` +
            `  const decoded = verifyAccessToken(token);\n` +
            `  const user = await User.findByPk(decoded.id);\n` +
            `  if (!user || !user.is_active) return res.status(403).json({ success: false, message: 'Akun dinonaktifkan.' });\n` +
            `  req.user = user; // Simpan data user ke request untuk dipakai controller\n` +
            `  next();\n` +
            `}`,
            'Fungsi ini mengekstrak token Bearer dari header HTTP, memvalidasi tanda tangan digital JWT, dan memastikan akun user masih aktif di database MySQL.'
          ),

          h2('5.3 controllers/salesController.js - Mesin Kasir & Checkout Atomik Terintegrasi Loyalty'),
          p(
            'Inilah fungsi paling penting di seluruh aplikasi! Perhatikan bagaimana konsep Transaksi ACID, Row Locking, dan Loyalty Member dipadukan secara harmonis:'
          ),
          createCodeSnippet(
            `const transaction = await sequelize.transaction(); // 1. Buka Transaksi Database ACID\n` +
            `try {\n` +
            `  // 2. Kunci baris produk dengan SELECT ... FOR UPDATE (Pessimistic Locking)\n` +
            `  const products = await Product.findAll({ where: { id: productIds }, lock: transaction.LOCK.UPDATE, transaction });\n` +
            `  // 3. Validasi status produk & kecukupan stok fisik agar tidak pernah minus\n` +
            `  // 4. Kunci baris Member & hitung diskon penukaran poin (1 Poin = Rp100)\n` +
            `  if (member && redeem_points > 0) {\n` +
            `    discountAmount = redeem_points * 100;\n` +
            `    finalTotal = Math.max(0, subtotal - discountAmount);\n` +
            `    member.points -= redeem_points;\n` +
            `  }\n` +
            `  // 5. Hitung perolehan poin transaksi baru berdasarkan Tier (Bronze 1x, Silver 1.2x, Gold 1.5x, Plat 2x)\n` +
            `  // 6. Simpan pengurangan stok, simpan Sale & SaleItem, simpan audit MemberPointHistory\n` +
            `  await transaction.commit(); // 7. Simpan permanen ke MySQL\n` +
            `} catch (err) {\n` +
            `  await transaction.rollback(); // Jika ada error apapun, batalkan seluruh perubahan!\n` +
            `}`,
            'Kombinasi transaction.LOCK.UPDATE menjamin tidak akan ada kasir yang menjual barang yang sama secara bersamaan, dan rollback menjamin data keuangan selalu konsisten.'
          ),

          h2('5.4 models/Member.js & MemberPointHistory.js - Model Loyalty Member'),
          p(
            'Dua model Sequelize yang dirancang dengan integritas data ketat, indeks pencarian cepat, dan catatan audit:'
          ),
          bullet('Model Member.js:', 'Menyimpan kode unik member (MBR-...), nama, nomor telepon unik, email, alamat, tier (Bronze, Silver, Gold, Platinum), saldo poin aktif (validator min: 0), total akumulasi belanja seumur hidup (total_spent), dan status keaktifan.'),
          bullet('Model MemberPointHistory.js:', 'Jurnal audit mutasi poin immutable (tanpa kolom updatedAt). Mencatat member_id, sale_id, tipe mutasi (EARN, REDEEM, ADJUSTMENT, BONUS), nilai delta poin (+/-), snapshot saldo setelah mutasi (balance_after), dan id kasir/owner yang mengeksekusi.'),

          h2('5.5 controllers/memberController.js - Pengendali Modul Loyalty Member'),
          p(
            'Mengatur seluruh logika bisnis pelanggan setia toko dan analitik poin:'
          ),
          createCodeSnippet(
            `// Penyesuaian Poin Manual dengan Pessimistic Locking (Owner Only)\n` +
            `const member = await Member.findByPk(id, { lock: transaction.LOCK.UPDATE, transaction });\n` +
            `const newBalance = member.points + delta;\n` +
            `if (newBalance < 0) throw new Error('Pengurangan melebihi saldo poin member!');\n` +
            `member.points = newBalance;\n` +
            `await member.save({ transaction });\n` +
            `await MemberPointHistory.create({ member_id: member.id, type: 'ADJUSTMENT', points: delta, balance_after: newBalance, description: reason }, { transaction });`,
            'Owner wajib menyertakan alasan audit resmi (minimal 4 karakter) yang akan tersimpan permanen di jejak audit trail.'
          ),
          bullet('searchMembersQuick:', 'Didesain berlatensi ultra-rendah untuk autocomplete di layar kasir (mencari via nama, no. HP, atau kode).'),
          bullet('Hapus Aman (Soft Archive):', 'Jika member sudah pernah berbelanja di kasir, sistem menolak delete fisik dan mengarsipkan status menjadi Non-Aktif agar nota keuangan masa lalu tetap sah.'),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 6: BEDAH KODE FRONTEND
          // ------------------------------------------------------------------
          h1('BAB 6. BEDAH KODE FRONTEND (REACT 18, VITE & TAILWIND CSS)'),
          p(
            'Mari kita pelajari arsitektur antarmuka pengguna di folder frontend/src/:'
          ),
          h2('6.1 src/api/axios.js - Kurir Pengantar Data Pintar (Silent Refresh)'),
          p(
            'Axios di aplikasi kita bukan sekadar fetch data biasa, melainkan dilengkapi interceptor pintar:'
          ),
          bullet('Request Interceptor:', 'Sebelum paket HTTP dikirim, kurir otomatis menempelkan Authorization: Bearer <token> yang tersimpan di memori JavaScript.'),
          bullet('Response Interceptor (Silent Refresh):', 'Jika server menjawab status 401 TOKEN_EXPIRED, kurir tidak membuat kasir panik ter-logout! Kurir langsung meminta token baru ke /api/auth/refresh di balik layar, memperbarui token di memori, dan mengulang request kasir yang tadi tertunda secara halus.'),

          h2('6.2 src/pages/CashierPage.jsx - Layar Kasir POS Terintegrasi Loyalty'),
          p(
            'Halaman kasir didesain dengan ergonomi tinggi untuk kecepatan kerja kasir minimarket:'
          ),
          bullet('Autocomplete Pencarian Member:', 'Kasir cukup mengetik nomor HP atau nama di bilah atas keranjang belanja. Daftar member langsung muncul dalam hitungan milidetik.'),
          bullet('Quick Register Member:', 'Tombol "+ Member" membuka modal pendaftaran instan langsung di meja kasir tanpa harus berpindah halaman.'),
          bullet('Kalkulasi Diskon & Poin Real-Time:', 'Mencantumkan preview potongan harga dari penukaran poin, live estimasi poin baru yang akan diperoleh, dan tombol pecahan uang praktis (+10rb s/d +100rb dan Uang Pas).'),

          h2('6.3 src/pages/MembersPage.jsx - Layar Manajemen Loyalty Member & Analitik Poin'),
          p(
            'Halaman khusus program keanggotaan pelanggan toko yang mengintegrasikan analitik bisnis, kartu digital, dan jejak audit mutasi poin:'
          ),
          bullet('4 Kartu Analitik Statistik:', 'Memantau total member, saldo poin beredar (beserta nilai liabilitas Rupiah diskonnya), total poin yang pernah ditukarkan, dan distribusi sebaran tier.'),
          bullet('Bilah Pencarian Debounced (350ms):', 'Mencegah spam request ke server saat kasir mengetik nama, nomor telepon, atau kode kartu member.'),
          bullet('Tabel Member & Badge Warna Khas:', 'Menampilkan data member dengan badge tier Platinum (Ungu), Gold (Amber), Silver (Slate), dan Bronze (Oranye).'),
          bullet('Modal Kartu VIP Digital:', 'Tampilan kartu keanggotaan modern dark-gradient mewah yang memuat nama, kode kartu, total belanja, dan saldo poin aktif.'),
          bullet('Modal Dialog Panduan Kasir (Panduan Poin & Kasir):', 'Jendela pop-up dialog interaktif yang dibuka via tombol header, memuat matriks perolehan poin per tier, konfirmasi nilai 1 Poin = Rp 100 diskon, dan 3 template skrip sapaan kasir untuk mengedukasi pelanggan tanpa mengganggu tata letak tabel utama.'),
          bullet('Audit Trail Mutasi Poin:', 'Tabel riwayat masuk dan keluar poin lengkap dengan waktu, tipe (EARN, REDEEM, BONUS, ADJUSTMENT), jumlah, saldo akhir, dan catatan.'),
          bullet('Modal Penyesuaian Poin Manual (Owner Only):', 'Form penambahan atau pengurangan poin dengan kalkulasi preview saldo baru secara langsung (live preview) dan kolom catatan audit wajib.'),

          h2('6.4 src/components/ReceiptModal.jsx - Kertas Struk Thermal Siap Cetak'),
          p(
            'Didesain presisi menyerupai kertas struk printer thermal kasir (58mm/80mm). Dilengkapi kelas CSS khusus @media print (no-print) sehingga saat tombol Cetak Nota diklik, seluruh tombol navigasi, background hitam, dan header otomatis disembunyikan. Yang keluar dari mulut printer fisik hanyalah struk belanjaan yang rapi dan bersih!'
          ),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 7: TUTORIAL LENGKAP PENGGUNAAN APLIKASI
          // ------------------------------------------------------------------
          h1('BAB 7. TUTORIAL LENGKAP PENGGUNAAN FITUR LANGKAH DEMI LANGKAH'),
          p(
            'Sebagai programmer junior, kamu wajib mencoba seluruh alur aplikasi secara langsung di komputermu. Ikuti 6 tutorial praktis berikut:'
          ),

          h2('Tutorial 1: Menyiapkan Komputer & Database Pertama Kali'),
          bullet('Langkah 1:', 'Buka XAMPP Control Panel di komputermu, pastikan modul MySQL sudah berwarna hijau (port 3306).'),
          bullet('Langkah 2:', 'Buka terminal pertama di folder backend, jalankan perintah: npm run seed'),
          bullet('Langkah 3:', 'Perhatikan terminal: Sistem otomatis membuat database pos_kasir_stok, mengisi akun owner, cashier, master barang sembako, dan 3 sampel loyalty member.'),
          bullet('Langkah 4:', 'Jalankan server backend: npm run dev (Server aktif di http://localhost:5000).'),
          bullet('Langkah 5:', 'Buka terminal kedua di folder frontend, jalankan: npm run dev (Web aktif di http://localhost:5173).'),

          h2('Tutorial 2: Alur Transaksi Kasir POS Biasa & Cetak Struk'),
          bullet('Langkah 1:', 'Buka browser di http://localhost:5173/login dan masuk sebagai kasir (Username: cashier, Password: Cashier123!).'),
          bullet('Langkah 2:', 'Kamu otomatis diarahkan ke halaman Kasir POS (/pos).'),
          bullet('Langkah 3:', 'Pilih barang di etalase sebelah kiri (misal klik "Beras Ramos Super 5kg").'),
          bullet('Langkah 4:', 'Klik tombol plus (+) di keranjang kasir untuk menjadikannya 2 unit (Total: Rp136.000).'),
          bullet('Langkah 5:', 'Klik tombol pecahan "+100rb" lalu "+50rb" (Uang tunai terisi Rp150.000, kembalian otomatis Rp14.000).'),
          bullet('Langkah 6:', 'Klik tombol "Proses Bayar & Cetak Nota". Pop-up struk thermal kasir muncul dengan nomor nota TRX-YYYYMMDD-XXXX dan siap dicetak ke printer.'),

          h2('Tutorial 3: Pendaftaran Cepat Member Baru di Meja Kasir (Quick Register)'),
          bullet('Langkah 1:', 'Di layar Kasir POS, perhatikan bilah Member di atas keranjang kasir.'),
          bullet('Langkah 2:', 'Klik tombol "+ Member" (ikon warna biru).'),
          bullet('Langkah 3:', 'Masukkan Nama Lengkap: "Budi Santoso", Nomor WhatsApp: "081288889999", lalu klik "Simpan & Pilih".'),
          bullet('Langkah 4:', 'Hebat! Member Budi Santoso langsung terdaftar dengan kode unik MBR-..., mendapatkan bonus selamat datang 10 Poin, dan otomatis terpasang di keranjang kasir saat itu juga tanpa berpindah halaman!'),

          h2('Tutorial 4: Belanja Member, Perolehan Poin, dan Penukaran Diskon Poin'),
          bullet('Langkah 1:', 'Di kolom pencarian member kasir, ketik "Andi". Klik nama Andi Pratama yang muncul di daftar autocomplete.'),
          bullet('Langkah 2:', 'Perhatikan kartu member Andi aktif di kasir: Saldo 150 Poin (Setara Diskon Rp15.000).'),
          bullet('Langkah 3:', 'Centang kotak "Tukarkan Poin". Perhatikan total tagihan belanjaan: otomatis dipotong diskon Rp15.000!'),
          bullet('Langkah 4:', 'Kasir juga dapat melihat informasi: "Estimasi poin belanja ini: +X Pts" untuk diinfokan ke pembeli.'),
          bullet('Langkah 5:', 'Masukkan uang tunai dan selesaikan checkout. Struk thermal yang tercetak memuat nama member, diskon poin, poin yang diperoleh, dan sisa saldo akhir poin.'),

          h2('Tutorial 5: Monitoring Analitik & Penyesuaian Poin Manual (Khusus Owner)'),
          bullet('Langkah 1:', 'Logout dari kasir dan masuk sebagai pemilik toko (Username: owner, Password: Owner123!).'),
          bullet('Langkah 2:', 'Buka menu samping "Loyalty Member" (/members). Pemilik dapat memantau kartu statistik peredaran poin di seluruh toko.'),
          bullet('Langkah 3:', 'Klik tombol ikon jam pada salah satu member untuk melihat Kartu VIP Digital dan riwayat mutasi poin lengkap (audit trail).'),
          bullet('Langkah 4:', 'Klik tombol ikon slider (Penyesuaian Poin Manual). Pilih Tambah Poin, masukkan angka 50, dan WAJIB mengisi alasan audit: "Hadiah loyalitas pelanggan terbaik".'),
          bullet('Langkah 5:', 'Klik simpan. Saldo poin member bertambah 50 poin dan riwayat mutasi bertipe ADJUSTMENT langsung tercatat permanen di sistem!'),

          h2('Tutorial 6: Manajemen Stok Masuk Gudang & Master Produk'),
          bullet('Langkah 1:', 'Sebagai Owner, buka menu "Stok Masuk" (/stock-in).'),
          bullet('Langkah 2:', 'Pilih barang yang baru dikirim distributor, masukkan kuantitas (misal 50 unit), nomor surat jalan, dan catatan.'),
          bullet('Langkah 3:', 'Klik simpan. Stok produk di etalase kasir bertambah otomatis dan mutasi barang masuk tercatat abadi di tabel stock_movements.'),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 8: PANDUAN PENGUJIAN 5 SKENARIO MUTLAK SISTEM
          // ------------------------------------------------------------------
          h1('BAB 8. PANDUAN PENGUJIAN 5 SKENARIO MUTLAK PEMBUKTIAN SISTEM'),
          p(
            'Untuk menguji apakah aplikasi kita benar-benar tangguh dan memenuhi standar industri, jalankan 5 skenario pembuktian berikut:'
          ),
          createStyledTable(
            ['No', 'Skenario Uji', 'Tindakan yang Dilakukan', 'Hasil yang Diharapkan (Pass Criteria)'],
            [
              ['1', 'Uji Hitung Kasir & Potong Stok', 'Checkout 2 Beras Ramos seharga Rp68.000 dengan uang tunai Rp150.000.', 'Kembalian dihitung tepat Rp14.000, struk terbit, stok Beras berkurang 2 unit di database.'],
              ['2', 'Uji Cegah Stok Minus (Row Lock)', 'Sisa stok = 1 unit. Dua jendela browser kasir checkout barang tersebut pada detik yang sama.', 'Kasir 1 berhasil checkout, kasir 2 otomatis ditolak server: "Stok produk tidak mencukupi". Sisa stok di MySQL tetap 0 (tidak pernah minus).'],
              ['3', 'Uji Anti Dobel Klik', 'Kasir mengklik tombol Bayar berkali-kali secara cepat saat koneksi lambat.', 'Tombol langsung terkunci (disabled) dan animasi loading aktif. Hanya 1 nota yang terbit (tidak ada nota ganda).'],
              ['4', 'Uji Keamanan Hak Akses (RBAC)', 'Kasir mengetik URL /users atau menembak API /api/users di browser.', 'Akses langsung ditolak dengan halaman 403 Forbidden. Kasir tidak bisa mengubah data pengguna.'],
              ['5', 'Uji Terpadu Modul Loyalty Member', 'Kasir mendaftarkan member baru, belanja dapat poin, menukar poin diskon, dan mencoba penyesuaian manual.', 'Member terdaftar, poin bertambah, diskon terpotong di nota. Saat kasir mencoba penyesuaian poin manual, server menolak 403 Forbidden. Hanya Owner yang diizinkan menyesuaikan poin.']
            ],
            [6, 26, 34, 34]
          ),

          new Paragraph({ text: '', spacing: { before: 150, after: 150 } }),

          // ------------------------------------------------------------------
          // BAB 9: TIPS DEBUGGING & MENTALITAS JUNIOR
          // ------------------------------------------------------------------
          h1('BAB 9. TIPS BELAJAR & CARA DEBUGGING SEPERTI PROGRAMMER SENIOR'),
          p(
            'Pesan Mentor: "Error dalam programming bukanlah tanda kamu gagal, melainkan petunjuk dari komputer tentang apa yang perlu diperbaiki!"'
          ),
          p(
            'Jika kamu menemui error saat mengembangkan aplikasi, ikuti urutan investigasi 4 langkah ini:'
          ),
          bullet('1. Cek Tab Console di Browser (Tekan F12):', 'Lihat apakah ada teks merah di console JavaScript. Error frontend sering kali karena nama properti yang salah ketik (typo) atau variabel yang belum terdefinisi.'),
          bullet('2. Cek Tab Network di Browser:', 'Klik request yang berwarna merah (misal status 400, 401, 403, atau 500). Buka tab Response untuk membaca pesan error ramah yang dikirim oleh backend Express.'),
          bullet('3. Cek Terminal Backend Express:', 'Jika server mengalami kendala SQL atau crash, terminal backend akan mencantumkan nama file dan nomor baris kode penyebab error secara rinci.'),
          bullet('4. Rumus Menambah Fitur Baru:', 'Selalu ikuti alur standar industri: Model Database (Sequelize) -> Fungsi Controller (Logika Bisnis) -> Rute Modular (Express) -> Komponen Antarmuka (React).'),

          p(
            '\nSelamat belajar, bereksplorasi, dan selamat berkarya! Jangan ragu untuk mencoba mengubah kode program dan melihat langsung dampaknya di layar. Masa depan rekayasa perangkat lunak ada di tanganmu! 🚀'
          )
        ]
      }
    ]
  });

  const outputPath = path.resolve('d:/Proyek Programming/MAGANG/PANDUAN_BELAJAR_DAN_KODE_LENGKAP.docx');
  const buffer = await Packer.toBuffer(doc);
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log(`Dokumen Word resmi Panduan Belajar Dan Kode Lengkap berhasil diperbarui pada: ${outputPath}`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const fallbackPath = path.resolve('d:/Proyek Programming/MAGANG/PANDUAN_BELAJAR_DAN_KODE_LENGKAP_TERBARU.docx');
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`Perhatian: File asli '${outputPath}' sedang dibuka di Microsoft Word.`);
      console.log(`Dokumen Word versi terbaru berhasil disimpan ke: ${fallbackPath}`);
    } else {
      throw err;
    }
  }
}

createDocx().catch((err) => {
  console.error('Error saat membuat dokumen Word:', err);
  process.exit(1);
});
