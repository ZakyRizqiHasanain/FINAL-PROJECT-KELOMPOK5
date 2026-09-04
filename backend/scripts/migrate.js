const { Client } = require('pg');
const { sequelize } = require('../models');
const config = require('../config/env');

async function migrate() {
  console.log('\n🚀 ========================================================');
  console.log('   MENJALANKAN SEQUELIZE ORM DATABASE MIGRATION');
  console.log('   PAW Final Project - Kelompok 5');
  console.log('========================================================\n');

  // Step 1: Ensure database exists
  const rootClient = new Client({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: String(config.dbPassword),
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    console.log(`🔌 Terhubung ke server PostgreSQL (${config.dbHost}:${config.dbPort})...`);

    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.dbName]
    );

    if (checkDb.rowCount === 0) {
      console.log(`📦 Database "${config.dbName}" belum ada. Membuat database baru...`);
      await rootClient.query(`CREATE DATABASE "${config.dbName}"`);
      console.log(`✅ Database "${config.dbName}" berhasil dibuat!`);
    } else {
      console.log(`ℹ️ Database "${config.dbName}" sudah ada.`);
    }
  } catch (err) {
    console.warn(`⚠️ Catatan pembuatan database: ${err.message}`);
  } finally {
    await rootClient.end();
  }

  // Step 2: Run Sequelize Schema Sync
  try {
    console.log('📄 Melakukan sinkronisasi model Sequelize ORM...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Seluruh tabel relasional Sequelize ORM berhasil dimigrasikan!');
    console.log('   - Model/Tabel: User (users)');
    console.log('   - Model/Tabel: LostReport (lost_reports)');
    console.log('   - Model/Tabel: FoundItem (found_items)');
  } catch (err) {
    console.error('❌ Gagal menjalankan migrasi Sequelize:', err.message);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

module.exports = migrate;
