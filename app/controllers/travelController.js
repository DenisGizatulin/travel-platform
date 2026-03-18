const model = require('../models/travelModel');
const USER_ID = 1; 

exports.getRoutes = async (req, res) => { res.json(await model.getAllRoutes()); };
exports.getCategories = async (req, res) => { res.json(await model.getUniqueCategories()); };
exports.createRoute = async (req, res) => { await model.createRoute(USER_ID, req.body); res.status(201).json({msg: 'Создано'}); };

exports.getPrefs = async (req, res) => { res.json({ prefs: await model.getUserPreferences(USER_ID) }); };
exports.updatePrefs = async (req, res) => { await model.updateUserPreferences(USER_ID, req.body.prefs); res.json({msg: 'Сохранено'}); };
exports.getRecommendations = async (req, res) => { res.json(await model.getRecommendations(USER_ID)); };

exports.getCollections = async (req, res) => { res.json(await model.getUserCollections(USER_ID)); };
exports.createCollection = async (req, res) => { res.json(await model.createCollection(USER_ID, req.body.name)); };
exports.addToCollection = async (req, res) => { await model.addRouteToCollection(req.body.collection_id, req.body.route_id); res.json({msg: 'Добавлено'}); };
exports.getSharedCollection = async (req, res) => { res.json(await model.getCollectionWithRoutes(req.params.id)); };