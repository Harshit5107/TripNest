const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get Budget analytics for a trip
router.get('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    const [trips] = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (trips.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = trips[0];

    // Get stops
    const [stops] = await db.query('SELECT * FROM trip_stops WHERE trip_id = ?', [tripId]);

    let stayTotal = 0;
    let transportTotal = 0;

    stops.forEach(s => {
      stayTotal += parseFloat(s.stay_cost || 0);
      transportTotal += parseFloat(s.transport_cost || 0);
    });

    // Get activities cost
    const [activities] = await db.query(
      `SELECT sa.cost, a.category 
       FROM stop_activities sa 
       JOIN trip_stops ts ON sa.stop_id = ts.id 
       JOIN activities a ON sa.activity_id = a.id
       WHERE ts.trip_id = ?`,
      [tripId]
    );

    let activityTotal = 0;
    const categoryBreakdown = {
      Accommodation: stayTotal,
      Transport: transportTotal,
      Activities: 0,
      Meals: 0,
      Miscellaneous: 50.00 // base buffer
    };

    activities.forEach(act => {
      const cost = parseFloat(act.cost || 0);
      activityTotal += cost;
      if (act.category === 'Food & Dining') {
        categoryBreakdown.Meals += cost;
      } else {
        categoryBreakdown.Activities += cost;
      }
    });

    // Estimate daily meals if not covered by activities (e.g. $45/day)
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const dayDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    if (categoryBreakdown.Meals < dayDiff * 30) {
      categoryBreakdown.Meals += dayDiff * 35;
    }

    const grandTotal = categoryBreakdown.Accommodation + categoryBreakdown.Transport + categoryBreakdown.Activities + categoryBreakdown.Meals + categoryBreakdown.Miscellaneous;
    const isOverBudget = grandTotal > parseFloat(trip.target_budget);
    const overAmount = grandTotal - parseFloat(trip.target_budget);
    const avgPerDay = grandTotal / dayDiff;

    const chartData = Object.keys(categoryBreakdown).map(key => ({
      category: key,
      amount: parseFloat(categoryBreakdown[key].toFixed(2))
    }));

    res.json({
      trip_id: trip.id,
      target_budget: parseFloat(trip.target_budget),
      total_calculated_cost: parseFloat(grandTotal.toFixed(2)),
      is_over_budget: isOverBudget,
      over_amount: isOverBudget ? parseFloat(overAmount.toFixed(2)) : 0,
      days_count: dayDiff,
      avg_cost_per_day: parseFloat(avgPerDay.toFixed(2)),
      breakdown: chartData
    });
  } catch (err) {
    console.error('Budget error:', err);
    res.status(500).json({ error: 'Failed to calculate budget analytics.' });
  }
});

module.exports = router;
