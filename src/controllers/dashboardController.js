const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const { CATEGORIES } = require('../config/constants');

// GET /api/dashboard — high-level counts for the home screen
exports.overview = asyncHandler(async (req, res) => {
  const [studentCount, teacherCount, subjectCount] = await Promise.all([
    Student.countDocuments({ status: 'Active' }),
    Teacher.countDocuments({ status: 'Active' }),
    Subject.countDocuments(),
  ]);

  // Students per category.
  const byCategoryAgg = await Student.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    count: byCategoryAgg.find((x) => x._id === c)?.count || 0,
  }));

  // Upcoming events (next, sorted by date then priority).
  const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
    .sort('date')
    .limit(6)
    .populate('organizer', 'firstName lastName');

  res.json({
    counts: { students: studentCount, teachers: teacherCount, subjects: subjectCount },
    byCategory,
    upcomingEvents,
  });
});
