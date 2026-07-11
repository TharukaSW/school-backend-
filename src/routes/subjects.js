const router = require('express').Router();
const Subject = require('../models/Subject');
const crudFactory = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

const ctrl = crudFactory(Subject, { sort: 'name', searchFields: ['name', 'code'] });

router.use(protect);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
