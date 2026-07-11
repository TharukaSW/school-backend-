const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Sport name is required'], trim: true },
    description: { type: String, trim: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    schedule: { type: String, trim: true },
    location: { type: String, trim: true },
    // Whether this activity is adapted for accessibility.
    adaptive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sport', sportSchema);
