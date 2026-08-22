const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// High Quality City Banner Image Provider based on City Name
const CITY_PHOTO_MAP = {
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  'reykjavik': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
  'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
  'cairo': 'https://images.unsplash.com/photo-1572252821143-035a744e82b7?auto=format&fit=crop&w=800&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
  'prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80',
  'vienna': 'https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc0?auto=format&fit=crop&w=800&q=80',
  'athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80',
  'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
  'lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  'istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
  'budapest': 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80',
  'copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80',
  'stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  'seoul': 'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=800&q=80',
  'venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
  'florence': 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80',
  'geneva': 'https://images.unsplash.com/photo-1573108037320-109ef3879c5b?auto=format&fit=crop&w=800&q=80',
  'zurich': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
  'toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1506966953377-3f925a26e07a?auto=format&fit=crop&w=800&q=80',
};

function getCityPhotoUrl(cityName) {
  const clean = cityName.toLowerCase().trim();
  if (CITY_PHOTO_MAP[clean]) return CITY_PHOTO_MAP[clean];
  // Dynamic high-res cityscape photo lookup
  return `https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80`;
}

// Get all cities with optional query filtering & dynamic city lookup/auto-creation
router.get('/', async (req, res) => {
  try {
    const { search, region, cost_index, userId, autoCreate } = req.query;

    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM activities a WHERE a.city_id = c.id) as activity_count
    `;

    if (userId) {
      query += `, (SELECT COUNT(*) FROM user_favorites uf WHERE uf.city_id = c.id AND uf.user_id = ${db.escape(userId)}) > 0 as is_favorite`;
    } else {
      query += `, FALSE as is_favorite`;
    }

    query += ` FROM cities c WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.country LIKE ? OR c.region LIKE ? OR c.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (region && region !== 'All') {
      query += ` AND c.region = ?`;
      params.push(region);
    }

    if (cost_index && cost_index !== 'All') {
      query += ` AND c.cost_index = ?`;
      params.push(cost_index);
    }

    query += ` ORDER BY c.popularity_rating DESC`;

    const [rows] = await db.query(query, params);

    // If search term provided, autoCreate flag is set, and no rows match -> Auto-create city with matching photo!
    if (rows.length === 0 && search && search.trim().length > 2 && autoCreate === 'true') {
      const newCityName = search.trim().charAt(0).toUpperCase() + search.trim().slice(1);
      const photoUrl = getCityPhotoUrl(newCityName);

      const [insertRes] = await db.query(
        `INSERT INTO cities (name, country, region, cost_index, avg_cost_per_day, popularity_rating, safety_index, image_url, description, latitude, longitude)
         VALUES (?, 'Global Destination', 'International', '$$', 115.00, 4.85, 90, ?, ?, 20.0000, 0.0000)`,
        [
          newCityName,
          photoUrl,
          `Explore the magnificent city of ${newCityName}, known for iconic architecture, vibrant dining, and unforgettable experiences.`
        ]
      );

      const cityId = insertRes.insertId;

      // Add default activities for auto-created city
      await db.query(
        `INSERT INTO activities (city_id, title, category, cost, duration_hours, rating, image_url, description)
         VALUES 
         (?, ?, 'Sightseeing', 35.00, 2.5, 4.9, ?, 'Explore top-rated landmarks and cultural sights in ${newCityName}.'),
         (?, ?, 'Food & Dining', 50.00, 2.0, 4.85, ?, 'Sample authentic street food and regional gourmet specialties in ${newCityName}.')`,
        [cityId, `${newCityName} City & Landmark Tour`, photoUrl, cityId, `${newCityName} Culinary & Tasting Walk`, photoUrl]
      );

      const [newRows] = await db.query(
        `SELECT c.*, 2 as activity_count, FALSE as is_favorite FROM cities c WHERE c.id = ?`,
        [cityId]
      );
      return res.json(newRows);
    }

    res.json(rows);
  } catch (err) {
    console.error('Fetch cities error:', err);
    res.status(500).json({ error: 'Failed to fetch cities.' });
  }
});

// Explicit endpoint to add ANY custom city by name with photo matching
router.post('/add-custom', async (req, res) => {
  try {
    const { name, country, region, cost_index, avg_cost_per_day, description, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'City name required' });

    const cName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    const cCountry = country || 'Global Destination';
    const cRegion = region || 'International';
    const cCost = cost_index || '$$';
    const cAvgCost = avg_cost_per_day || 120.00;
    const cImg = image_url || getCityPhotoUrl(cName);
    const cDesc = description || `Explore ${cName}, ${cCountry} - a premier travel destination with rich culture and scenic beauty.`;

    const [result] = await db.query(
      `INSERT INTO cities (name, country, region, cost_index, avg_cost_per_day, popularity_rating, safety_index, image_url, description, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, 4.85, 90, ?, ?, 20.0000, 0.0000)
       ON DUPLICATE KEY UPDATE country=VALUES(country), image_url=VALUES(image_url)`,
      [cName, cCountry, cRegion, cCost, cAvgCost, cImg, cDesc]
    );

    const cityId = result.insertId || (await db.query('SELECT id FROM cities WHERE name = ?', [cName]))[0][0].id;

    // Seed default activities if new
    const [existingActs] = await db.query('SELECT id FROM activities WHERE city_id = ?', [cityId]);
    if (existingActs.length === 0) {
      await db.query(
        `INSERT INTO activities (city_id, title, category, cost, duration_hours, rating, image_url, description)
         VALUES 
         (?, ?, 'Sightseeing', 35.00, 3.0, 4.9, ?, 'Guided walking tour of historic landmarks.'),
         (?, ?, 'Food & Dining', 50.00, 2.0, 4.85, ?, 'Taste regional specialties and market street food.')`,
        [cityId, `${cName} Historical City Tour`, cImg, cityId, `${cName} Local Gastronomy Walk`, cImg]
      );
    }

    const [city] = await db.query('SELECT * FROM cities WHERE id = ?', [cityId]);
    res.json(city[0]);
  } catch (err) {
    console.error('Add custom city error:', err);
    res.status(500).json({ error: 'Failed to add custom city.' });
  }
});

// Get single city by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [cities] = await db.query('SELECT * FROM cities WHERE id = ?', [id]);
    if (cities.length === 0) {
      return res.status(404).json({ error: 'City not found.' });
    }

    const city = cities[0];
    const [activities] = await db.query('SELECT * FROM activities WHERE city_id = ? ORDER BY rating DESC', [id]);
    city.activities = activities;

    res.json(city);
  } catch (err) {
    console.error('Fetch city error:', err);
    res.status(500).json({ error: 'Failed to fetch city details.' });
  }
});

// Toggle Favorite City
router.post('/favorite', async (req, res) => {
  try {
    const { userId, cityId } = req.body;
    if (!userId || !cityId) return res.status(400).json({ error: 'User ID and City ID required' });

    const [favs] = await db.query('SELECT id FROM user_favorites WHERE user_id = ? AND city_id = ?', [userId, cityId]);

    if (favs.length > 0) {
      await db.query('DELETE FROM user_favorites WHERE user_id = ? AND city_id = ?', [userId, cityId]);
      res.json({ is_favorite: false });
    } else {
      await db.query('INSERT INTO user_favorites (user_id, city_id) VALUES (?, ?)', [userId, cityId]);
      res.json({ is_favorite: true });
    }
  } catch (err) {
    console.error('Favorite error:', err);
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

// Get User Favorites
router.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT c.* FROM cities c 
       JOIN user_favorites uf ON c.id = uf.city_id 
       WHERE uf.user_id = ? ORDER BY uf.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('User favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorite cities.' });
  }
});

module.exports = router;
