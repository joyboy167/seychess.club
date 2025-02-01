require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import your routes
const jsonRoutes = require('./routes/jsonRoutes'); // Adjust the path as necessary

const app = express();

// Enable CORS (so frontend can call this backend)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Connect the new routes
app.use('/api', jsonRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the SeyChess backend!');
});

module.exports = app;
