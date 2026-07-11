const router = require('express').Router();
const Teacher = require('../models/Teacher');
const crudFactory = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

const ctrl = crudFactory(Teacher, {
  populate: ['subjects'],
  sort: 'firstName',
  searchFields: ['firstName', 'lastName', 'email', 'employeeId'],
});

router.use(protect);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
