const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// Get mood history for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  const userMoods = data.moods.filter(m => m.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(userMoods);
});

// Log a new mood
router.post('/', (req, res) => {
  const { userId, mood, notes } = req.body;
  
  if (!userId || !mood) {
    return res.status(400).json({ error: 'Missing userId or mood' });
  }

  const data = readData();
  
  const newMood = {
    id: uuidv4(),
    userId,
    mood, // 'Happy', 'Neutral', 'Sad', 'Stressed'
    notes: notes || '',
    date: new Date().toISOString()
  };

  data.moods.push(newMood);

  // Mood Analysis Engine
  const userMoods = data.moods.filter(m => m.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  let triggerAlert = false;

  if (userMoods.length >= 3) {
    const lastThree = userMoods.slice(0, 3);
    const negativeMoods = ['Sad', 'Stressed'];
    const allNegative = lastThree.every(m => negativeMoods.includes(m.mood));
    
    if (allNegative) {
      triggerAlert = true;
      // Flag the user
      const userIndex = data.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        data.users[userIndex].flagged = true;
      }
    } else {
      // Unflag the user if they improve? We can keep them flagged until admin reviews, 
      // but let's keep it simple: we only flag them here. Admin unflags them or they just stay flagged.
    }
  }

  writeData(data);

  res.status(201).json({ 
    message: 'Mood logged successfully', 
    mood: newMood,
    alert: triggerAlert
  });
});

module.exports = router;
