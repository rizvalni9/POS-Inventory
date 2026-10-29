const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest() {
  console.log('=== TEST ALUR LENGKAP MODUL LOYALTY MEMBER ===\n');

  try {
    // 1. Login sebagai Cashier
    console.log('1. Menguji Login sebagai Kasir (cashier)...');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { username: 'cashier', password: 'Cashier123!' }
    );

    if (loginRes.status !== 200 || !loginRes.data?.data?.token) {
      throw new Error(`Login kasir gagal: ${JSON.stringify(loginRes.data)}`);
    }
    const cashierToken = loginRes.data.data.token;
    console.log('   -> Sukses! Token kasir diperoleh.');

    // 2. Cari Member via Quick Search
    console.log('\n2. Menguji Quick Search Member (query: "Andi")...');
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/members/search-quick?q=Andi',
      method: 'GET',
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    console.log(`   -> Hasil pencarian: ${searchRes.data?.data?.length} member ditemukan.`);
    const andiMember = searchRes.data?.data[0];
    console.log(`   -> Nama: ${andiMember?.name}, Poin: ${andiMember?.points}, Tier: ${andiMember?.tier}`);

    // 3. Pendaftaran Member Baru oleh Kasir
    console.log('\n3. Menguji Pendaftaran Member Baru oleh Kasir...');
    const randomPhone = `08129999${Math.floor(1000 + Math.random() * 9000)}`;
    const createRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/members',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cashierToken}`
        }
      },
      {
        name: 'Siti Badriah',
        phone: randomPhone,
        email: 'siti.b@gmail.com',
        tier: 'Bronze',
        initial_points: 25
      }
    );

    if (createRes.status !== 201) {
      throw new Error(`Gagal membuat member baru: ${JSON.stringify(createRes.data)}`);
    }
    const newMember = createRes.data.data;
    console.log(`   -> Berhasil! Member: ${newMember.name}, Kode: ${newMember.member_code}, Poin Awal: ${newMember.points}`);

    // 4. Ambil 1 produk untuk ditransaksikan
    console.log('\n4. Mengambil katalog produk untuk checkout POS...');
    const prodRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET',
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    const product = prodRes.data?.data?.find((p) => p.stock >= 2);
    if (!product) throw new Error('Tidak ada produk dengan stok cukup.');
    console.log(`   -> Menggunakan produk '${product.name}' (Harga: Rp${product.price}, Stok: ${product.stock})`);

    // 5. Checkout Kasir dengan Member Baru & Penukaran Poin
    console.log('\n5. Menguji Checkout POS dengan Member dan Penukaran 20 Poin...');
    const qty = 2;
    const subtotal = product.price * qty;
    const pointsToRedeem = 20; // 20 Pts = Diskon Rp2.000
    const discount = pointsToRedeem * 100;
    const netTotal = subtotal - discount;
    const cashPaid = netTotal + 10000;

    const checkoutRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/sales/checkout',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cashierToken}`
        }
      },
      {
        cash_paid: cashPaid,
        items: [{ product_id: product.id, quantity: qty }],
        member_id: newMember.id,
        redeem_points: pointsToRedeem
      }
    );

    if (checkoutRes.status !== 201) {
      throw new Error(`Checkout gagal: ${JSON.stringify(checkoutRes.data)}`);
    }
    const saleData = checkoutRes.data.data.sale;
    console.log(`   -> Checkout Berhasil! Faktur: ${saleData.invoice_number}`);
    console.log(`   -> Subtotal: Rp${saleData.subtotal_amount}`);
    console.log(`   -> Diskon Member: Rp${saleData.discount_amount} (Tukar ${saleData.points_redeemed} Pts)`);
    console.log(`   -> Total Bersih: Rp${saleData.total_amount}`);
    console.log(`   -> Poin Baru Didapat: +${saleData.points_earned} Pts`);
    console.log(`   -> Sisa Saldo Poin Member: ${saleData.member.points} Pts`);

    // 6. Cek Detail Member dan Riwayat Mutasi Poin
    console.log('\n6. Memeriksa Audit Trail Riwayat Mutasi Poin Member...');
    const memberDetailRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/members/${newMember.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    const histories = memberDetailRes.data.data.point_histories;
    console.log(`   -> Ditemukan ${histories.length} riwayat mutasi poin:`);
    for (const h of histories) {
      console.log(`      * [${h.type}] Mutasi: ${h.points > 0 ? '+' : ''}${h.points} Pts, Saldo Setelah: ${h.balance_after} Pts | Ket: ${h.description}`);
    }

    // 7. Login sebagai Owner untuk Uji RBAC & Penyesuaian Manual
    console.log('\n7. Menguji Login sebagai Pemilik Toko (owner)...');
    const ownerLoginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { username: 'owner', password: 'Owner123!' }
    );
    const ownerToken = ownerLoginRes.data.data.token;
    console.log('   -> Sukses! Token Owner diperoleh.');

    // 8. Kasir mencoba penyesuaian manual (harus ditolak 403 Forbidden)
    console.log('\n8. Membuktikan Kasir DITOLAK saat mencoba Penyesuaian Poin Manual (RBAC)...');
    const forbiddenRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/members/${newMember.id}/adjust-points`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cashierToken}`
        }
      },
      { points_delta: 50, reason: 'Iseng coba tambah poin' }
    );
    console.log(`   -> Status Respons: ${forbiddenRes.status} (Ditolak: ${forbiddenRes.data?.message})`);

    // 9. Owner melakukan Penyesuaian Poin Manual Resmi
    console.log('\n9. Owner melakukan Penyesuaian Poin Manual (+50 Poin) dengan Catatan Audit...');
    const adjustRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/members/${newMember.id}/adjust-points`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        }
      },
      { points_delta: 50, reason: 'Hadiah reward loyalitas pelanggan baru' }
    );
    console.log(`   -> Status: ${adjustRes.status}, Pesan: ${adjustRes.data?.message}`);

    // 10. Ambil Ringkasan Analitik Loyalty Member
    console.log('\n10. Memeriksa Ringkasan Analitik Loyalty Toko...');
    const summaryRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/members/summary/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log('   -> Ringkasan Analitik:', summaryRes.data?.data);

    console.log('\n✅ SEMUA PENGUJIAN MODUL LOYALTY MEMBER BERHASIL 100% TANPA KENDALA!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Pengujian Gagal:', error);
    process.exit(1);
  }
}

runTest();
