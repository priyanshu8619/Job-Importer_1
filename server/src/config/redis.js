const Redis = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST, 
  port: process.env.REDIS_PORT,
  // Only add password if it exists in .env (for Redis Cloud)
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  maxRetriesPerRequest: null
});

module.exports = connection;