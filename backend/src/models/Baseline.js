const mongoose = require('mongoose');

// Define the schema for baseline ratings
const baselineSchema = new mongoose.Schema({
  rank: { type: Number, required: true, default: 0 }, // Player's rank in the leaderboard
  username: { type: String, required: true },         // Player's username
  rapid: { type: Number, default: 0 },                // Baseline rapid rating
  blitz: { type: Number, default: 0 },                // Baseline blitz rating
  bullet: { type: Number, default: 0 },               // Baseline bullet rating
  puzzle: { type: Number, default: 0 },               // Baseline puzzle rating
  avgRating: { type: Number, default: 0 },            // Average of baseline ratings
});

// Create the model
const Baseline = mongoose.model('Baseline', baselineSchema);

module.exports = Baseline;
