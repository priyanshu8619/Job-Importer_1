const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true }, // Unique ID from RSS/XML
  title: { type: String, required: true },
  description: String,
  company: String,
  location: String,
  url: String, // Link to the actual job post
  pubDate: Date,
  fetchedAt: { type: Date, default: Date.now }
});

// Create an index on jobId for faster "upsert" operations
JobSchema.index({ jobId: 1 });

module.exports = mongoose.model('Job', JobSchema);