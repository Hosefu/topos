FROM node:16-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Порт для React-приложения
EXPOSE 3000

# Команда для запуска в режиме разработки
CMD ["npm", "start"]