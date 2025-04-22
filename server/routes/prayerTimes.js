const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get prayer times by coordinates
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, date, method } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const calculationMethod = method || 'MWL';
    
    const response = await axios.get(`https://api.aladhan.com/v1/timings/${formattedDate}`, {
      params: {
        latitude,
        longitude,
        method: calculationMethod
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    res.status(500).json({ error: 'Failed to fetch prayer times' });
  }
});

// Get prayer times by city name
router.get('/city', async (req, res) => {
  try {
    const { city, country, date, method } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const calculationMethod = method || 'MWL';
    
    const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${formattedDate}`, {
      params: {
        city,
        country: country || '',
        method: calculationMethod
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prayer times by city:', error);
    res.status(500).json({ error: 'Failed to fetch prayer times' });
  }
});

// Get monthly prayer times calendar
router.get('/monthly', async (req, res) => {
  try {
    const { latitude, longitude, year, month, method } = req.query;
    
    if (!latitude || !longitude || !year || !month) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, year, and month are required' 
      });
    }
    
    const calculationMethod = method || 'MWL';
    
    const response = await axios.get(`https://api.aladhan.com/v1/calendar/${year}/${month}`, {
      params: {
        latitude,
        longitude,
        method: calculationMethod
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching monthly prayer times:', error);
    res.status(500).json({ error: 'Failed to fetch monthly prayer times' });
  }
});

module.exports = router;