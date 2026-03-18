FROM node:18-alpine
WORKDIR /usr/src/app
# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install
# Копируем остальной исходный код
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]