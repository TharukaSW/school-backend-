const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    teacher: user.teacher,
  };
}

// POST /api/auth/register
// Creates a user. The very first user is always an admin (bootstrap).
// After that, only an admin may create additional accounts.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const count = await User.countDocuments();

  let assignedRole = 'teacher';
  if (count === 0) {
    assignedRole = 'admin'; // bootstrap first admin
  } else {
    // Require an authenticated admin to create further users.
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only an admin can create new accounts' });
    }
    assignedRole = role === 'admin' ? 'admin' : 'teacher';
  }

  const user = await User.create({ name, email, password, role: assignedRole, teacher: req.body.teacher || null });
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.active) return res.status(403).json({ message: 'Account is disabled' });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// GET /api/auth/users  (admin) — list all accounts
exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate('teacher', 'firstName lastName employeeId').sort('name');
  res.json(users);
});

// PATCH /api/auth/users/:id  (admin) — toggle active / change role
exports.updateUser = asyncHandler(async (req, res) => {
  const { active, role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (typeof active === 'boolean') user.active = active;
  if (role && ['admin', 'teacher'].includes(role)) user.role = role;
  await user.save();
  res.json(publicUser(user));
});
