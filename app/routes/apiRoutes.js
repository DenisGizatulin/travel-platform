const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/travelController');

router.get('/routes', ctrl.getRoutes);
router.post('/routes', ctrl.createRoute);
router.get('/categories', ctrl.getCategories);

router.get('/preferences', ctrl.getPrefs);
router.put('/preferences', ctrl.updatePrefs);
router.get('/recommendations', ctrl.getRecommendations);

router.get('/collections', ctrl.getCollections);
router.post('/collections', ctrl.createCollection);
router.post('/collections/add', ctrl.addToCollection);
router.get('/collections/:id', ctrl.getSharedCollection); // Для шаринга

module.exports = router;