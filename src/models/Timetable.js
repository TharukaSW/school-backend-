const mongoose = require('mongoose');
const { CATEGORIES, DAYS } = require('../config/constants');

// One lesson slot in a category's weekly timetable.
const timetableSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    day: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "09:45"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    // Free-text label for non-subject slots (e.g. "Break", "Therapy", "Sports").
    activity: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

timetableSchema.index({ category: 1, day: 1, startTime: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
