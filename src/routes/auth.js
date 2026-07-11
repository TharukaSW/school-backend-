const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Register: open for the very first (bootstrap) user; afterwards admin-only.
// We call protect optionally by trying it but allowing anonymous bootstrap.
router.post('/register', async (req, res, next) => {
  const User = require('../models/User');
  const count = await User.countDocuments();
  if (count === 0) return ctrl.register(req, res, next); // bootstrap, no auth
  return protect(req, res, () => ctrl.register(req, res, next)); // must be logged in (admin check inside)
});

router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.me);

router.get('/users', protect, authorize('admin'), ctrl.listUsers);
router.patch('/users/:id', protect, authorize('admin'), ctrl.updateUser);

module.exports = router;
