const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

// Get all users with their latest mood
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.flagged, 
        COALESCE(lm.mood, 'No data') AS "latestMood", 
        lm.date AS "latestMoodDate", 
        COALESCE(mc.count, 0)::integer AS "moodCount"
      FROM users u
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, mood, date
        FROM moods
        ORDER BY user_id, date DESC
      ) lm ON u.id = lm.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS count
        FROM moods
        GROUP BY user_id
      ) mc ON u.id = mc.user_id
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin unflag a user
router.post('/unflag/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await query('UPDATE users SET flagged = false WHERE id = $1 RETURNING id', [userId]);
    if (result.rows.length > 0) {
      res.json({ message: 'User unflagged successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

