require('dotenv').config();

/**
 * Konfigurasi terpusat untuk Backend Sistem Lost & Found (PostgreSQL & JWT)
 */
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'paw_lost_and_found_kelompok5_super_secret_jwt_key_2026',
  
  // PostgreSQL Database Configurations
  databaseUrl: process.env.DATABASE_URL || '',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: process.env.DB_NAME || 'lost_and_found_db',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres',
  
  // Optional external APIs
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || ''
};

module.exports = config;
