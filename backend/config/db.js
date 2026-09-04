const { Pool } = require('pg');
const config = require('./env');

let pool = null;
let isConnected = false;

// Initialize PostgreSQL Connection Pool
function getPool() {
  if (!pool) {
    const poolConfig = config.databaseUrl
      ? { connectionString: config.databaseUrl }
      : {
          host: config.dbHost,
          port: config.dbPort,
          database: config.dbName,
          user: config.dbUser,
          password: String(config.dbPassword),
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.error('⚠️ [PostgreSQL Pool Error]:', err.message);
    });
  }
  return pool;
}

/**
 * Execute SQL Query with error handling
 */
async function query(text, params) {
  const p = getPool();
  try {
    const start = Date.now();
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error(`❌ [PostgreSQL Query Error] "${text}":`, error.message);
    throw error;
  }
}

/**
 * Test PostgreSQL Connection
 */
async function testConnection() {
  try {
    const p = getPool();
    const res = await p.query('SELECT NOW() as server_time');
    isConnected = true;
    console.log(`✅ [PostgreSQL Terhubung]: Database "${config.dbName}" aktif di ${config.dbHost}:${config.dbPort}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ [PostgreSQL Offline/Not Ready]: ${err.message}`);
    console.warn(`💡 Tip: Pastikan service PostgreSQL telah aktif di localhost:5432 atau jalankan 'npm run migrate' untuk membuat database.`);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  testConnection,
  isConnected: () => isConnected
};
