const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorizeAdmin } = require('./auth');
const axios = require('axios'); 

// Get city name from cord with Google Cloud API
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
    const [countResult] = await db.query(countQuery, queryParams.slice(0, 3));
    const total = countResult[0].total;

    res.json({ data: rows, total });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// GET restaurant details by place_id
router.get('/:place_id', async (req, res) => {
  const { place_id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
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

      
      let cleanAddress = address;
      if (address.includes(city)) {
        cleanAddress = address.replace(city, '').trim(); 
      }

      
      if (!cleanAddress || cleanAddress.trim() === '') {
        cleanAddress = "Unknown Address";
      }

      const [existing] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
      if (existing.length > 0) {
        results.push({ place_id, status: 'exists' });
        continue;
      }

      const [result] = await db.query(
        'INSERT INTO restaurants (place_id, name, lat, lng, address, city, rating, total_ratings, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [place_id, name, lat, lng, cleanAddress, city, rating, total_ratings, '/uploads/no-photo.jpg']
      );

      results.push({ id: result.insertId, place_id, status: 'saved' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error saving restaurants:', error);
    res.status(500).json({ error: 'Failed to save restaurants' });
  }
});

// GET all comments for a restaurant
router.get('/:place_id/comments', async (req, res) => {
  const { place_id } = req.params;

  try {
    const [comments] = await db.query(
      `SELECT c.id, c.comment, c.created_at, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.place_id = ? AND c.status = "approved" 
       ORDER BY c.created_at DESC`,
      [place_id]
    );

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a comment for a restaurant
router.post('/:place_id/comments', authenticate, async (req, res) => {
  const { place_id } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  if (comment.length > 250) {
    return res.status(400).json({ error: 'Comment exceeds the maximum length of 250 characters' });
  }

  try {
    // Check if the restaurant exists
    const [restaurant] = await db.query('SELECT * FROM restaurants WHERE place_id = ?', [place_id]);
    if (restaurant.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Insert the comment into the database
    const [result] = await db.query(
      'INSERT INTO comments (place_id, user_id, comment) VALUES (?, ?, ?)',
      [place_id, userId, comment, 'pending']
    );

    // Fetch the username of the user who posted the comment
    const [user] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);

    res.status(201).json({
      id: result.insertId,
      place_id,
      user_id: userId,
      username: user[0].username,
      comment,
      status: 'pending',
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
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

    // DELETE all restaurants
router.delete('/clear', async (req, res) => {
  try {
    await db.query('DELETE FROM restaurants');
    res.status(200).json({ message: 'All restaurants deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear restaurants' });
  }
});


module.exports = router;