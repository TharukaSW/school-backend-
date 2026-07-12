const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Subject name is required'], trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    maxScore: { type: Number, default: 100, min: 1 },
    level: { type: String, enum: ['Primary', 'Secondary'], required: true, default: 'Primary' },
    // Categories this subject applies to (empty = all categories).
    categories: [{ type: String, enum: CATEGORIES }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
