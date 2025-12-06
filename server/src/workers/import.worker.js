const { Worker } = require('bullmq');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const connection = require('../config/redis');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');

const parser = new XMLParser();
let ioInstance; // Variable to store socket instance

const processImport = async (job) => {
  const { url } = job.data;
  
  // Bonus: Real-time "Start" Event
  if (ioInstance) ioInstance.emit('job-start', { url });

  const logEntry = await ImportLog.create({
    feedUrl: url,
    status: 'PROCESSING',
    startedAt: new Date()
  });

  let stats = { total: 0, new: 0, updated: 0, failed: 0, errors: [] };

  try {
    const response = await axios.get(url);
    const jsonObj = parser.parse(response.data);
    
    let items = jsonObj.rss?.channel?.item || jsonObj.source?.job || [];
    if (!Array.isArray(items)) items = [items];

    stats.total = items.length;

    for (const item of items) {
      try {
        const jobData = {
          title: item.title,
          company: item.company || item['job:company'] || 'Unknown',
          description: item.description,
          url: item.link || item.url,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          sourceFeed: url
        };

        if (!jobData.url) throw new Error("Missing Job URL");

        const existing = await Job.findOne({ url: jobData.url });
        if (existing) {
          await Job.updateOne({ url: jobData.url }, jobData);
          stats.updated++;
        } else {
          await Job.create(jobData);
          stats.new++;
        }
      } catch (err) {
        stats.failed++;
        stats.errors.push(`Item Error: ${err.message}`);
      }
    }

    await ImportLog.findByIdAndUpdate(logEntry._id, {
      status: 'COMPLETED',
      totalFetched: stats.total,
      newJobs: stats.new,
      updatedJobs: stats.updated,
      failedJobs: stats.failed,
      errorDetails: stats.errors,
      completedAt: new Date()
    });

    // Bonus: Real-time "Complete" Event
    if (ioInstance) ioInstance.emit('job-complete', { feedUrl: url, stats });

  } catch (error) {
    await ImportLog.findByIdAndUpdate(logEntry._id, {
      status: 'FAILED',
      errorDetails: [error.message],
      completedAt: new Date()
    });
    throw error; 
  }
};

const initWorker = (io) => {
  ioInstance = io; // Save socket instance
  
  new Worker('import-queue', processImport, { 
    connection, 
    // Bonus: Environment-Configurable Concurrency
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 5 
  });
  
  console.log('👷 Worker initialized with Real-time updates enabled');
};

module.exports = initWorker;