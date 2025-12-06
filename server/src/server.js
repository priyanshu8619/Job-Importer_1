require('dotenv').config();
const express = require('express');
const http = require('http'); // Import HTTP
const { Server } = require('socket.io'); // Import Socket.IO
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const importRoutes = require('./routes/import.routes');
const initWorker = require('./workers/import.worker');
const queueService = require('./services/queue.service');

const app = express();
const server = http.createServer(app); // Wrap Express app

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow Frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Initialize Worker (Pass 'io' so worker can emit events)
initWorker(io);

app.use('/api/import', importRoutes);

// Cron Job
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Cron: Triggering scheduled import...');
  await queueService.addJobsToQueue();
});

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});