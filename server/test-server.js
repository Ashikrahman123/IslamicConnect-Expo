const express = require('express');
const cors = require('cors');
const { createServer } = require('http');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Create server instance
const httpServer = createServer(app);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on http://0.0.0.0:${PORT}`);
});

// Handle server errors
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});