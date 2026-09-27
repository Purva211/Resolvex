const router = require('express').Router();
const { protect, allow } = require('../middleware/auth');
const c = require('../controllers/aiController');

router.post('/analyze-complaint', protect, allow('customer','agent','admin'), c.analyzeComplaint);

module.exports = router;
