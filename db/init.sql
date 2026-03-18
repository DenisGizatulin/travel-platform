DROP TABLE IF EXISTS collection_routes, collections, reviews, points_of_interest, routes, users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    preferences VARCHAR(255) DEFAULT ''
);

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
    distance_km NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    name VARCHAR(100),
    lat NUMERIC(10, 6) NOT NULL,
    lng NUMERIC(10, 6) NOT NULL,
    sort_order INTEGER
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE collection_routes (
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, route_id)
);

-- Тестовые данные (Жестко задаем id=1, чтобы не было сбоев)
INSERT INTO users (id, username, preferences) VALUES (1, 'traveler', 'Экстрим,Горы');

INSERT INTO collections (user_id, name) VALUES (1, 'Мои любимые места');

INSERT INTO routes (id, user_id, title, description, category, difficulty, distance_km) VALUES 
(1, 1, 'Горный перевал', 'Тяжелый путь в горы', 'Горы', 5, 12.5),
(2, 1, 'Городской парк', 'Легкая прогулка', 'Парки', 1, 3.0);

-- ДОБАВИЛИ ГЕО-ТОЧКИ ДЛЯ ТЕСТОВЫХ МАРШРУТОВ (без них не работает карта)
INSERT INTO points_of_interest (route_id, lat, lng, sort_order) VALUES 
(1, 43.600, 39.750, 1), (1, 43.610, 39.760, 2),
(2, 43.580, 39.720, 1), (2, 43.585, 39.725, 2);

-- Обновляем счетчики ID (чтобы новые маршруты создавались с id=3 и далее)
SELECT setval('routes_id_seq', (SELECT MAX(id) FROM routes));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));