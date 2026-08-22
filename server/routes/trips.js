const express = require('express');
const router = express.Router();
const db = require('../db/connection');

function generateSlug(title) {
  const cleanStr = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${cleanStr}-${Math.random().toString(36).substring(2, 8)}`;
}

// Get user trips
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [trips] = await db.query(
      `SELECT t.*, 
         (SELECT COUNT(*) FROM trip_stops ts WHERE ts.trip_id = t.id) as stop_count,
         (
           COALESCE((SELECT SUM(stay_cost + transport_cost) FROM trip_stops ts WHERE ts.trip_id = t.id), 0) +
           COALESCE((
             SELECT SUM(sa.cost) 
             FROM stop_activities sa 
             JOIN trip_stops ts ON sa.stop_id = ts.id 
             WHERE ts.trip_id = t.id
           ), 0)
         ) as calculated_cost
       FROM trips t
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json(trips);
  } catch (err) {
    console.error('Fetch user trips error:', err);
    res.status(500).json({ error: 'Failed to fetch user trips.' });
  }
});

// Get Public Sharable Trip by Slug
router.get('/share/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [trips] = await db.query(
      `SELECT t.*, u.name as creator_name, u.avatar as creator_avatar 
       FROM trips t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.share_slug = ?`,
      [slug]
    );

    if (trips.length === 0) {
      return res.status(404).json({ error: 'Shared itinerary not found.' });
    }

    const trip = trips[0];
    const fullTrip = await getFullTripDetails(trip.id);
    res.json({ ...trip, ...fullTrip });
  } catch (err) {
    console.error('Fetch shared trip error:', err);
    res.status(500).json({ error: 'Failed to load shared trip.' });
  }
});

// Get single trip details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fullTrip = await getFullTripDetails(id);
    if (!fullTrip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }
    res.json(fullTrip);
  } catch (err) {
    console.error('Fetch trip error:', err);
    res.status(500).json({ error: 'Failed to fetch trip details.' });
  }
});

// Helper function to assemble full trip tree
async function getFullTripDetails(tripId) {
  const [trips] = await db.query('SELECT t.*, u.name as author_name FROM trips t JOIN users u ON t.user_id = u.id WHERE t.id = ?', [tripId]);
  if (trips.length === 0) return null;

  const trip = trips[0];

  // Fetch stops
  const [stops] = await db.query(
    `SELECT ts.*, c.name as city_name, c.country, c.image_url as city_image, c.cost_index, c.latitude, c.longitude
     FROM trip_stops ts
     JOIN cities c ON ts.city_id = c.id
     WHERE ts.trip_id = ?
     ORDER BY ts.stop_order ASC`,
    [tripId]
  );

  // For each stop, fetch assigned activities
  for (const stop of stops) {
    const [activities] = await db.query(
      `SELECT sa.*, a.title, a.category, a.duration_hours, a.image_url, a.rating, a.description as activity_desc
       FROM stop_activities sa
       JOIN activities a ON sa.activity_id = a.id
       WHERE sa.stop_id = ?
       ORDER BY sa.scheduled_day ASC, sa.scheduled_time ASC`,
      [stop.id]
    );
    stop.activities = activities;
  }

  trip.stops = stops;
  return trip;
}

// Create new trip
router.post('/', async (req, res) => {
  try {
    const { user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, selected_city_ids } = req.body;
    if (!user_id || !title || !start_date || !end_date) {
      return res.status(400).json({ error: 'User ID, title, start date, and end date are required.' });
    }

    const slug = generateSlug(title);
    const cover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

    const [result] = await db.query(
      `INSERT INTO trips (user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, share_slug, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [user_id, title, description || '', start_date, end_date, target_budget || 1500.00, cover, visibility || 'public', slug]
    );

    const tripId = result.insertId;

    // If initial cities were selected, add them as stops
    if (Array.isArray(selected_city_ids) && selected_city_ids.length > 0) {
      for (let i = 0; i < selected_city_ids.length; i++) {
        const cityId = selected_city_ids[i];
        await db.query(
          `INSERT INTO trip_stops (trip_id, city_id, stop_order, stay_cost, transport_cost)
           VALUES (?, ?, ?, 200.00, 100.00)`,
          [tripId, cityId, i + 1]
        );
      }
    }

    const createdTrip = await getFullTripDetails(tripId);
    res.json(createdTrip);
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Failed to create trip.' });
  }
});

// Update trip metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, target_budget, cover_image, visibility, status } = req.body;

    await db.query(
      `UPDATE trips SET title = ?, description = ?, start_date = ?, end_date = ?, target_budget = ?, cover_image = ?, visibility = ?, status = ?
       WHERE id = ?`,
      [title, description, start_date, end_date, target_budget, cover_image, visibility, status, id]
    );

    const updated = await getFullTripDetails(id);
    res.json(updated);
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Failed to update trip.' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM trips WHERE id = ?', [id]);
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// Copy / Clone Trip ("Copy Trip" button)
router.post('/copy', async (req, res) => {
  try {
    const { userId, tripId } = req.body;
    if (!userId || !tripId) return res.status(400).json({ error: 'User ID and Trip ID required' });

    const original = await getFullTripDetails(tripId);
    if (!original) return res.status(404).json({ error: 'Original trip not found' });

    const newSlug = generateSlug(`Copy of ${original.title}`);

    // Insert new trip
    const [result] = await db.query(
      `INSERT INTO trips (user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, share_slug, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'private', ?, 'upcoming')`,
      [userId, `Copy of ${original.title}`, original.description, original.start_date, original.end_date, original.target_budget, original.cover_image, newSlug]
    );

    const newTripId = result.insertId;

    // Copy stops & activities
    for (const stop of original.stops) {
      const [stopRes] = await db.query(
        `INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, stay_cost, transport_cost, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newTripId, stop.city_id, stop.stop_order, stop.arrival_date, stop.departure_date, stop.stay_cost, stop.transport_cost, stop.notes]
      );
      const newStopId = stopRes.insertId;

      for (const act of stop.activities) {
        await db.query(
          `INSERT INTO stop_activities (stop_id, activity_id, scheduled_day, scheduled_time, cost, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newStopId, act.activity_id, act.scheduled_day, act.scheduled_time, act.cost, act.notes]
        );
      }
    }

    const copiedTrip = await getFullTripDetails(newTripId);
    res.json(copiedTrip);
  } catch (err) {
    console.error('Copy trip error:', err);
    res.status(500).json({ error: 'Failed to copy trip.' });
  }
});

// --- STOPS ENDPOINTS ---

// Add city stop to trip
router.post('/:tripId/stops', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { city_id, arrival_date, departure_date, stay_cost, transport_cost, notes } = req.body;

    const [existingStops] = await db.query('SELECT MAX(stop_order) as max_order FROM trip_stops WHERE trip_id = ?', [tripId]);
    const nextOrder = (existingStops[0].max_order || 0) + 1;

    await db.query(
      `INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, stay_cost, transport_cost, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, city_id, nextOrder, arrival_date || null, departure_date || null, stay_cost || 150.00, transport_cost || 80.00, notes || '']
    );

    const updated = await getFullTripDetails(tripId);
    res.json(updated);
  } catch (err) {
    console.error('Add stop error:', err);
    res.status(500).json({ error: 'Failed to add stop to trip.' });
  }
});

// Update stop (costs, notes, dates)
router.put('/stops/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const { stay_cost, transport_cost, arrival_date, departure_date, notes } = req.body;

    await db.query(
      `UPDATE trip_stops SET stay_cost = ?, transport_cost = ?, arrival_date = ?, departure_date = ?, notes = ?
       WHERE id = ?`,
      [stay_cost, transport_cost, arrival_date, departure_date, notes, stopId]
    );

    const [stopRow] = await db.query('SELECT trip_id FROM trip_stops WHERE id = ?', [stopId]);
    const updatedTrip = await getFullTripDetails(stopRow[0].trip_id);
    res.json(updatedTrip);
  } catch (err) {
    console.error('Update stop error:', err);
    res.status(500).json({ error: 'Failed to update stop.' });
  }
});

// Reorder stops
router.post('/:tripId/reorder-stops', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stop_ids } = req.body; // Array of stop IDs in new order

    if (Array.isArray(stop_ids)) {
      for (let i = 0; i < stop_ids.length; i++) {
        await db.query('UPDATE trip_stops SET stop_order = ? WHERE id = ? AND trip_id = ?', [i + 1, stop_ids[i], tripId]);
      }
    }

    const updatedTrip = await getFullTripDetails(tripId);
    res.json(updatedTrip);
  } catch (err) {
    console.error('Reorder stops error:', err);
    res.status(500).json({ error: 'Failed to reorder stops.' });
  }
});

// Delete stop
router.delete('/stops/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const [stopRow] = await db.query('SELECT trip_id FROM trip_stops WHERE id = ?', [stopId]);
    if (stopRow.length === 0) return res.status(404).json({ error: 'Stop not found' });

    const tripId = stopRow[0].trip_id;
    await db.query('DELETE FROM trip_stops WHERE id = ?', [stopId]);

    const updatedTrip = await getFullTripDetails(tripId);
    res.json(updatedTrip);
  } catch (err) {
    console.error('Delete stop error:', err);
    res.status(500).json({ error: 'Failed to delete stop.' });
  }
});

// --- ACTIVITIES ASSIGNMENT ENDPOINTS ---

// Attach activity to stop
router.post('/stops/:stopId/activities', async (req, res) => {
  try {
    const { stopId } = req.params;
    const { activity_id, scheduled_day, scheduled_time, cost, notes } = req.body;

    const [actRow] = await db.query('SELECT cost FROM activities WHERE id = ?', [activity_id]);
    const defaultCost = actRow.length > 0 ? actRow[0].cost : 0.00;

    await db.query(
      `INSERT INTO stop_activities (stop_id, activity_id, scheduled_day, scheduled_time, cost, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [stopId, activity_id, scheduled_day || 1, scheduled_time || '10:00 AM', cost !== undefined ? cost : defaultCost, notes || '']
    );

    const [stopRow] = await db.query('SELECT trip_id FROM trip_stops WHERE id = ?', [stopId]);
    const updatedTrip = await getFullTripDetails(stopRow[0].trip_id);
    res.json(updatedTrip);
  } catch (err) {
    console.error('Attach activity error:', err);
    res.status(500).json({ error: 'Failed to add activity to itinerary.' });
  }
});

// Delete assigned activity from stop
router.delete('/stop-activities/:saId', async (req, res) => {
  try {
    const { saId } = req.params;
    const [saRow] = await db.query('SELECT stop_id FROM stop_activities WHERE id = ?', [saId]);
    if (saRow.length === 0) return res.status(404).json({ error: 'Assigned activity not found' });

    const [stopRow] = await db.query('SELECT trip_id FROM trip_stops WHERE id = ?', [saRow[0].stop_id]);
    await db.query('DELETE FROM stop_activities WHERE id = ?', [saId]);

    const updatedTrip = await getFullTripDetails(stopRow[0].trip_id);
    res.json(updatedTrip);
  } catch (err) {
    console.error('Delete stop activity error:', err);
    res.status(500).json({ error: 'Failed to remove activity.' });
  }
});

module.exports = router;
