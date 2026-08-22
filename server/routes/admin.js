const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get overall platform analytics stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ user_count }]] = await db.query('SELECT COUNT(*) as user_count FROM users');
    const [[{ trip_count }]] = await db.query('SELECT COUNT(*) as trip_count FROM trips');
    const [[{ city_count }]] = await db.query('SELECT COUNT(*) as city_count FROM cities');
    const [[{ public_trips }]] = await db.query("SELECT COUNT(*) as public_trips FROM trips WHERE visibility = 'public'");

    // Top visited cities in user trip stops
    const [topCities] = await db.query(
      `SELECT c.name, c.country, COUNT(ts.id) as trip_count
       FROM cities c
       LEFT JOIN trip_stops ts ON c.id = ts.city_id
       GROUP BY c.id
       ORDER BY trip_count DESC, c.popularity_rating DESC
       LIMIT 6`
    );

    // Trips created by month or category
    const [monthlyStats] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count
       FROM trips
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY created_at ASC
       LIMIT 6`
    );

    res.json({
      total_users: user_count,
      total_trips: trip_count,
      total_cities: city_count,
      public_trips,
      top_cities: topCities,
      monthly_stats: monthlyStats
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// User Management list
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.travel_style, u.created_at,
         (SELECT COUNT(*) FROM trips t WHERE t.user_id = u.id) as total_trips
       FROM users u
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// Update user role or delete user
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

module.exports = router;
