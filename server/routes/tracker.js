const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

// Get tracking history for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query(
      'SELECT id, user_id AS "userId", status, challenge_type AS "challengeType", date FROM tracker_logs WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Log a new day
router.post('/', async (req, res) => {
  const { userId, status, challengeType } = req.body;
  
  if (!userId || !status || !challengeType) {
    return res.status(400).json({ error: 'Missing userId, status, or challengeType' });
  }

  // status should be 'clean' or 'relapse'
  if (!['clean', 'relapse'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

