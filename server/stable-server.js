const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const createMemoryStore = require('memorystore');
const { storage } = require('./storage');

const app = express();
const PORT = process.env.PORT || 8000;
const MemoryStore = createMemoryStore(session);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'islamic-community-app-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      // In a real app, we would validate the password
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Auth routes
app.post('/api/register', async (req, res, next) => {
  try {
    const { username, password, email, name } = req.body;
    
    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await storage.createUser({
      username,
      password,
      email,
      name
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.status(200).json(user);
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Audio API routes
app.get('/api/audio', async (req, res) => {
  try {
    const audioContents = await storage.getAudioContents();
    res.json(audioContents);
  } catch (error) {
    console.error('Audio content error:', error);
    res.status(500).json({ error: 'Failed to fetch audio content' });
  }
});

// Note the order of routes: more specific routes first
app.get('/api/audio/category/:category', async (req, res) => {
  try {
    const audioContents = await storage.getAudioContentsByCategory(req.params.category);
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
    
    const results = await storage.searchAudioContent(query);
    res.json(results);
  } catch (error) {
    console.error('Audio search error:', error);
    res.status(500).json({ error: 'Failed to search audio content' });
  }
});

app.get('/api/audio/:id', async (req, res) => {
  try {
    const audioContent = await storage.getAudioContentById(parseInt(req.params.id));
    
    if (!audioContent) {
      return res.status(404).json({ error: 'Audio content not found' });
    }
    
    res.json(audioContent);
  } catch (error) {
    console.error(`Audio content ID ${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to fetch audio content' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// For any request that doesn't match the above, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stable server is running on http://0.0.0.0:${PORT}`);
});