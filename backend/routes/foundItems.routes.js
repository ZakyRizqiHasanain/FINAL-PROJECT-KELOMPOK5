const express = require('express');
const router = express.Router();
const foundItemsController = require('../controllers/foundItems.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Seluruh Endpoint Wajib Login (JWT Token)
router.use(authenticateToken);

router.get('/', foundItemsController.getAllFoundItems);
router.get('/:id', foundItemsController.getFoundItemById);
router.post('/', foundItemsController.createFoundItem);
router.put('/:id', requireAdmin, foundItemsController.updateFoundItem);
router.delete('/:id', requireAdmin, foundItemsController.deleteFoundItem);

module.exports = router;
