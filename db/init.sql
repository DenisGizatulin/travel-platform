DROP TABLE IF EXISTS collection_routes, collections, reviews, points_of_interest, routes, users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    preferences VARCHAR(255) DEFAULT '' -- Храним предпочтения через запятую (например: 'Горы,Лес')
);

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- Теперь пользователь сможет писать сюда свой текст
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
    name VARCHAR(100) NOT NULL -- Пользователь сам называет коллекции
);

CREATE TABLE collection_routes (
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, route_id)
);

-- Тестовые данные
INSERT INTO users (username, preferences) VALUES ('traveler', 'Экстрим,Горы');
INSERT INTO routes (user_id, title, description, category, difficulty, distance_km) VALUES 
(1, 'Горный перевал', 'Тяжелый путь', 'Горы', 5, 12.5),
(1, 'Городской парк', 'Легкая прогулка', 'Парки', 1, 3.0),
(1, 'Спуск по реке', 'Опасно', 'Экстрим', 4, 8.0);