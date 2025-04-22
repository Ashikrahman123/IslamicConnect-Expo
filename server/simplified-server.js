const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { createServer } = require('http');
const createMemoryStore = require('memorystore');

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
  secret: 'islamic-community-app-secret',
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

// Simplified user storage
const users = [
  { id: 1, username: 'admin', password: 'password', name: 'Administrator' }
];

// Basic authentication
passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user || user.password !== password) {
      return done(null, false, { message: 'Invalid username or password' });
    }
    return done(null, user);
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Simple routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Basic authentication routes
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
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

// Create server instance
const httpServer = createServer(app);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Simplified server is running on http://0.0.0.0:${PORT}`);
});

// Handle server errors
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});