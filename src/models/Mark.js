const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    term: { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
    level: {
      type: String,
      enum: ['Primary', 'Secondary'],
      default: 'Primary',
    },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1, default: 100 },
    date: { type: Date, default: Date.now },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

markSchema.virtual('percentage').get(function () {
  return this.maxScore ? Math.round((this.score / this.maxScore) * 10000) / 100 : 0;
});
markSchema.set('toJSON', { virtuals: true });
markSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Mark', markSchema);
