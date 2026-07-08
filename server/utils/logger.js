const winston = require('winston');
const { query } = require('./db');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

const logToDb = (level, message, meta = {}) => {
  query(
    'INSERT INTO logs (level, message, meta, timestamp) VALUES ($1, $2, $3, $4)',
    [level, message, JSON.stringify(meta), new Date().toISOString()]
  ).catch(err => {
    console.error('Failed to save log to PostgreSQL:', err.message);
  });

  // Prune logs older than 7 days with a 5% probability to reduce database load
  if (Math.random() < 0.05) {
    query("DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '7 days'")
      .catch(err => console.error('Failed to prune database logs:', err.message));
  }
};

// Override / add helpers for DB logging
const originalInfo = logger.info.bind(logger);
const originalError = logger.error.bind(logger);

logger.info = (message, meta) => {
  originalInfo(message, meta);
  logToDb('info', message, meta);
};

logger.error = (message, meta) => {
  originalError(message, meta);
  logToDb('error', message, meta);
};

module.exports = logger;

