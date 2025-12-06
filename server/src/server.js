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

const io = new Server(server, {
  cors: {
    // Replace with your ACTUAL Vercel URL
    origin: ["https://job-importer-1.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
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