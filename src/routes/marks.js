const router = require('express').Router();
const ctrl = require('../controllers/markController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', ctrl.summary); // academic ranking across students
router.get('/report/:studentId', ctrl.studentReport); // computed report card
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
