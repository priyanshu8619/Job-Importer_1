const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  url: { type: String, unique: true, index: true },
  pubDate: Date,
  sourceFeed: String,
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);