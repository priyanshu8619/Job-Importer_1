const queueService = require('../services/queue.service');

class ImportController {
  
  // POST /api/trigger-import
  async triggerImport(req, res) {
    try {
      const result = await queueService.addJobsToQueue();
      res.status(200).json({ 
        message: 'Import process started', 
        jobsQueued: result.count 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/history
  async getHistory(req, res) {
    try {
      const logs = await queueService.getImportHistory();
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ImportController();