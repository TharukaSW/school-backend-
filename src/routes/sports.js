const router = require('express').Router();
const Sport = require('../models/Sport');
const crudFactory = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

const ctrl = crudFactory(Sport, { populate: ['coach'], sort: 'name', searchFields: ['name'] });

router.use(protect);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
