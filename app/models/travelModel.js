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
        await client.query('COMMIT'); 
        return routeId;
    } catch (e) { 
        await client.query('ROLLBACK'); 
        throw e; 
    } finally { 
        client.release(); 
    }
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

// --- КОЛЛЕКЦИИ И ШАРИНГ ---
const createCollection = async (userId, name) => {
    const { rows } = await db.query('INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
    return rows[0];
};

const getUserCollections = async (userId) => {
    const { rows } = await db.query('SELECT * FROM collections WHERE user_id = $1 ORDER BY id DESC', [userId]);
    return rows;
};

const addRouteToCollection = async (collectionId, routeId) => {
    await db.query('INSERT INTO collection_routes (collection_id, route_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [collectionId, routeId]);
};

const getCollectionWithRoutes = async (collectionId) => {
    const { rows } = await db.query(`
        SELECT c.name as collection_name, r.*, 
        COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as poi
        FROM collections c
        LEFT JOIN collection_routes cr ON c.id = cr.collection_id
        LEFT JOIN routes r ON cr.route_id = r.id
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        WHERE c.id = $1 
        GROUP BY c.id, c.name, r.id, r.user_id, r.title, r.description, r.category, r.difficulty, r.distance_km
    `, [collectionId]);
    return rows;
};

module.exports = { getAllRoutes, getUniqueCategories, createRoute, getUserPreferences, updateUserPreferences, getRecommendations, createCollection, getUserCollections, addRouteToCollection, getCollectionWithRoutes };