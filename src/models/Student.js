const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

// A single dated medical entry (checkup, incident, therapy note, etc.)
const medicalRecordSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['Checkup', 'Incident', 'Therapy', 'Medication Change', 'Allergy', 'Other'],
      default: 'Checkup',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    recordedBy: { type: String, trim: true },
  },
  { _id: true, timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    // One of the school's three special-needs categories.
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    grade: { type: Number, min: 1, max: 11, required: [true, 'Grade is required'], default: 1 },
    residence: { type: String, enum: ['Hostel', 'Home'], required: [true, 'Residence is required'], default: 'Home' },
    photoUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Graduated', 'Inactive'], default: 'Active' },

    guardian: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    // Standing medical profile plus a log of dated records.
    medical: {
      bloodGroup: { type: String, trim: true },
      allergies: [{ type: String, trim: true }],
      conditions: [{ type: String, trim: true }],
      medications: [
        {
          name: { type: String, trim: true },
          dosage: { type: String, trim: true },
          schedule: { type: String, trim: true },
        },
      ],
      primaryDoctor: { type: String, trim: true },
      doctorPhone: { type: String, trim: true },
      emergencyContact: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        relation: { type: String, trim: true },
      },
      notes: { type: String, trim: true },
      records: [medicalRecordSchema],
    },
  },
  { timestamps: true }
);

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
