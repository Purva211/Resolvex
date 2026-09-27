const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, allow } = require('../middleware/auth');
router.get('/agents', protect, allow('admin'), c.getAgents);
router.get('/', protect, allow('admin'), c.getUsers);
module.exports = router;
