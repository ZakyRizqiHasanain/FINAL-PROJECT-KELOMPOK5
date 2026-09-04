const express = require('express');
const router = express.Router();
const lostReportsController = require('../controllers/lostReports.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Seluruh Endpoint Wajib Login (JWT Token)
router.use(authenticateToken);

router.get('/', lostReportsController.getAllLostReports);
router.get('/:id', lostReportsController.getLostReportById);
router.post('/', lostReportsController.createLostReport);
router.put('/:id', lostReportsController.updateLostReport);
router.delete('/:id', lostReportsController.deleteLostReport);

module.exports = router;
