// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // so we can read .env variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
