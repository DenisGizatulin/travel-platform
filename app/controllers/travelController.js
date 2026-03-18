const model = require('../models/travelModel');
const USER_ID = 1; 

const handleReq = async (res, action) => {
    try {
        const data = await action();
        res.status(200).json(data || {msg: 'Успешно'});
    } catch (err) {
        console.error("Ошибка БД:", err.message);
        res.status(500).json({ error: err.message, data: [] });
    }
};

// Маршруты
exports.getRoutes = (req, res) => handleReq(res, () => model.getAllRoutes());
exports.createRoute = (req, res) => handleReq(res, () => model.createRoute(USER_ID, req.body));
exports.updateRoute = (req, res) => handleReq(res, () => model.updateRoute(req.params.id, req.body));
exports.deleteRoute = (req, res) => handleReq(res, () => model.deleteRoute(req.params.id));
exports.getCategories = (req, res) => handleReq(res, () => model.getUniqueCategories());

// Отзывы
exports.getReviews = (req, res) => handleReq(res, () => model.getReviews(USER_ID));
exports.createReview = (req, res) => handleReq(res, () => model.createReview(USER_ID, req.body));
exports.updateReview = (req, res) => handleReq(res, () => model.updateReview(req.params.id, req.body));
exports.deleteReview = (req, res) => handleReq(res, () => model.deleteReview(req.params.id));

// Профиль и рекомендации
exports.getPrefs = (req, res) => handleReq(res, async () => ({ prefs: await model.getUserPreferences(USER_ID) }));
exports.updatePrefs = (req, res) => handleReq(res, () => model.updateUserPreferences(USER_ID, req.body.prefs));
exports.getRecommendations = (req, res) => handleReq(res, () => model.getRecommendations(USER_ID));

// Коллекции
exports.getCollections = (req, res) => handleReq(res, () => model.getUserCollections(USER_ID));
exports.createCollection = (req, res) => handleReq(res, () => model.createCollection(USER_ID, req.body.name));
exports.updateCollection = (req, res) => handleReq(res, () => model.updateCollection(req.params.id, req.body.name));
exports.deleteCollection = (req, res) => handleReq(res, () => model.deleteCollection(req.params.id));
exports.addToCollection = (req, res) => handleReq(res, () => model.addRouteToCollection(req.body.collection_id, req.body.route_id));
exports.removeFromCollection = (req, res) => handleReq(res, () => model.removeRouteFromCollection(req.params.id, req.params.route_id));
exports.getCollectionRoutes = (req, res) => handleReq(res, () => model.getCollectionWithRoutes(req.params.id));