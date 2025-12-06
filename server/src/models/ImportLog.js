const mongoose = require('mongoose');

const ImportLogSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PROCESSING' 
  },
  feedUrl: { type: String, required: true },
  totalFetched: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },     // Count of completely new inserts
  updatedJobs: { type: Number, default: 0 }, // Count of existing jobs updated
  failedJobs: { type: Number, default: 0 },
  error: { type: String },
  createdAt: { type: Date, default: Date.now } // Used for sorting history
});

module.exports = mongoose.model('ImportLog', ImportLogSchema);