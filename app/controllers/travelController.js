const model = require('../models/travelModel');
const USER_ID = 1; 

// Функция-обертка для перехвата любых ошибок сервера
const handleReq = async (res, action) => {
    try {
        const data = await action();
        res.status(200).json(data);
    } catch (err) {
        console.error("Ошибка БД:", err.message);
        res.status(500).json({ error: err.message, data: [] });
    }
};

exports.getRoutes = (req, res) => handleReq(res, () => model.getAllRoutes());
exports.getCategories = (req, res) => handleReq(res, () => model.getUniqueCategories());
exports.getPrefs = (req, res) => handleReq(res, async () => ({ prefs: await model.getUserPreferences(USER_ID) }));
exports.getRecommendations = (req, res) => handleReq(res, () => model.getRecommendations(USER_ID));
exports.getCollections = (req, res) => handleReq(res, () => model.getUserCollections(USER_ID));
exports.getSharedCollection = (req, res) => handleReq(res, () => model.getCollectionWithRoutes(req.params.id));

exports.createRoute = async (req, res) => {
    try {
        await model.createRoute(USER_ID, req.body);
        res.status(201).json({msg: 'Создано'});
    } catch (err) {
        console.error("Ошибка сохранения маршрута:", err.message);
        res.status(500).json({error: err.message});
    }
};

exports.updatePrefs = async (req, res) => {
    try {
        await model.updateUserPreferences(USER_ID, req.body.prefs);
        res.json({msg: 'Сохранено'});
    } catch (err) { res.status(500).json({error: err.message}); }
};

exports.createCollection = async (req, res) => {
    try {
        await model.createCollection(USER_ID, req.body.name);
        res.json({msg: 'Создано'});
    } catch (err) { res.status(500).json({error: err.message}); }
};

exports.addToCollection = async (req, res) => {
    try {
        await model.addRouteToCollection(req.body.collection_id, req.body.route_id);
        res.json({msg: 'Добавлено'});
    } catch (err) { res.status(500).json({error: err.message}); }
};