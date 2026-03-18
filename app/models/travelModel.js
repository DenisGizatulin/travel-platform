const db = require('../config/db');

// --- МАРШРУТЫ И КАТЕГОРИИ ---
const getAllRoutes = async () => {
    const { rows } = await db.query(`
        SELECT r.*, COALESCE(AVG(rev.rating), 0) as avg_rating,
        COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as poi
        FROM routes r
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        LEFT JOIN reviews rev ON r.id = rev.route_id
        GROUP BY r.id, r.user_id, r.title, r.description, r.category, r.difficulty, r.distance_km
        ORDER BY r.id DESC
    `);
    return rows;
};

const getUniqueCategories = async () => {
    const { rows } = await db.query('SELECT DISTINCT category FROM routes WHERE category IS NOT NULL');
    return rows.map(r => r.category);
};

const createRoute = async (userId, data) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const resRoute = await client.query(
            'INSERT INTO routes (user_id, title, description, category, difficulty, distance_km) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userId, data.title, data.description, data.category, data.difficulty, data.distance_km]
        );
        const routeId = resRoute.rows[0].id;
        if (data.poi && data.poi.length > 0) {
            for (let i = 0; i < data.poi.length; i++) {
                await client.query('INSERT INTO points_of_interest (route_id, lat, lng, sort_order) VALUES ($1, $2, $3, $4)', [routeId, data.poi[i].lat, data.poi[i].lng, i+1]);
            }
        }
        await client.query('COMMIT'); return routeId;
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
};

const updateRoute = async (routeId, data) => {
    await db.query(
        'UPDATE routes SET title=$1, description=$2, category=$3, difficulty=$4 WHERE id=$5',
        [data.title, data.description, data.category, data.difficulty, routeId]
    );
};

const deleteRoute = async (routeId) => {
    await db.query('DELETE FROM routes WHERE id = $1', [routeId]);
};

// --- ОТЗЫВЫ ---
const getReviews = async (userId) => {
    const { rows } = await db.query(`
        SELECT rev.*, r.title as route_title 
        FROM reviews rev 
        JOIN routes r ON rev.route_id = r.id 
        WHERE rev.user_id = $1 ORDER BY rev.id DESC
    `, [userId]);
    return rows;
};

const createReview = async (userId, data) => {
    await db.query('INSERT INTO reviews (user_id, route_id, rating, comment) VALUES ($1, $2, $3, $4)', 
        [userId, data.route_id, data.rating, data.comment]);
};

const updateReview = async (reviewId, data) => {
    await db.query('UPDATE reviews SET rating=$1, comment=$2 WHERE id=$3', [data.rating, data.comment, reviewId]);
};

const deleteReview = async (reviewId) => {
    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
};

// --- ПОЛЬЗОВАТЕЛЬ, ПРЕДПОЧТЕНИЯ И РЕКОМЕНДАЦИИ ---
const getUserPreferences = async (userId) => {
    const { rows } = await db.query('SELECT preferences FROM users WHERE id = $1', [userId]);
    return rows.length > 0 ? rows[0].preferences : '';
};

const updateUserPreferences = async (userId, prefs) => {
    await db.query('UPDATE users SET preferences = $1 WHERE id = $2', [prefs, userId]);
};

const getRecommendations = async (userId) => {
    const prefsString = await getUserPreferences(userId);
    const prefsArray = prefsString ? prefsString.split(',').map(p => p.trim()).filter(Boolean) : [];
    if (prefsArray.length === 0) return []; 
    
    const { rows } = await db.query(`
        SELECT r.*, COALESCE(AVG(rev.rating), 0) as avg_rating,
        COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as poi
        FROM routes r
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        LEFT JOIN reviews rev ON r.id = rev.route_id
        WHERE r.category = ANY($1::text[]) 
           OR r.description ILIKE ANY(SELECT '%' || unnest($1::text[]) || '%')
        GROUP BY r.id, r.user_id, r.title, r.description, r.category, r.difficulty, r.distance_km
        HAVING COALESCE(AVG(rev.rating), 0) >= 0
        ORDER BY avg_rating DESC LIMIT 5
    `, [prefsArray]);
    return rows;
};

// --- КОЛЛЕКЦИИ ---
const createCollection = async (userId, name) => {
    const { rows } = await db.query('INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
    return rows[0];
};

const getUserCollections = async (userId) => {
    const { rows } = await db.query('SELECT * FROM collections WHERE user_id = $1 ORDER BY id DESC', [userId]);
    return rows;
};

const updateCollection = async (collectionId, name) => {
    await db.query('UPDATE collections SET name=$1 WHERE id=$2', [name, collectionId]);
};

const deleteCollection = async (collectionId) => {
    await db.query('DELETE FROM collections WHERE id=$1', [collectionId]);
};

const addRouteToCollection = async (collectionId, routeId) => {
    await db.query('INSERT INTO collection_routes (collection_id, route_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [collectionId, routeId]);
};

const removeRouteFromCollection = async (collectionId, routeId) => {
    await db.query('DELETE FROM collection_routes WHERE collection_id=$1 AND route_id=$2', [collectionId, routeId]);
};

const getCollectionWithRoutes = async (collectionId) => {
    const { rows } = await db.query(`
        SELECT r.*, COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as poi
        FROM collection_routes cr
        JOIN routes r ON cr.route_id = r.id
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        WHERE cr.collection_id = $1 
        GROUP BY r.id
    `, [collectionId]);
    return rows;
};

module.exports = { 
    getAllRoutes, getUniqueCategories, createRoute, updateRoute, deleteRoute,
    getReviews, createReview, updateReview, deleteReview,
    getUserPreferences, updateUserPreferences, getRecommendations, 
    createCollection, getUserCollections, updateCollection, deleteCollection, 
    addRouteToCollection, removeRouteFromCollection, getCollectionWithRoutes 
};