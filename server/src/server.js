require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const importRoutes = require('./routes/import.routes');
const queueService = require('./services/queue.service');

// 1. Import the Singleton Socket file
const socket = require('./socket'); 

// 2. Load the Worker Script
// This runs the worker immediately upon require. 
// We do NOT need to pass 'io' because the worker imports it internally.
require('./workers/import.worker'); 

const app = express();
const server = http.createServer(app); 

// 3. Initialize Socket.IO attached to the HTTP server
// This must happen before we start listening
const io = socket.init(server);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/import', importRoutes);

// Cron Job (Scheduled Import)
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Cron: Triggering scheduled import...');
  try {
    await queueService.addJobsToQueue();
  } catch (err) {
    console.error('Cron failed:', err.message);
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});