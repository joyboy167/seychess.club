require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Baseline = require('../models/Baseline'); // Ensure this path is correct

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined. Please check your .env file.');
    }

    console.log('Connecting to MongoDB with URI:', mongoUri); // Debug: Check if URI is loaded
    await mongoose.connect(mongoUri); // Removed deprecated options
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Read and Migrate Baseline Data
const migrateData = async () => {
  try {
    const jsonFilePath = path.resolve(__dirname, '../../../player-comp-ratings.json');
    console.log('Resolved path to JSON file:', jsonFilePath); // Debug: Check file path

    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file not found at path: ${jsonFilePath}`);
    }

    const fileData = fs.readFileSync(jsonFilePath, 'utf-8');
    const baselines = JSON.parse(fileData);

    console.log('Baseline data to migrate:', baselines); // Debug: Display data to migrate

    // Clear existing data (optional)
    const deletedCount = await Baseline.deleteMany();
    console.log(`${deletedCount.deletedCount} existing baseline records cleared`);

    // Insert new baseline data
    const insertedBaselines = await Baseline.insertMany(baselines);
    console.log(`${insertedBaselines.length} baseline records migrated successfully`);
  } catch (err) {
    console.error('Error during migration:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the Migration
connectDB().then(migrateData).catch((err) => {
  console.error('Unexpected error:', err.message);
  mongoose.connection.close();
});
