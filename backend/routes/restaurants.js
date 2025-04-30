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

// POST a New Restaurant
router.post('/', authenticate, async (req, res) => {
  const { searchPoint, restaurants } = req.body; 

  console.log("Received searchPoint:", searchPoint); 
  console.log("Received restaurants:", restaurants); 

  try {
    
    const city = await getCityFromCoordinates(searchPoint.lat, searchPoint.lng);
    console.log("City determined from searchPoint:", city); 

    const results = [];
    for (const restaurant of restaurants) {
      const { place_id, name, lat, lng, address, rating, total_ratings, photos } = restaurant;

      
      const cleanAddress = address.split(',').slice(0, -1).join(',').trim();

      
      const [existing] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
      if (existing.length > 0) {
        results.push({ place_id, status: 'exists' });
        continue;
      }

      
      const [result] = await db.query(
        'INSERT INTO restaurants (place_id, name, lat, lng, address, city, rating, total_ratings, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [place_id, name, lat, lng, cleanAddress, city, rating, total_ratings, JSON.stringify(photos)]
      );

      results.push({ id: result.insertId, place_id, status: 'saved' });
    }

    res.json(results);
  } catch (error) {
    console.error("Error saving restaurants:", error);
    res.status(500).json({ error: "Failed to save restaurants" });
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