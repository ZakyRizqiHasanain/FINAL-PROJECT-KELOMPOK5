const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Endpoint Statistik & Penyelesaian Klaim dapat diakses oleh semua pengguna terautentikasi (Mahasiswa & Admin)
router.use(authenticateToken);
router.get('/stats', adminController.getStats);
router.post('/complete-claim', adminController.completeClaim);

// Seluruh Aksi Mutasi Data & Manajemen di Bawah ini Khusus Admin Posko
router.use(requireAdmin);

// Validasi
router.post('/validate-match', adminController.validateMatch);

// Manajemen Pengguna (Users) - FULL CRUD
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Manajemen Laporan Kehilangan - FULL CRUD
router.post('/lost-reports', adminController.createLostReportByAdmin);
router.put('/lost-reports/:id', adminController.updateLostReport);
router.delete('/lost-reports/:id', adminController.deleteLostReport);

// Manajemen Inventaris Barang Temuan - FULL CRUD
router.post('/found-items', adminController.createFoundItemByAdmin);
router.put('/found-items/:id', adminController.updateFoundItem);
router.delete('/found-items/:id', adminController.deleteFoundItem);

// Log Notifikasi Telegram
router.get('/telegram-logs', adminController.getTelegramLogs);

module.exports = router;

