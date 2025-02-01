const express = require('express');
const Baseline = require('../models/Baseline'); // MongoDB model for baselines
const router = express.Router();

// GET route: Fetch all baseline data from MongoDB
router.get('/baselines', async (req, res) => {
  try {
    const baselines = await Baseline.find(); // Retrieve all records from the database
    res.json({
      success: true,
      data: baselines,
    });
  } catch (err) {
    console.error('Error fetching baselines:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch baseline data.',
    });
  }
});

// POST route: Update baseline data in MongoDB
router.post('/baselines', async (req, res) => {
  const updatedData = req.body;

  // Validate incoming data is an array
  if (!Array.isArray(updatedData)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format. Expected an array of baselines.',
    });
  }

  try {
    // Clear existing data (optional, depending on your use case)
    await Baseline.deleteMany();

    // Insert the new baseline data
    await Baseline.insertMany(updatedData);

    res.json({
      success: true,
      message: 'Baseline data updated successfully!',
    });
  } catch (err) {
    console.error('Error updating baseline data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update baseline data.',
    });
  }
});

module.exports = router;
