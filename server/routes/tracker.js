const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');

const VALID_STATUSES = ['clean', 'relapse'];
const VALID_CHALLENGE_TYPES = ['alcohol', 'substances', 'smoking', 'gambling', 'other'];
const MAX_CHALLENGE_TYPE_LENGTH = 50;

// Input schema for POST /api/tracker
const trackerSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.string().valid(...VALID_STATUSES).required(),
  // Allow known types OR any string up to 50 chars (extensible but bounded)
  challengeType: Joi.string().max(MAX_CHALLENGE_TYPE_LENGTH).required()
});

// Require authentication for all tracker routes
router.use(authenticateToken);

// Get tracking history for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  // #5 Fix: compare as strings to prevent type mismatch
  const requesterId = String(req.user.id);
  const isCounsellor = req.user.role === 'counsellor';

  if (!isCounsellor && requesterId !== userId) {
    logger.warn('IDOR attempt blocked on tracker history', {
      requesterId,
      targetUserId: userId,
      route: 'GET /api/tracker/:userId'
    });
    return res.status(403).json({ error: 'Access denied: Unauthorized access to tracker logs' });
  }

  try {
    const result = await query(
      'SELECT id, user_id AS "userId", status, challenge_type AS "challengeType", date FROM tracker_logs WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching tracker history', { error: error.message, userId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Log a new day
router.post('/', async (req, res) => {
  // #14 Input validation via Joi schema
  const { error: validationError, value } = trackerSchema.validate(req.body, { abortEarly: false });
  if (validationError) {
    return res.status(400).json({ error: validationError.details.map(d => d.message).join('; ') });
  }

  const { userId, status, challengeType } = value;

  // #5 Fix: string comparison for IDOR check
  if (String(req.user.id) !== userId) {
    logger.warn('IDOR attempt blocked on tracker post', {
      requesterId: req.user.id,
      targetUserId: userId,
      route: 'POST /api/tracker'
    });
    return res.status(403).json({ error: 'Access denied: Cannot write logs for another user' });
  }

  try {
    const result = await query(
      'INSERT INTO tracker_logs (user_id, status, challenge_type) VALUES ($1, $2, $3) RETURNING id, user_id AS "userId", status, challenge_type AS "challengeType", date',
      [userId, status, challengeType]
    );

    res.status(201).json({
      message: 'Day logged successfully',
      log: result.rows[0]
    });
  } catch (error) {
    logger.error('Error logging tracker entry', { error: error.message, userId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
