const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorizeAdmin } = require('./auth'); 

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM restaurants');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET restaurant details by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST a new restaurant
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  const { place_id, name, lat, lng, address, rating, total_ratings, photos } = req.body;
  try {
    // Check if the restaurant already exists
    const [existing] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Restaurant already exists' });
    }

    // Insert the new restaurant
    const [result] = await db.query(
      'INSERT INTO restaurants (place_id, name, lat, lng, address, rating, total_ratings, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [place_id, name, lat, lng, address, rating, total_ratings, JSON.stringify(photos)]
    );
    res.json({ id: result.insertId, place_id, name, lat, lng, address, rating, total_ratings, photos });
  } catch (error) {
    res.status(500).json({ error: 'Insert failed' });
  }
});

// DELETE all restaurants
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM restaurants');
    res.status(200).json({ message: 'All restaurants deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear restaurants' });
  }
});

module.exports = router;