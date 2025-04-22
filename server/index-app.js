const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// API routes for Islamic app features
const prayerTimesRoutes = require('./routes/prayerTimes');
const quranRoutes = require('./routes/quran');
const calendarRoutes = require('./routes/calendar');
const audioRoutes = require('./routes/audio');
const userRoutes = require('./routes/user');

// Register API routes
app.use('/api/prayer-times', prayerTimesRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/user', userRoutes);

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Islamic Community App server running on http://0.0.0.0:${PORT}`);
});