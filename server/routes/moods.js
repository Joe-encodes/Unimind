const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

// Get mood history for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query(
      'SELECT id, user_id AS "userId", mood, notes, date FROM moods WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Log a new mood
router.post('/', async (req, res) => {
  const { userId, mood, notes } = req.body;
  
  if (!userId || !mood) {
    return res.status(400).json({ error: 'Missing userId or mood' });
  }

  try {
    // Insert new mood
    const insertRes = await query(
      'INSERT INTO moods (user_id, mood, notes) VALUES ($1, $2, $3) RETURNING id, user_id AS "userId", mood, notes, date',
      [userId, mood, notes || '']
    );
    const newMood = insertRes.rows[0];

    // Mood Analysis Engine - Fetch the 3 most recent moods
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
        // Flag the user in the database
        await query('UPDATE users SET flagged = true WHERE id = $1', [userId]);
      }
    }

    res.status(201).json({ 
      message: 'Mood logged successfully', 
      mood: newMood,
      alert: triggerAlert
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

