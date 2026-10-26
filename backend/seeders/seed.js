const dotenv = require('dotenv');
dotenv.config();

const { sequelize, testAndInitDb } = require('../config/database');
const { User, BusinessProfile, Product, StockMovement } = require('../models');

async function runSeed() {
  try {
    console.log('[Seed] Initializing database connection...');
    await testAndInitDb();
    await sequelize.sync();

    console.log('[Seed] Seeding Business Profile...');
    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        store_name: 'Toko Berkah Kelontong',
        address: 'Jl. Khatib Sulaiman No. 18, Padang, Sumatera Barat',
        phone: '0812-6789-0123',
        receipt_footer: 'Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan. Terima kasih!'
      });
      console.log('  -> Default Business Profile created.');
    } else {
      console.log('  -> Business Profile already exists.');
    }

    console.log('[Seed] Seeding Default Users (Owner & Cashier)...');

    // 1. Owner account
    let owner = await User.findOne({ where: { username: 'owner' } });
    if (!owner) {
      owner = await User.create({
        username: 'owner',
        password_hash: 'Owner123!', // will be hashed by User hook
        full_name: 'Bapak Hendra (Pemilik Toko)',
        role: 'owner',
        is_active: true
      });
      console.log('  -> Created Owner user: username=owner, password=Owner123!');
    } else {
      console.log('  -> Owner user already exists.');
    }

    // 2. Cashier account
    let cashier = await User.findOne({ where: { username: 'cashier' } });
    if (!cashier) {
      cashier = await User.create({
        username: 'cashier',
        password_hash: 'Cashier123!', // will be hashed by User hook
        full_name: 'Siti Rahma (Kasir 1)',
        role: 'cashier',
        is_active: true
      });
      console.log('  -> Created Cashier user: username=cashier, password=Cashier123!');
    } else {
      console.log('  -> Cashier user already exists.');
    }

    console.log('[Seed] Seeding Initial Product Catalog & Stock Movements...');
    const sampleProducts = [
      { sku: 'BRG-001', name: 'Beras Ramos Super 5kg', price: 68000, initialStock: 25 },
      { sku: 'BRG-002', name: 'Minyak Goreng Bimoli 2L', price: 36000, initialStock: 20 },
      { sku: 'BRG-003', name: 'Gula Pasir Gulaku Premium 1kg', price: 18000, initialStock: 35 },
      { sku: 'BRG-004', name: 'Kopi Kapal Api Special 165g', price: 15000, initialStock: 40 },
      { sku: 'BRG-005', name: 'Teh Celup Sariwangi Kotak 25s', price: 8500, initialStock: 50 },
      { sku: 'BRG-006', name: 'Indomie Goreng Original 85g', price: 3500, initialStock: 120 },
      { sku: 'BRG-007', name: 'Susu Kental Manis Frisian Flag 370g', price: 12500, initialStock: 30 },
      { sku: 'BRG-008', name: 'Sabun Mandi Lifebuoy Total 10 85g', price: 4500, initialStock: 60 }
    ];

    for (const item of sampleProducts) {
      let product = await Product.findOne({ where: { sku: item.sku } });
      if (!product) {
        product = await Product.create({
          sku: item.sku,
          name: item.name,
          price: item.price,
          stock: item.initialStock,
          is_active: true
        });

        // Record initial stock movement audit trail
        await StockMovement.create({
          product_id: product.id,
          quantity: item.initialStock,
          type: 'in',
          reference_number: 'INITIAL-STOCK-2026',
          notes: 'Saldo stok awal pembukaan toko',
          created_by_user_id: owner.id
        });
        console.log(`  -> Created product: ${item.name} (${item.sku}) with stock ${item.initialStock}`);
      }
    }

    console.log('\n[Seed Completed] Database successfully seeded with production-like master data!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

runSeed();
