/**
 * Seeder Script untuk Sistem Lost & Found Kampus (Sequelize ORM)
 * PAW Final Project - Kelompok 5
 */

const fs = require('fs');
const path = require('path');
const { sequelize, User, LostReport, FoundItem } = require('../models');
const dummyData = require('../data/dummyData');

async function runSeed() {
  console.log('\n🌱 ========================================================');
  console.log('   MENJALANKAN SEQUELIZE ORM DATABASE SEEDER');
  console.log('   PAW Final Project - Kelompok 5');
  console.log('========================================================\n');

  // 1. Write local json backup
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbFilePath = path.join(dataDir, 'db.json');
    fs.writeFileSync(dbFilePath, JSON.stringify(dummyData, null, 2), 'utf-8');
    console.log(`✅ File data cadangan tersimpan: backend/data/db.json`);
  } catch (e) {
    console.warn('Catatan backup JSON:', e.message);
  }

  // 2. Seed to PostgreSQL via Sequelize ORM
  try {
    await sequelize.authenticate();
    console.log(`🔌 Terhubung ke database PostgreSQL via Sequelize ORM...`);

    // Recreate & sync all tables cleanly
    await sequelize.sync({ force: true });
    console.log(`🧹 Skema tabel berhasil di-reset bersih (force sync).`);

    // Bulk Create Users
    const userRecords = dummyData.users.map(u => ({
      id: u.id,
      name: u.name,
      nim: u.nim || null,
      nip: u.nip || null,
      email: u.email,
      password: u.password,
      role: u.role,
      phone: u.phone,
      telegramUsername: u.telegramUsername,
      telegramChatId: u.telegramChatId || null,
      avatar: u.avatar,
      createdAt: u.createdAt
    }));
    await User.bulkCreate(userRecords);
    console.log(`👤 Berhasil memasukkan ${userRecords.length} pengguna (Users).`);

    // Bulk Create FoundItems
    const foundRecords = dummyData.foundItems.map(f => ({
      id: f.id,
      title: f.title,
      category: f.category,
      color: f.color || '-',
      locationFound: f.locationFound,
      dateFound: f.dateFound,
      timeFound: f.timeFound || '10:00',
      storageLocation: f.storageLocation,
      foundBy: f.foundBy,
      features: f.features,
      status: f.status,
      imageUrl: f.imageUrl,
      createdAt: f.createdAt
    }));
    await FoundItem.bulkCreate(foundRecords);
    console.log(`📦 Berhasil memasukkan ${foundRecords.length} barang temuan (FoundItems).`);

    // Bulk Create LostReports
    const lostRecords = dummyData.lostReports.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      color: r.color || '-',
      lastSeenLocation: r.lastSeenLocation,
      dateLost: r.dateLost,
      approxTime: r.approxTime || '12:00',
      features: r.features,
      description: r.description || null,
      reporterName: r.reporterName,
      reporterNim: r.reporterNim || null,
      reporterPhone: r.reporterPhone || null,
      reporterTelegram: r.reporterTelegram || null,
      userId: r.userId || null,
      status: r.status,
      matchedItemId: r.matchedItemId || null,
      matchScore: r.matchScore || null,
      matchReason: r.matchReason || null,
      adminValidationNotes: r.adminValidationNotes || null,
      createdAt: r.createdAt
    }));
    await LostReport.bulkCreate(lostRecords);
    console.log(`📋 Berhasil memasukkan ${lostRecords.length} laporan kehilangan (LostReports).`);

    console.log('\n🎉 [SEEK/SEED BERHASIL]: Database PostgreSQL Sequelize siap digunakan!');
  } catch (err) {
    console.warn(`⚠️ Catatan seeder Sequelize: ${err.message}`);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runSeed().then(() => process.exit(0));
}

module.exports = runSeed;
