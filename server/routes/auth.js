const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Crash loudly at startup if the secret is missing — never fall back silently
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}

const BCRYPT_SALT_ROUNDS = 12;

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // #19 Privilege Escalation Fix: role is NEVER accepted from the client.
  // All self-registered accounts are students. Counsellors are promoted via DB only.
  const assignedRole = 'student';

  try {
    const existingUserRes = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      logger.warn('Registration attempt with existing email', { email });
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const insertRes = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, flagged',
      [name, email, hashedPassword, assignedRole]
    );
    const newUser = insertRes.rows[0];

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info('New user registered', { userId: newUser.id, role: newUser.role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, flagged: newUser.flagged }
    });
  } catch (error) {
    logger.error('Error during registration', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    // Constant-time comparison path: always call bcrypt.compare even if user not found
    // to prevent timing-based user enumeration
    const dummyHash = '$2b$12$invalidhashfortimingnormalisationpurposes000000000000000';
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !passwordMatch) {
      logger.warn('Failed login attempt', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info('Successful login', { userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, flagged: user.flagged }
    });
  } catch (error) {
    logger.error('Error during login', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

// Google Login / OAuth callback sync
router.post('/google-login', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ error: 'Please provide access token' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('SUPABASE_URL or SUPABASE_ANON_KEY is not configured');
    return res.status(500).json({ error: 'Server authentication configuration error' });
  }

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
      logger.warn('Google/Supabase token validation failed', { status: response.status });
      return res.status(401).json({ error: 'Invalid or expired Google/Supabase token' });
    }

    const userData = await response.json();
    const email = userData.email;
    const name = userData.user_metadata?.full_name || email.split('@')[0];

    if (!email) {
      return res.status(400).json({ error: 'Email not found in token' });
    }

    // Check if user exists
    let userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userRes.rows[0];
    let isNewUser = false;

    // New OAuth users always get 'student' role — never trust the token for role
    if (!user) {
      const dummyPassword = await bcrypt.hash(require('crypto').randomBytes(32).toString('hex'), BCRYPT_SALT_ROUNDS);
      const insertRes = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, dummyPassword, 'student']
      );
      user = insertRes.rows[0];
      isNewUser = true;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info('Google OAuth login', { userId: user.id, role: user.role, isNewUser });

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, flagged: user.flagged }
    });
  } catch (error) {
    logger.error('Error during Google login', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error during Google login' });
  }
});

module.exports = router;
