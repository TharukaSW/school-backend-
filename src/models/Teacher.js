const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    dob: { type: Date },
    address: { type: String, trim: true },
    qualification: { type: String, trim: true },
    // Special-needs area(s) this teacher specialises in.
    specializations: [{ type: String, enum: CATEGORIES }],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    joinDate: { type: Date, default: Date.now },
    photoUrl: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Teacher', teacherSchema);
