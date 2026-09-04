const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, validateAuthPayload } = require('../middlewares/auth.middleware');

// Public Auth Endpoints
router.post('/login', validateAuthPayload('login'), authController.login);
router.post('/register', validateAuthPayload('register'), authController.register);

// Protected Auth Endpoints (Wajib Login)
router.get('/me', authenticateToken, authController.getMe);
router.get('/users', authenticateToken, authController.getAllUsers);

module.exports = router;
