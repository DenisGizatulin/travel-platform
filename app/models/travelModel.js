const db = require('../config/db');

const getAllRoutes = async () => {
    const { rows } = await db.query(`
        SELECT r.*, COALESCE(json_agg(p) FILTER (WHERE p.id IS NOT NULL), '[]') as poi
        FROM routes r
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        GROUP BY r.id
    `);
    return rows;
};

const createRoute = async (userId, title, description) => {
    const { rows } = await db.query(
        'INSERT INTO routes (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
        [userId, title, description]
    );
    return rows[0];
};

const addPOI = async (routeId, name, lat, lng, description) => {
    const { rows } = await db.query(
        'INSERT INTO points_of_interest (route_id, name, lat, lng, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [routeId, name, lat, lng, description]
    );
    return rows[0];
};

const addReview = async (userId, routeId, rating, comment) => {
    const { rows } = await db.query(
        'INSERT INTO reviews (user_id, route_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, routeId, rating, comment]
    );
    return rows[0];
};

module.exports = { getAllRoutes, createRoute, addPOI, addReview };