const Student = require('../models/Student');
const Mark = require('../models/Mark');
const BehaviorColor = require('../models/BehaviorColor');
const asyncHandler = require('../utils/asyncHandler');
const crudFactory = require('../utils/crudFactory');
const { academicBand } = require('../utils/colorBand');

const base = crudFactory(Student, {
  populate: ['teacher'],
  sort: 'firstName',
  searchFields: ['firstName', 'lastName', 'admissionNumber'],
});

exports.list = base.list;
exports.create = base.create;
exports.update = base.update;
exports.remove = base.remove;

// GET /api/students/:id — full profile with computed academic band + recent behaviour colours
exports.getOne = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('teacher');
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const marks = await Mark.find({ student: student._id }).populate('subject', 'name code maxScore');
  const avg = averagePercentage(marks);
  const band = academicBand(avg);
  const behavior = await BehaviorColor.find({ student: student._id })
    .sort('-date')
    .limit(10)
    .populate('awardedBy', 'name');

  res.json({ ...student.toObject(), averagePercentage: avg, academicBand: band, recentBehavior: behavior });
});

// --- Medical records sub-resource ---

// POST /api/students/:id/medical-records
exports.addMedicalRecord = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  student.medical.records.push(req.body);
  await student.save();
  res.status(201).json(student.medical.records[student.medical.records.length - 1]);
});

// DELETE /api/students/:id/medical-records/:recordId
exports.deleteMedicalRecord = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const record = student.medical.records.id(req.params.recordId);
  if (!record) return res.status(404).json({ message: 'Medical record not found' });
  record.deleteOne();
  await student.save();
  res.json({ message: 'Medical record deleted', id: req.params.recordId });
});

// PUT /api/students/:id/medical — replace the standing medical profile (not the records log)
exports.updateMedicalProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { records, ...profile } = req.body; // don't overwrite the log here
  student.medical = { ...student.medical.toObject(), ...profile, records: student.medical.records };
  await student.save();
  res.json(student.medical);
});

function averagePercentage(marks) {
  if (!marks.length) return null;
  const total = marks.reduce((sum, m) => sum + (m.score / m.maxScore) * 100, 0);
  return Math.round((total / marks.length) * 100) / 100;
}

exports._averagePercentage = averagePercentage;
