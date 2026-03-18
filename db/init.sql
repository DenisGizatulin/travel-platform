DROP TABLE IF EXISTS collection_routes, collections, reviews, points_of_interest, routes, users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Живописные', 'Короткие', 'Сложные', 'Исторические'
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5), -- Сложность от 1 до 5
    distance_km NUMERIC(10, 2) DEFAULT 0, -- Протяженность
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    name VARCHAR(100),
    lat NUMERIC(10, 6) NOT NULL,
    lng NUMERIC(10, 6) NOT NULL,
    sort_order INTEGER -- Порядок точек на маршруте
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

-- Тестовые данные (Пользователь ID = 1)
INSERT INTO users (username, email) VALUES ('traveler', 'test@test.com');
-- Базовая коллекция "Избранное"
INSERT INTO collections (user_id, name) VALUES (1, 'Избранное');

INSERT INTO routes (user_id, title, description, category, difficulty, distance_km) VALUES 
(1, 'Орлиные скалы', 'Красивый маршрут в горах', 'Живописные', 3, 5.2),
(1, 'Центр города', 'Легкая прогулка', 'Короткие', 1, 2.0);

INSERT INTO points_of_interest (route_id, name, lat, lng, sort_order) VALUES 
(1, 'Старт', 43.555, 39.812, 1), (1, 'Скала', 43.560, 39.820, 2),
(2, 'Парк', 43.585, 39.723, 1), (2, 'Музей', 43.590, 39.730, 2);

-- Добавим высокую оценку живописному маршруту для теста системы рекомендаций
INSERT INTO reviews (user_id, route_id, rating, comment) VALUES (1, 1, 5, 'Супер виды!');