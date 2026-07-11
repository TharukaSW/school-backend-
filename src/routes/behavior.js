const router = require('express').Router();
const ctrl = require('../controllers/behaviorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/ranking', ctrl.ranking); // behaviour leaderboard
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
