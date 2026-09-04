const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const db = require('./data/db');
const { sequelize } = require('./models');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const lostReportsRoutes = require('./routes/lostReports.routes');
const foundItemsRoutes = require('./routes/foundItems.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const telegramRoutes = require('./routes/telegram.routes');

const app = express();

// Middleware
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lost-reports', lostReportsRoutes);
app.use('/api/found-items', foundItemsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/telegram', telegramRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Lost & Found Campus AI System API Server (Kelompok 5)',
    status: 'Running',
    version: '1.0.0',
    orm: 'Sequelize ORM (PostgreSQL)',
    database: {
      engine: 'PostgreSQL (Sequelize)',
      host: config.dbHost,
      name: config.dbName,
      status: db.isSequelizeConnected ? 'Connected (Sequelize Active)' : 'Fallback Local / Offline'
    },
    auth: 'JWT (JSON Web Token)',
    endpoints: [
      '/health',
      '/api/auth',
      '/api/lost-reports',
      '/api/found-items',
      '/api/ai',
      '/api/admin',
      '/api/telegram'
    ]
  });
});

if (require.main === module) {
  app.listen(config.port, async () => {
    console.log(`🚀 Backend Express siap & aktif di http://localhost:${config.port}`);
    try {
      await sequelize.authenticate();
      console.log(`✅ [Sequelize ORM]: Terhubung ke PostgreSQL "${config.dbName}" di ${config.dbHost}:${config.dbPort}`);
    } catch (e) {
      console.warn(`⚠️ [Sequelize ORM Offline/Fallback]: ${e.message}`);
    }
  });
}

module.exports = app;
