const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorizeAdmin } = require('./auth');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload a photo for a restaurant
router.post('/restaurants/:id/photo', authenticate, authorizeAdmin, upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const photoPath = `/uploads/${req.file.filename}`; // Path to the uploaded photo

  try {
    
    await db.query('UPDATE restaurants SET photos = ? WHERE id = ?', [photoPath, id]);
    res.json({ message: 'Photo uploaded successfully', photo_src: photoPath });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});


// Fetch all restaurants
router.get('/restaurants', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [restaurants] = await db.query('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Add a new restaurant
router.post('/restaurants', authenticate, authorizeAdmin, async (req, res) => {
  const { name, address, city, lat, lng, rating } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO restaurants (name, address, city, lat, lng, rating) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, city, lat, lng, rating]
    );
    res.status(201).json({ id: result.insertId, name, address, city, lat, lng, rating });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ error: 'Failed to add restaurant' });
  }
});

// Update a restaurant
router.put('/restaurants/:id', authenticate, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, address, city, lat, lng, rating } = req.body;
    try {
      await db.query(
        'UPDATE restaurants SET name = ?, address = ?, city = ?, lat = ?, lng = ?, rating = ? WHERE id = ?',
        [name, address, city, lat, lng, rating, id]
      );
      res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      res.status(500).json({ error: 'Failed to update restaurant' });
    }
  });

// Delete a restaurant and comments
router.delete('/restaurants/:id', authenticate, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      
      await db.query('DELETE FROM comments WHERE place_id = ?', [id]);
  
      
      await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
  
      res.json({ message: 'Restaurant and associated comments deleted successfully' });
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      res.status(500).json({ error: 'Failed to delete restaurant' });
    }
  });
  
// Fetch all pending comments
router.get('/comments', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const [comments] = await db.query(
        `SELECT c.id, c.comment, c.created_at, c.status, u.username, r.name AS restaurant_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         JOIN restaurants r ON c.place_id = r.place_id
         WHERE c.status = "pending"
         ORDER BY c.created_at DESC`
      );
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Approve a comment
router.put('/comments/:id/approve', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE comments SET status = "approved" WHERE id = ?', [id]);
    res.json({ message: 'Comment approved successfully' });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

// Reject a comment
router.put('/comments/:id/reject', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE comments SET status = "rejected" WHERE id = ?', [id]);
    res.json({ message: 'Comment rejected successfully' });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({ error: 'Failed to reject comment' });
  }
});

// Delete a specific comment
router.delete('/comments/:id', authenticate, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM comments WHERE id = ?', [id]);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

module.exports = router;