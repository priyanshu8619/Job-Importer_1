const { Queue } = require('bullmq');
const connection = require('../config/redis');
const ImportLog = require('../models/ImportLog');

const importQueue = new Queue('import-queue', { connection });

const FEED_URLS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm"
];

class QueueService {
  async addJobsToQueue() {
    const jobs = FEED_URLS.map(url => ({
      name: 'import-job',
      data: { url },
      // Bonus: Retry Logic options
      opts: {
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
          type: 'exponential', // Wait 1s, then 2s, then 4s...
          delay: 1000,
        },
        removeOnComplete: true
      }
    }));

    await importQueue.addBulk(jobs);
    return { count: jobs.length };
  }

  async getImportHistory() {
    return await ImportLog.find().sort({ createdAt: -1 }).limit(50);
  }
}

module.exports = new QueueService();