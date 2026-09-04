const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Seluruh Endpoint AI Wajib Login (JWT Token)
router.use(authenticateToken);

router.post('/match', aiController.calculateMatches);
router.post('/chatbot', aiController.handleChatbotMessage);

module.exports = router;
