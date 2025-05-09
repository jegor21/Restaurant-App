const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const sendEmail = require('../utils/sendEmail'); 

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Generate a confirmation token
    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send confirmation email
    const confirmationUrl = `http://localhost:5000/api/auth/confirm-email?token=${confirmationToken}`;
    const emailHtml = `
      <h1>Confirmation of registration</h1>
      <p>Hello, ${username}!</p>
      <p>Please confirm your registration by clicking the link below:</p>
      <a href="${confirmationUrl}">Confirm registration</a>
    `;
    await sendEmail(email, 'Confirmation of registration', emailHtml);

    res.status(201).json({ message: 'User registered successfully. Please check your email to confirm your account.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Confirmation mail, updates user's status to confirmed
router.get('/confirm-email', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    
    await db.query('UPDATE users SET confirmed = 1 WHERE email = ?', [email]);

    
    res.redirect('http://localhost:3000/email-confirmation-success'); 
  } catch (error) {
    console.error('Error during email confirmation:', error);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = users[0];
    if (!user.confirmed) {
      return res.status(403).json({ error: 'Please confirm your email before logging in.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password Recovery
router.post('/password-recovery', async (req, res) => {
    const { email } = req.body;
    try {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User with this email does not exist' });
      }
  
      const user = users[0];
      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      const resetUrl = `http://localhost:3000/password-reset?token=${resetToken}`;
      const emailHtml = `
        <h1>Password Recovery</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `;
  
      await sendEmail(email, 'Password Recovery', emailHtml);
  
      res.json({ message: 'Password recovery email sent. Please check your inbox.' });
    } catch (error) {
      console.error('Error during password recovery:', error);
      res.status(500).json({ error: 'Failed to send password recovery email' });
    }
  });
  
  // Password Reset
  router.post('/password-reset', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
  
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(400).json({ error: 'Invalid or expired token' });
    }
  });

// Middleware JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    console.error('Invalid token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware admin access
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Ensures that user is logged in and authorized
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = { router, authenticate, authorizeAdmin };