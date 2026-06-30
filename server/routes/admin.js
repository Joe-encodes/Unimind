const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');

// Get all users with their latest mood
router.get('/users', (req, res) => {
  const data = readData();
  
  // Exclude passwords
  const users = data.users.map(u => {
    const userMoods = data.moods.filter(m => m.userId === u.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestMood = userMoods.length > 0 ? userMoods[0] : null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      flagged: u.flagged,
      latestMood: latestMood ? latestMood.mood : 'No data',
      latestMoodDate: latestMood ? latestMood.date : null,
      moodCount: userMoods.length
    };
  });

  res.json(users);
});

// Admin unflag a user
router.post('/unflag/:userId', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    data.users[userIndex].flagged = false;
    writeData(data);
    res.json({ message: 'User unflagged successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

module.exports = router;
