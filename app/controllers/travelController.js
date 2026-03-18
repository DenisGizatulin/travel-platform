const model = require('../models/travelModel');

// Юзер 1 захардкожен для упрощения MVP
const USER_ID = 1; 

exports.getRoutes = async (req, res) => {
    try { res.status(200).json(await model.getAllRoutes()); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRouteById = async (req, res) => {
    try { res.status(200).json(await model.getRouteById(req.params.id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRoute = async (req, res) => {
    try { await model.createRoute(USER_ID, req.body); res.status(201).json({ message: 'Создано' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateRoute = async (req, res) => {
    try { await model.updateRoute(req.params.id, req.body); res.status(200).json({ message: 'Обновлено' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRoute = async (req, res) => {
    try { await model.deleteRoute(req.params.id); res.status(200).json({ message: 'Удалено' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addReview = async (req, res) => {
    try { await model.addReview(USER_ID, req.body.route_id, req.body.rating, req.body.comment); res.status(201).json({ message: 'Отзыв добавлен' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRecommendations = async (req, res) => {
    try { res.status(200).json(await model.getRecommendations(USER_ID)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleFavorite = async (req, res) => {
    try { res.status(200).json(await model.toggleFavorite(req.body.route_id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getFavorites = async (req, res) => {
    try { res.status(200).json(await model.getFavorites()); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};