const router = require('express').Router();
const Event = require('../models/Event');
const crudFactory = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

// Sort by date, then criticality is handled client-side; searchable by title.
const ctrl = crudFactory(Event, { populate: ['organizer'], sort: 'date', searchFields: ['title', 'location'] });

router.use(protect);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
