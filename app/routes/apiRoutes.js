const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/travelController');

router.get('/routes', ctrl.getRoutes);
router.get('/routes/:id', ctrl.getRouteById);
router.post('/routes', ctrl.createRoute);
router.put('/routes/:id', ctrl.updateRoute);
router.delete('/routes/:id', ctrl.deleteRoute);

router.post('/reviews', ctrl.addReview);
router.get('/recommendations', ctrl.getRecommendations);

router.get('/favorites', ctrl.getFavorites);
router.post('/favorites', ctrl.toggleFavorite);

module.exports = router;