const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/travelController');

router.get('/routes', ctrl.getRoutes);
router.post('/routes', ctrl.createRoute);
router.put('/routes/:id', ctrl.updateRoute);
router.delete('/routes/:id', ctrl.deleteRoute);
router.get('/categories', ctrl.getCategories);

router.get('/reviews', ctrl.getReviews);
router.post('/reviews', ctrl.createReview);
router.put('/reviews/:id', ctrl.updateReview);
router.delete('/reviews/:id', ctrl.deleteReview);

router.get('/preferences', ctrl.getPrefs);
router.put('/preferences', ctrl.updatePrefs);
router.get('/recommendations', ctrl.getRecommendations);

router.get('/collections', ctrl.getCollections);
router.post('/collections', ctrl.createCollection);
router.put('/collections/:id', ctrl.updateCollection);
router.delete('/collections/:id', ctrl.deleteCollection);
router.post('/collections/add', ctrl.addToCollection);
router.delete('/collections/:id/routes/:route_id', ctrl.removeFromCollection);
router.get('/collections/:id/routes', ctrl.getCollectionRoutes); 

module.exports = router;