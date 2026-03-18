const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/travelController');

router.get('/routes', ctrl.getRoutes);
router.post('/routes', ctrl.addRoute);
router.post('/reviews', ctrl.addReview);

module.exports = router;