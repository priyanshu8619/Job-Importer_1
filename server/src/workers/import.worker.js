const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');

// correct paths to your models and socket
const ImportLog = require('../models/ImportLog'); 
const Job = require('../models/Job');             
const socket = require('../socket');              

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker('import-queue', async (job) => {
  const { url } = job.data;
  
  // Get socket instance safely
  let io;
  try { io = socket.getIO(); } catch (e) { console.warn("Socket not init"); }

  // Notify Frontend: Started
  if (io) io.emit('job-start', { url, jobId: job.id });

  try {
    console.log(`Processing job: ${url}`);

    // --- 1. MOCK DATA (Replace this with real XML parsing later) ---
    // These are the jobs we want to save
    const feedData = [
      { jobId: '101', title: 'React Developer', company: 'Tech Corp', url: 'http://site.com/1', pubDate: new Date() },
      { jobId: '102', title: 'Node.js Backend', company: 'Soft Sys', url: 'http://site.com/2', pubDate: new Date() },
      { jobId: '103', title: 'Full Stack Dev', company: 'Web Sol', url: 'http://site.com/3', pubDate: new Date() } // Added a new one
    ]; 

    // --- 2. THE FIX: BULK WRITE (UPSERT) ---
    // This prevents the E11000 Duplicate Key Error
    const operations = feedData.map(item => ({
      updateOne: {
        filter: { jobId: item.jobId }, // Check if this ID exists
        update: { $set: item },        // Update fields if found
        upsert: true                   // Insert if not found
      }
    }));

    const result = await Job.bulkWrite(operations);

    // --- 3. CALCULATE STATS ---
    const stats = {
      feedUrl: url,
      status: 'COMPLETED',
      totalFetched: feedData.length,
      newJobs: result.upsertedCount,    // How many were actually new
      updatedJobs: result.modifiedCount,// How many were updates
      failedJobs: 0
    };

    // --- 4. SAVE HISTORY LOG ---
    await ImportLog.create(stats);

    // Notify Frontend: Finished
    if (io) io.emit('job-complete', stats);
    
    return stats;

  } catch (error) {
    console.error('Job Failed:', error);
    
    // Save Failed Log
    await ImportLog.create({
      feedUrl: url,
      status: 'FAILED',
      error: error.message // This is where "E11000..." was coming from
    });

    if (io) io.emit('job-error', { message: error.message });
    throw error;
  }
}, { connection });

console.log("Worker listening for jobs...");