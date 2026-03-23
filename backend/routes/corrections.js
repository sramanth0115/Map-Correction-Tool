const express = require('express');
const router = express.Router();
const Correction = require('../models/Correction');

// In-memory fallback storage when MongoDB is not connected
let inMemoryCorrections = [];
let idCounter = 1;

const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// GET all corrections
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const corrections = await Correction.find().sort({ timestamp: -1 });
      res.json(corrections);
    } else {
      console.log(inMemoryCorrections)
      res.json(inMemoryCorrections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new correction
router.post('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const correction = new Correction(req.body);
      const saved = await correction.save();
      res.status(201).json(saved);
    } else {
      console.log(inMemoryCorrections)
      const newCorrection = {
        _id: String(idCounter++),
        ...req.body,
        timestamp: new Date().toISOString(),
        status: req.body.status || 'corrected',
      };
      inMemoryCorrections.push(newCorrection);
      res.status(201).json(newCorrection);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a correction
router.put('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await Correction.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Correction not found' });
      res.json(updated);
    } else {
      console.log(inMemoryCorrections)
      const idx = inMemoryCorrections.findIndex(c => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Correction not found' });
      inMemoryCorrections[idx] = { ...inMemoryCorrections[idx], ...req.body };
      res.json(inMemoryCorrections[idx]);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a correction
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Correction.findByIdAndDelete(req.params.id);
    } else {
      console.log(inMemoryCorrections)
      inMemoryCorrections = inMemoryCorrections.filter(c => c._id !== req.params.id);
    }
    res.json({ message: 'Correction deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
