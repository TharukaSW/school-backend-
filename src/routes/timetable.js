const router = require('express').Router();
const Timetable = require('../models/Timetable');
const crudFactory = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

const ctrl = crudFactory(Timetable, {
  populate: ['subject', 'teacher'],
  sort: 'startTime',
});

router.use(protect);
router.get('/', ctrl.list); // supports ?category=Autism%20Spectrum
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
