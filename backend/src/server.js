// Load environment variables based on NODE_ENV
const path = require('path');
const dotenv = require('dotenv');

// Determine the environment file path
let envFilePath;
if (process.env.NODE_ENV === 'development') {
  console.log('NODE_ENV set to development. Loading ../.env.development');
  envFilePath = path.resolve(__dirname, '../.env.development'); // Adjust path relative to src/
} else if (process.env.NODE_ENV === 'production') {
  console.log('NODE_ENV set to production. Loading ../.env.production');
  envFilePath = path.resolve(__dirname, '../.env.production'); // Adjust path relative to src/
} else {
  console.log('NODE_ENV not set. Loading default ../.env');
  envFilePath = path.resolve(__dirname, '../.env'); // Default .env file in backend root
}

// Load environment variables
dotenv.config({ path: envFilePath });

// Log important environment variables for debugging (sanitized)
console.log('Environment Variables Loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'Not Set',
  PORT: process.env.PORT || 'Not Set',
  MONGO_URI: process.env.MONGO_URI ? '***' : 'undefined', // Hide sensitive data
});

const app = require('./app');
const connectDB = require('./config/db');

// 1) Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
connectDB()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process if connection fails
  });

// 2) Start the server with dynamic port handling
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SeyChess backend running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Visit http://localhost:${PORT} for development`);
  }
});
