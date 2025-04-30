const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorizeAdmin } = require('./auth');
const axios = require('axios'); 

// Reverse Geocoding to Get City
const getCityFromCoordinates = async (lat, lng) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      const city = addressComponents.find((component) =>
        component.types.includes('locality')
      )?.long_name;

      return city || 'Unknown City';
    }
  } catch (error) {
    console.error('Error fetching city from coordinates:', error);
  }

  return 'Unknown City';
};

router.get('/', async (req, res) => {
  const { search, sort, order, page = 1, limit = 10 } = req.query;

  try {
    let query = 'SELECT * FROM restaurants';
    const queryParams = [];
    let countQuery = 'SELECT COUNT(*) as total FROM restaurants';

    // search bar
    if (search) {
      query += ' WHERE name LIKE ? OR city LIKE ? OR address LIKE ?';
      countQuery += ' WHERE name LIKE ? OR city LIKE ? OR address LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // sorting
    if (sort) {
      const validSortFields = ['name', 'rating', 'total_ratings'];
      if (validSortFields.includes(sort)) {
        query += ` ORDER BY ${sort}`;
        if (order === 'desc') {
          query += ' DESC';
        } else {
          query += ' ASC';
        }
      }
    }

    // pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, queryParams);
    const [countResult] = await db.query(countQuery, queryParams.slice(0, 3)); // Use same search params for count
    const total = countResult[0].total;

    res.json({ data: rows, total });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
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

// POST a New Restaurant
router.post('/', authenticate, async (req, res) => {
  const { searchPoint, restaurants } = req.body;

  try {
    const city = await getCityFromCoordinates(searchPoint.lat, searchPoint.lng);

    const results = [];
    for (const restaurant of restaurants) {
      const { place_id, name, lat, lng, address, rating, total_ratings } = restaurant;

      // default photo "no-photo.jpg"
      const photos = restaurant.photos || "no-photo.jpg";

      const cleanAddress = address.split(',').slice(0, -1).join(',').trim();

      const [existing] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
      if (existing.length > 0) {
        results.push({ place_id, status: 'exists' });
        continue;
      }

      const [result] = await db.query(
        'INSERT INTO restaurants (place_id, name, lat, lng, address, city, rating, total_ratings, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [place_id, name, lat, lng, cleanAddress, city, rating, total_ratings, photos]
      );

      results.push({ id: result.insertId, place_id, status: 'saved' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error saving restaurants:', error);
    res.status(500).json({ error: 'Failed to save restaurants' });
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