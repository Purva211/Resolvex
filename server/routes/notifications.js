const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/notificationController');
router.use(protect);
router.get('/', c.list);
router.patch('/read-all', c.readAll);
router.patch('/:id/read', c.read);
module.exports = router;
