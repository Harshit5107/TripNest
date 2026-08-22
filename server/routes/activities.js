const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Search & filter activities
router.get('/', async (req, res) => {
  try {
    const { city_id, category, search, max_cost, max_duration } = req.query;

    let query = `
      SELECT a.*, c.name as city_name, c.country 
      FROM activities a 
      JOIN cities c ON a.city_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (city_id) {
      query += ` AND a.city_id = ?`;
      params.push(city_id);
    }

    if (category && category !== 'All') {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (max_cost) {
      query += ` AND a.cost <= ?`;
      params.push(parseFloat(max_cost));
    }

    if (max_duration) {
      query += ` AND a.duration_hours <= ?`;
      params.push(parseFloat(max_duration));
    }

    query += ` ORDER BY a.rating DESC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fetch activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

// Add custom activity
router.post('/', async (req, res) => {
  try {
    const { city_id, title, category, cost, duration_hours, description, image_url } = req.body;
    if (!city_id || !title || !category) {
      return res.status(400).json({ error: 'City, title, and category are required.' });
    }

    const defaultImg = image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';

    const [result] = await db.query(
      `INSERT INTO activities (city_id, title, category, cost, duration_hours, rating, image_url, description)
       VALUES (?, ?, ?, ?, ?, 5.0, ?, ?)`,
      [city_id, title, category, cost || 0.0, duration_hours || 2.0, defaultImg, description || 'Custom user added activity']
    );

    const [newAct] = await db.query('SELECT * FROM activities WHERE id = ?', [result.insertId]);
    res.json(newAct[0]);
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ error: 'Failed to create activity.' });
  }
});

module.exports = router;
