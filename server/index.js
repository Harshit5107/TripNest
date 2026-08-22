const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const citiesRoutes = require('./routes/cities');
const activitiesRoutes = require('./routes/activities');
const tripsRoutes = require('./routes/trips');
const budgetRoutes = require('./routes/budget');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GlobeTrotter API server running smooth.' });
});

app.listen(PORT, () => {
  console.log(`🌍 GlobeTrotter Backend Server running on http://localhost:${PORT}`);
});
