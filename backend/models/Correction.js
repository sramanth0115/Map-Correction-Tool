const mongoose = require('mongoose');

const CorrectionSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
  },
  errorType: {
    type: String,
    enum: ['wrong_road_name', 'wrong_location', 'missing_road', 'wrong_coordinates', 'wrong_business_name', 'other'],
    required: true,
  },
  oldValue: {
    type: String,
    default: '',
  },
  newValue: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  correctedLat: {
    type: Number,
  },
  correctedLng: {
    type: Number,
  },
  analystName: {
    type: String,
    default: 'Analyst',
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'corrected', 'flagged', 'verified'],
    default: 'corrected',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Correction', CorrectionSchema);
