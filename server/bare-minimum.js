const express = require('express');

const app = express();
const PORT = 8000;

// Basic API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bare minimum server is running on http://0.0.0.0:${PORT}`);
});