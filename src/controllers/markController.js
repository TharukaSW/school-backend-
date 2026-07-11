const Mark = require('../models/Mark');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const { academicBand } = require('../utils/colorBand');

// GET /api/marks?student=&subject=&term=
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  ['student', 'subject', 'term'].forEach((k) => {
    if (req.query[k]) filter[k] = req.query[k];
  });
  const marks = await Mark.find(filter)
    .populate('subject', 'name code maxScore')
    .populate('student', 'firstName lastName admissionNumber')
    .sort('-date');
  res.json(marks);
});

// POST /api/marks
exports.create = asyncHandler(async (req, res) => {
  const payload = { ...req.body, enteredBy: req.user?._id };
  const mark = await Mark.create(payload);
  res.status(201).json(await mark.populate('subject', 'name code maxScore'));
});

// PUT /api/marks/:id
exports.update = asyncHandler(async (req, res) => {
  const mark = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
    'subject',
    'name code maxScore'
  );
  if (!mark) return res.status(404).json({ message: 'Mark not found' });
  res.json(mark);
});

// DELETE /api/marks/:id
exports.remove = asyncHandler(async (req, res) => {
  const mark = await Mark.findByIdAndDelete(req.params.id);
  if (!mark) return res.status(404).json({ message: 'Mark not found' });
  res.json({ message: 'Mark deleted', id: req.params.id });
});

// GET /api/marks/report/:studentId — full computed report card for one student
exports.studentReport = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const marks = await Mark.find({ student: student._id }).populate('subject', 'name code maxScore');

  // Group by subject, compute per-subject average %.
  const bySubject = {};
  marks.forEach((m) => {
    const key = m.subject?._id?.toString() || 'unknown';
    if (!bySubject[key]) {
      bySubject[key] = { subject: m.subject, entries: [], totalPct: 0 };
    }
    bySubject[key].entries.push(m);
    bySubject[key].totalPct += (m.score / m.maxScore) * 100;
  });

  const subjects = Object.values(bySubject).map((g) => {
    const average = Math.round((g.totalPct / g.entries.length) * 100) / 100;
    return {
      subject: g.subject,
      count: g.entries.length,
      average,
      band: academicBand(average),
      entries: g.entries,
    };
  });

  const overall = subjects.length
    ? Math.round((subjects.reduce((s, x) => s + x.average, 0) / subjects.length) * 100) / 100
    : null;

  res.json({
    student: {
      id: student._id,
      fullName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      category: student.category,
    },
    subjects,
    overallAverage: overall,
    academicBand: academicBand(overall),
  });
});

// GET /api/marks/summary — every student's overall average + academic band (for ranking)
exports.summary = asyncHandler(async (req, res) => {
  const rows = await Mark.aggregate([
    {
      $group: {
        _id: '$student',
        average: { $avg: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] } },
        entries: { $sum: 1 },
      },
    },
  ]);

  const students = await Student.find({ status: 'Active' }).select('firstName lastName admissionNumber category');
  const map = new Map(rows.map((r) => [r._id.toString(), r]));

  const result = students.map((s) => {
    const r = map.get(s._id.toString());
    const average = r ? Math.round(r.average * 100) / 100 : null;
    return {
      student: {
        id: s._id,
        fullName: `${s.firstName} ${s.lastName}`,
        admissionNumber: s.admissionNumber,
        category: s.category,
      },
      average,
      entries: r ? r.entries : 0,
      band: academicBand(average),
    };
  });

  result.sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
  result.forEach((row, i) => (row.rank = row.average == null ? null : i + 1));
  res.json(result);
});
