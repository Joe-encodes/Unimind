const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// Get tracking history for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  const userLogs = data.trackerLogs.filter(log => log.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(userLogs);
});

// Log a new day
router.post('/', (req, res) => {
  const { userId, status, challengeType } = req.body;
  
  if (!userId || !status || !challengeType) {
    return res.status(400).json({ error: 'Missing userId, status, or challengeType' });
  }

  // status should be 'clean' or 'relapse'
  if (!['clean', 'relapse'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const data = readData();
  
  const newLog = {
    id: uuidv4(),
    userId,
    status, // 'clean' or 'relapse'
    challengeType, // 'porn' or 'substance'
    date: new Date().toISOString()
  };

  data.trackerLogs.push(newLog);
  writeData(data);

  res.status(201).json({ 
    message: 'Day logged successfully', 
    log: newLog
  });
});

module.exports = router;
