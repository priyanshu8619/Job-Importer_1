const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');

// Route: /api/import/trigger
router.post('/trigger', importController.triggerImport);

// Route: /api/import/history
router.get('/history', importController.getHistory);

module.exports = router;