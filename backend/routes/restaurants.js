const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM restaurants');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST a new restaurant
router.post('/', async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    const [result] = await db.query('INSERT INTO restaurants (name, lat, lng) VALUES (?, ?, ?)', [name, lat, lng]);
    res.json({ id: result.insertId, name, lat, lng });
  } catch (error) {
    res.status(500).json({ error: 'Insert failed' });
  }
});

module.exports = router;
