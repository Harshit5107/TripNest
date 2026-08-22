const express = require('express');
const router = express.Router();
const db = require('../db/connection');

function generateSlug(title) {
  const cleanStr = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${cleanStr}-ai-${Math.random().toString(36).substring(2, 6)}`;
}

// AI Trip Generator Endpoint
router.post('/generate-trip', async (req, res) => {
  try {
    let { userId, vibe, duration_days = 7, target_budget = 1800, custom_prompt } = req.body;
    
    // Auto fallback user if not logged in
    if (!userId) {
      const [u] = await db.query('SELECT id FROM users LIMIT 1');
      userId = u.length > 0 ? u[0].id : 1;
    }

    // 1. Pick cities based on vibe
    let regionFilter = '';
    let costFilter = '';
    if (vibe === 'Budget Backpacker') costFilter = "AND cost_index IN ('$', '$$')";
    if (vibe === 'Luxury') costFilter = "AND cost_index IN ('$$$', '$$$$')";
    if (vibe === 'Romantic') regionFilter = "AND region IN ('Europe', 'Asia')";

    const [availableCities] = await db.query(
      `SELECT * FROM cities WHERE 1=1 ${costFilter} ${regionFilter} ORDER BY popularity_rating DESC LIMIT 6`
    );

    const selectedCities = availableCities.slice(0, Math.min(3, availableCities.length));
    if (selectedCities.length === 0) {
      const [fallback] = await db.query('SELECT * FROM cities LIMIT 3');
      selectedCities.push(...fallback);
    }

    const title = custom_prompt ? `AI Curated: ${custom_prompt.slice(0, 45)}` : `AI ${vibe || 'Personalized'} Escape: ${selectedCities.map(c => c.name).join(' & ')}`;
    const slug = generateSlug(title);
    const coverImage = selectedCities[0]?.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration_days));

    const sStr = startDate.toISOString().split('T')[0];
    const eStr = endDate.toISOString().split('T')[0];

    // Insert Trip into MySQL
    const [tripRes] = await db.query(
      `INSERT INTO trips (user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, share_slug, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'public', ?, 'upcoming')`,
      [
        userId,
        title,
        `AI-Generated itinerary tailored for ${vibe || 'custom preferences'}. Includes optimized city routes, curated local experiences, and automatic budget monitoring.`,
        sStr,
        eStr,
        parseFloat(target_budget),
        coverImage,
        slug
      ]
    );

    const tripId = tripRes.insertId;

    // Attach Stops & Activities into MySQL
    for (let i = 0; i < selectedCities.length; i++) {
      const city = selectedCities[i];
      const [stopRes] = await db.query(
        `INSERT INTO trip_stops (trip_id, city_id, stop_order, stay_cost, transport_cost, notes)
         VALUES (?, ?, ?, 180.00, 95.00, ?)`,
        [tripId, city.id, i + 1, `AI Recommended Stop #${i + 1} in ${city.name}`]
      );
      const stopId = stopRes.insertId;

      // Attach 2 top activities for this city
      const [cityActs] = await db.query('SELECT id, cost FROM activities WHERE city_id = ? LIMIT 2', [city.id]);
      for (let aIdx = 0; aIdx < cityActs.length; aIdx++) {
        await db.query(
          `INSERT INTO stop_activities (stop_id, activity_id, scheduled_day, scheduled_time, cost)
           VALUES (?, ?, ?, ?, ?)`,
          [stopId, cityActs[aIdx].id, (i * 2) + aIdx + 1, aIdx === 0 ? '10:00 AM' : '03:30 PM', cityActs[aIdx].cost]
        );
      }
    }

    res.json({ trip_id: tripId, title, message: 'AI Trip generated successfully!' });
  } catch (err) {
    console.error('AI Generate Trip error:', err);
    res.status(500).json({ error: 'Failed to generate AI trip.' });
  }
});

module.exports = router;
