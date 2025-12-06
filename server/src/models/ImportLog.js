const mongoose = require('mongoose');

const ImportLogSchema = new mongoose.Schema({
  feedUrl: String,
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  totalFetched: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 },
  errorDetails: [String],
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ImportLog', ImportLogSchema);