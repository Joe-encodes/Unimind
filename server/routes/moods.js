const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');

const VALID_MOODS = ['Happy', 'Neutral', 'Sad', 'Stressed'];
const MAX_NOTES_LENGTH = 1000;

// Input schema for POST /api/moods
const moodSchema = Joi.object({
  userId: Joi.string().required(),
  mood: Joi.string().valid(...VALID_MOODS).required(),
  notes: Joi.string().max(MAX_NOTES_LENGTH).allow('').optional()
});

// Require authentication for all mood routes
router.use(authenticateToken);

// Get mood history for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  // #5 Fix: compare as strings to prevent type mismatch (req.user.id is number, userId is string)
  const requesterId = String(req.user.id);
  const isCounsellor = req.user.role === 'counsellor';

  if (!isCounsellor && requesterId !== userId) {
    logger.warn('IDOR attempt blocked on mood history', {
      requesterId,
      targetUserId: userId,
      route: 'GET /api/moods/:userId'
    });
    return res.status(403).json({ error: 'Access denied: Unauthorized access to user logs' });
  }

  try {
    const result = await query(
      'SELECT id, user_id AS "userId", mood, notes, date FROM moods WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching mood history', { error: error.message, userId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Log a new mood
router.post('/', async (req, res) => {
  // #14 Input validation via Joi schema
  const { error: validationError, value } = moodSchema.validate(req.body, { abortEarly: false });
  if (validationError) {
    return res.status(400).json({ error: validationError.details.map(d => d.message).join('; ') });
  }

  const { userId, mood, notes } = value;

  // #5 Fix: string comparison for IDOR check
  if (String(req.user.id) !== userId) {
    logger.warn('IDOR attempt blocked on mood post', {
      requesterId: req.user.id,
      targetUserId: userId,
      route: 'POST /api/moods'
    });
    return res.status(403).json({ error: 'Access denied: Cannot write logs for another user' });
  }

  try {
    const insertRes = await query(
      'INSERT INTO moods (user_id, mood, notes) VALUES ($1, $2, $3) RETURNING id, user_id AS "userId", mood, notes, date',
      [userId, mood, notes || '']
    );
    const newMood = insertRes.rows[0];

    // Mood Analysis Engine — fetch 3 most recent moods
    const recentMoodsRes = await query(
      'SELECT mood FROM moods WHERE user_id = $1 ORDER BY date DESC LIMIT 3',
      [userId]
    );
    const recentMoods = recentMoodsRes.rows;

    let triggerAlert = false;
    if (recentMoods.length >= 3) {
      const negativeMoods = ['Sad', 'Stressed'];
      const allNegative = recentMoods.every(m => negativeMoods.includes(m.mood));

      if (allNegative) {
        triggerAlert = true;
        await query('UPDATE users SET flagged = true WHERE id = $1', [userId]);
        logger.info('User flagged due to consecutive negative moods', { userId });
      }
    }

    res.status(201).json({
      message: 'Mood logged successfully',
      mood: newMood,
      alert: triggerAlert
    });
  } catch (error) {
    logger.error('Error logging mood', { error: error.message, userId });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
