const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const existingUserRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertRes = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role || 'student']
    );
    const newUser = insertRes.rows[0];

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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

// Google Login / OAuth callback sync
router.post('/google-login', async (req, res) => {
  const { access_token } = req.body;
  console.log('Google login request body:', req.body);
  if (!access_token) {
    console.log('Google login failed: access_token is missing');
    return res.status(400).json({ error: 'Please provide access token' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://bterinckaabrcrumtsej.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';

  try {
    // Verify token with Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': supabaseAnonKey
      }
    });

    if (!response.ok) {
      console.log('Google login failed: Supabase API responded with error status:', response.status);
      return res.status(401).json({ error: 'Invalid or expired Google/Supabase token' });
    }

    const userData = await response.json();
    console.log('Supabase user data response:', userData);
    const email = userData.email;
    const name = userData.user_metadata?.full_name || email.split('@')[0];

    if (!email) {
      console.log('Google login failed: Email not found in Supabase user data');
      return res.status(400).json({ error: 'Email not found in token' });
    }

    // Check if user exists
    let userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userRes.rows[0];

    // If user does not exist, create a new student account
    if (!user) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const insertRes = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, dummyPassword, 'student']
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Google login successful', 
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, flagged: user.flagged } 
    });
  } catch (error) {
    console.error('Error during Google verification:', error);
    res.status(500).json({ error: 'Internal Server Error during Google login' });
  }
});

module.exports = router;


