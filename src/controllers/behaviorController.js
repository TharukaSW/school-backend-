const BehaviorColor = require('../models/BehaviorColor');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const { BEHAVIOR_COLORS } = require('../config/constants');

// Points used to turn a colour history into a rankable behaviour score.
const COLOR_POINTS = { Green: 2, Yellow: 0, Red: -1 };

// GET /api/behavior?student=
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  const entries = await BehaviorColor.find(filter)
    .populate('student', 'firstName lastName admissionNumber category')
    .populate('awardedBy', 'name')
    .sort('-date');
  res.json(entries);
});

// POST /api/behavior — award a colour
exports.create = asyncHandler(async (req, res) => {
  const entry = await BehaviorColor.create({ ...req.body, awardedBy: req.user?._id });
  res.status(201).json(await entry.populate('student', 'firstName lastName admissionNumber'));
});

// DELETE /api/behavior/:id
exports.remove = asyncHandler(async (req, res) => {
  const entry = await BehaviorColor.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  res.json({ message: 'Behaviour entry deleted', id: req.params.id });
});

// GET /api/behavior/ranking — behaviour leaderboard across all active students
exports.ranking = asyncHandler(async (req, res) => {
  const entries = await BehaviorColor.find().populate(
    'student',
    'firstName lastName admissionNumber category status'
  );

  const map = new Map();
  entries.forEach((e) => {
    if (!e.student) return;
    const id = e.student._id.toString();
    if (!map.has(id)) {
      map.set(id, {
        student: {
          id: e.student._id,
          fullName: `${e.student.firstName} ${e.student.lastName}`,
          admissionNumber: e.student.admissionNumber,
          category: e.student.category,
        },
        counts: { Green: 0, Yellow: 0, Red: 0 },
        total: 0,
        score: 0,
      });
    }
    const row = map.get(id);
    if (row.counts[e.color] != null) row.counts[e.color] += 1;
    row.total += 1;
    row.score += COLOR_POINTS[e.color] ?? 0;
  });

  const result = [...map.values()].map((row) => {
    // Dominant colour = the student's current behaviour colour.
    const current = BEHAVIOR_COLORS.reduce((a, b) => (row.counts[b] > row.counts[a] ? b : a), 'Yellow');
    return { ...row, currentColor: current };
  });

  result.sort((a, b) => b.score - a.score || b.counts.Green - a.counts.Green);
  result.forEach((row, i) => (row.rank = i + 1));
  res.json(result);
});
