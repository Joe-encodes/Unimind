require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Enable trust proxy for Vercel/reverse proxies so rate limiting & IP logging work accurately
app.set('trust proxy', 1);

// ─── Security Headers (helmet) ────────────────────────────────────────────────
// Removes X-Powered-By, sets X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security, Referrer-Policy, and more.
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use((req, res, next) => {
  const rawOrigin = req.headers.origin;
  const origin = rawOrigin ? rawOrigin.trim().replace(/\/$/, '') : null;
  const host = req.headers.host ? req.headers.host.trim().toLowerCase() : '';

  // Standardize protocol comparison for same-host deployment (e.g. unimind-indol.vercel.app)
  const isSameHost = origin && (
    origin === `https://${host}` || 
    origin === `http://${host}`
  );
  
  // If an origin exists, allow if it matches host OR is in allowedOrigins whitelist
  if (origin) {
    if (isSameHost || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', rawOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      return next();
    }
    logger.warn('CORS rejected request', { origin, host, allowedOrigins });
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }

  // If no origin exists (same-origin POST or backend tool)
  if (!IS_PRODUCTION) {
    return next();
  }

  // Verify same-origin via standard Sec-Fetch-Site header
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return next();
  }

  logger.warn('CORS rejected request (missing origin and not same-origin)', { 
    secFetchSite, 
    host: req.headers.host 
  });
  return res.status(403).json({ error: 'Not allowed by CORS' });
});

// ─── Body Parsing (with size limit to prevent DoS via large payloads) ────────
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// ─── HTTP Request Logging ────────────────────────────────────────────────────
// Use 'combined' (Apache format) in production for structured log analysis,
// 'dev' (colourised, compact) only during local development.
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

// ─── Winston Structured Logging Middleware ────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip
    });
  });
  next();
});

// ─── Global Rate Limiter (all routes) ────────────────────────────────────────
// 300 requests per 15 minutes per IP — broad baseline protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// ─── Strict Rate Limiter for Auth Endpoints ───────────────────────────────────
// 10 attempts per 15 minutes per IP — prevents brute force and credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' }
});

// ─── Moderate Rate Limiter for AI Chat Endpoint ──────────────────────────────
// 30 requests per 15 minutes per IP — prevents Gemini API billing attacks
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Chat rate limit exceeded. Please wait before sending more messages.' }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', chatLimiter, require('./routes/chat'));
app.use('/api/tracker', require('./routes/tracker'));

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
// Returns JSON instead of Express's default HTML (which leaks version info)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    error: IS_PRODUCTION ? 'Internal Server Error' : err.message
  });
});

// ─── Start Server (skip when running on Vercel) ───────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV });
  });
}

module.exports = app;
