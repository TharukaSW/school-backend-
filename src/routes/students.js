const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create); // admin or teacher may enrol/manage students
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

// Medical
router.put('/:id/medical', ctrl.updateMedicalProfile);
router.post('/:id/medical-records', ctrl.addMedicalRecord);
router.delete('/:id/medical-records/:recordId', ctrl.deleteMedicalRecord);

module.exports = router;
