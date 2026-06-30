const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const data = readData();
  const existingUser = data.users.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: role || 'student', // default role
    flagged: false
  };

  data.users.push(newUser);
  writeData(data);

  const token = jwt.sign(
    { id: newUser.id, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({ 
    message: 'User registered successfully', 
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, flagged: newUser.flagged } 
  });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const data = readData();
  const user = data.users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(200).json({ 
    message: 'Login successful', 
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, flagged: user.flagged } 
  });
});

module.exports = router;
