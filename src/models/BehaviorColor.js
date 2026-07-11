const mongoose = require('mongoose');
const { BEHAVIOR_COLORS } = require('../config/constants');

// A single teacher-awarded behaviour/effort colour, logged over time.
const behaviorColorSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    color: { type: String, enum: BEHAVIOR_COLORS, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

behaviorColorSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('BehaviorColor', behaviorColorSchema);
