// server/routes/import.js
const express = require('express');
const router = express.Router();
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const ImportLog = require('../models/ImportLog');

// ✅ NEW CONNECTION LOGIC:
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const connection = new IORedis(redisConfig);
const importQueue = new Queue('import-queue', { connection });

// 1. TRIGGER IMPORT (Now uses Queue)
router.post('/trigger', async (req, res) => {
  const { url } = req.body;
  
  // Add job to queue with retry options
  await importQueue.add('xml-import', { url }, {
    attempts: 3,       // Retry 3 times on failure
    backoff: 5000,     // Wait 5s between retries
    removeOnComplete: true
  });

  res.status(200).json({ message: 'Import job queued successfully' });
});

// 2. FETCH HISTORY (Now supports Pagination)
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await ImportLog.countDocuments();
    const logs = await ImportLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;