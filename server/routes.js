const express = require('express');
const { createServer } = require('http');
const { setupAuth } = require('./auth');
const prayerTimesService = require('./services/prayerTimes');
const islamicCalendarService = require('./services/islamicCalendar');
const audioContentService = require('./services/audioContent');
const { storage } = require('./storage');

function registerRoutes(app) {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Prayer Times API Routes
  app.get('/api/prayer-times', async (req, res) => {
    try {
      const { date, latitude, longitude, method } = req.query;
      
      const prayerDate = date ? new Date(date) : new Date();
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
      }
      
      const prayerTimes = await prayerTimesService.getPrayerTimes(
        prayerDate,
        lat,
        lng,
        method
      );
      
      res.json(prayerTimes);
    } catch (error) {
      console.error('Prayer times error:', error);
      res.status(500).json({ error: 'Failed to fetch prayer times' });
    }
  });

  app.get('/api/prayer-times/city', async (req, res) => {
    try {
      const { date, city, country, method } = req.query;
      
      if (!city || !country) {
        return res.status(400).json({ error: 'City and country are required' });
      }
      
      const prayerDate = date ? new Date(date) : new Date();
      
      const prayerTimes = await prayerTimesService.getPrayerTimesByCity(
        prayerDate,
        city,
        country,
        method
      );
      
      res.json(prayerTimes);
    } catch (error) {
      console.error('Prayer times by city error:', error);
      res.status(500).json({ error: 'Failed to fetch prayer times' });
    }
  });

  app.get('/api/prayer-times/monthly', async (req, res) => {
    try {
      const { year, month, latitude, longitude, method } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }
      
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
      }
      
      const monthlyPrayerTimes = await prayerTimesService.getMonthlyPrayerTimes(
        parseInt(year),
        parseInt(month),
        lat,
        lng,
        method
      );
      
      res.json(monthlyPrayerTimes);
    } catch (error) {
      console.error('Monthly prayer times error:', error);
      res.status(500).json({ error: 'Failed to fetch monthly prayer times' });
    }
  });

  // Islamic Calendar API Routes
  app.get('/api/hijri-date', async (req, res) => {
    try {
      const { date } = req.query;
      const gregorianDate = date ? new Date(date) : new Date();
      
      const hijriDate = await islamicCalendarService.convertToHijri(gregorianDate);
      res.json(hijriDate);
    } catch (error) {
      console.error('Hijri date error:', error);
      res.status(500).json({ error: 'Failed to convert to Hijri date' });
    }
  });

  app.get('/api/gregorian-date', async (req, res) => {
    try {
      const { year, month, day } = req.query;
      
      if (!year || !month || !day) {
        return res.status(400).json({ error: 'Year, month, and day are required' });
      }
      
      const gregorianDate = await islamicCalendarService.convertToGregorian(
        parseInt(year),
        parseInt(month),
        parseInt(day)
      );
      
      res.json(gregorianDate);
    } catch (error) {
      console.error('Gregorian date error:', error);
      res.status(500).json({ error: 'Failed to convert to Gregorian date' });
    }
  });

  app.get('/api/hijri-calendar', async (req, res) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }
      
      const hijriCalendar = await islamicCalendarService.getHijriCalendar(
        parseInt(year),
        parseInt(month)
      );
      
      res.json(hijriCalendar);
    } catch (error) {
      console.error('Hijri calendar error:', error);
      res.status(500).json({ error: 'Failed to fetch Hijri calendar' });
    }
  });

  app.get('/api/islamic-events', async (req, res) => {
    try {
      const { year } = req.query;
      
      if (!year) {
        const currentHijriDate = await islamicCalendarService.getCurrentHijriDate();
        const events = islamicCalendarService.getIslamicSpecialDays(currentHijriDate.hijri.year);
        return res.json(events);
      }
      
      const events = islamicCalendarService.getIslamicSpecialDays(parseInt(year));
      res.json(events);
    } catch (error) {
      console.error('Islamic events error:', error);
      res.status(500).json({ error: 'Failed to fetch Islamic events' });
    }
  });

  // Audio Content API Routes
  app.get('/api/audio', async (req, res) => {
    try {
      const audioContents = await audioContentService.getAllAudioContent();
      res.json(audioContents);
    } catch (error) {
      console.error('Audio content error:', error);
      res.status(500).json({ error: 'Failed to fetch audio content' });
    }
  });

  app.get('/api/audio/category/:category', async (req, res) => {
    try {
      const audioContents = await audioContentService.getAudioContentByCategory(req.params.category);
      res.json(audioContents);
    } catch (error) {
      console.error(`Audio content category ${req.params.category} error:`, error);
      res.status(500).json({ error: 'Failed to fetch audio content by category' });
    }
  });

  app.get('/api/audio/search', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = await audioContentService.searchAudioContent(query);
      res.json(results);
    } catch (error) {
      console.error('Audio search error:', error);
      res.status(500).json({ error: 'Failed to search audio content' });
    }
  });

  app.get('/api/audio/:id', async (req, res) => {
    try {
      const audioContent = await audioContentService.getAudioContentById(req.params.id);
      res.json(audioContent);
    } catch (error) {
      console.error(`Audio content ID ${req.params.id} error:`, error);
      res.status(error.message === 'Audio content not found' ? 404 : 500)
        .json({ error: error.message });
    }
  });

  app.get('/api/audio-categories', async (req, res) => {
    try {
      const categories = await audioContentService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Audio categories error:', error);
      res.status(500).json({ error: 'Failed to fetch audio categories' });
    }
  });

  // Islamic events from storage (static data)
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getIslamicEvents();
      res.json(events);
    } catch (error) {
      console.error('Events error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.get('/api/events/month/:month', async (req, res) => {
    try {
      const events = await storage.getIslamicEventsByMonth(parseInt(req.params.month));
      res.json(events);
    } catch (error) {
      console.error(`Events month ${req.params.month} error:`, error);
      res.status(500).json({ error: 'Failed to fetch events by month' });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getIslamicEventById(parseInt(req.params.id));
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error(`Event ID ${req.params.id} error:`, error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

module.exports = {
  registerRoutes
};
