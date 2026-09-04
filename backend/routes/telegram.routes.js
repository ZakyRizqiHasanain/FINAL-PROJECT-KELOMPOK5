const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Seluruh Endpoint Telegram Wajib Login
router.use(authenticateToken);

router.get('/logs', telegramController.getLogs);
router.post('/broadcast', requireAdmin, telegramController.sendBroadcast);

module.exports = router;
