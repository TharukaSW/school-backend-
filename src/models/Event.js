const mongoose = require('mongoose');
const { EVENT_PRIORITIES } = require('../config/constants');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: [true, 'Event date is required'] },
    endDate: { type: Date },
    location: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Academic', 'Sports', 'Cultural', 'Therapy', 'Meeting', 'Holiday', 'Other'],
      default: 'Other',
    },
    priority: { type: String, enum: EVENT_PRIORITIES, default: 'Medium' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
