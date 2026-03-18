const model = require('../models/travelModel');

exports.getRoutes = async (req, res) => {
    try {
        const routes = await model.getAllRoutes();
        res.status(200).json(routes);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addRoute = async (req, res) => {
    try {
        const { user_id, title, description } = req.body;
        const route = await model.createRoute(user_id, title, description);
        res.status(201).json(route);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addReview = async (req, res) => {
    try {
        const { user_id, route_id, rating, comment } = req.body;
        const review = await model.addReview(user_id, route_id, rating, comment);
        res.status(201).json(review);
    } catch (err) { res.status(500).json({ error: err.message }); }
};