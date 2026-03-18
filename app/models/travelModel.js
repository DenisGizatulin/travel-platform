const db = require('../config/db');

// Получение всех маршрутов со средней оценкой и точками
const getAllRoutes = async () => {
    const { rows } = await db.query(`
        SELECT r.*, 
               COALESCE(AVG(rev.rating), 0) as avg_rating,
               COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]') as poi
        FROM routes r
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        LEFT JOIN reviews rev ON r.id = rev.route_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
    `);
    return rows;
};

// Получение одного маршрута (для функции "Поделиться")
const getRouteById = async (id) => {
    const { rows } = await db.query(`
        SELECT r.*, COALESCE(json_agg(p ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]') as poi
        FROM routes r
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        WHERE r.id = $1 GROUP BY r.id
    `, [id]);
    return rows[0];
};

// Создание маршрута + сразу добавление его гео-точек (Транзакция)
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
                const p = data.poi[i];
                await client.query(
                    'INSERT INTO points_of_interest (route_id, name, lat, lng, sort_order) VALUES ($1, $2, $3, $4, $5)',
                    [routeId, p.name || `Точка ${i+1}`, p.lat, p.lng, i+1]
                );
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

// Обновление маршрута (Редактирование)
const updateRoute = async (id, data) => {
    await db.query(
        'UPDATE routes SET title=$1, description=$2, category=$3, difficulty=$4 WHERE id=$5',
        [data.title, data.description, data.category, data.difficulty, id]
    );
};

// Удаление
const deleteRoute = async (id) => {
    await db.query('DELETE FROM routes WHERE id = $1', [id]);
};

// Отзывы
const addReview = async (userId, routeId, rating, comment) => {
    await db.query('INSERT INTO reviews (user_id, route_id, rating, comment) VALUES ($1, $2, $3, $4)', [userId, routeId, rating, comment]);
};

// УМНЫЕ РЕКОМЕНДАЦИИ (на основе высоко оцененных категорий/сложности)
const getRecommendations = async (userId) => {
    const { rows } = await db.query(`
        WITH LikedCategories AS (
            SELECT r.category, r.difficulty
            FROM reviews rev
            JOIN routes r ON rev.route_id = r.id
            WHERE rev.user_id = $1 AND rev.rating >= 4
        )
        SELECT DISTINCT r.*, COALESCE(json_agg(p) FILTER (WHERE p.id IS NOT NULL), '[]') as poi
        FROM routes r
        JOIN LikedCategories lc ON r.category = lc.category OR r.difficulty = lc.difficulty
        LEFT JOIN points_of_interest p ON r.id = p.route_id
        LEFT JOIN reviews rev ON r.id = rev.route_id AND rev.user_id = $1
        WHERE rev.id IS NULL -- Исключаем те, которые пользователь уже оценил
        GROUP BY r.id
        LIMIT 5
    `, [userId]);
    return rows;
};

// Избранное (Коллекции)
const toggleFavorite = async (routeId) => {
    // В рамках работы хардкодим collection_id = 1 (Избранное юзера 1)
    const check = await db.query('SELECT * FROM collection_routes WHERE collection_id = 1 AND route_id = $1', [routeId]);
    if (check.rows.length > 0) {
        await db.query('DELETE FROM collection_routes WHERE collection_id = 1 AND route_id = $1', [routeId]);
        return { status: 'removed' };
    } else {
        await db.query('INSERT INTO collection_routes (collection_id, route_id) VALUES (1, $1)', [routeId]);
        return { status: 'added' };
    }
};

const getFavorites = async () => {
    const { rows } = await db.query(`
        SELECT r.* FROM routes r
        JOIN collection_routes cr ON r.id = cr.route_id
        WHERE cr.collection_id = 1
    `);
    return rows;
};

module.exports = { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute, addReview, getRecommendations, toggleFavorite, getFavorites };