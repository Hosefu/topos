# Интерактивная карта офиса с системой бронирования столов

Система для управления рабочими местами в офисе с нестабильным посещением сотрудников. Позволяет визуализировать карту офиса, видеть доступные рабочие места и бронировать их на нужные даты.

## Особенности

- Интерактивная карта офиса с визуализацией рабочих мест
- Авторизация через Telegram
- Система бронирования с поддержкой повторяющихся бронирований
- Отображение статуса столов в реальном времени
- Отметки о прибытии
- Уведомления о событиях
- Профиль пользователя с настройками и предпочтениями
- Мобильная адаптация

## Технологический стек

### Backend
- Django + Django REST Framework
- Django Channels для WebSockets
- Celery для фоновых задач
- Redis для кеширования и брокера сообщений
- PostgreSQL для базы данных

### Frontend
- React.js
- Redux Toolkit для управления состоянием
- React Konva для визуализации карты
- Tailwind CSS для стилей
- Axios для HTTP-запросов

### Инфраструктура
- Docker и Docker Compose для контейнеризации
- Nginx как reverse proxy

## Требования

- Docker и Docker Compose
- Telegram Bot для авторизации (необходимо создать)

## Установка и запуск

1. Клонировать репозиторий:
   ```bash
   git clone <url-репозитория>
   cd office-desk-booking
   ```

2. Создать файл переменных окружения:
   ```bash
   cp .env.example .env
   ```

3. Настройте переменные окружения в файле `.env`:
   - Создайте Telegram бота через [BotFather](https://t.me/botfather)
   - Укажите токен бота в `TELEGRAM_BOT_TOKEN`
   - Укажите имя бота в `TELEGRAM_BOT_NAME`

4. Запустите проект с помощью Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. Создайте суперпользователя Django:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. Откройте приложение в браузере:
   - Фронтенд: http://localhost
   - Админ-панель: http://localhost/admin

## Настройка Telegram бота

1. Создайте бота через [BotFather](https://t.me/botfather) и получите токен
2. Настройте WebHook для вашего домена:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/users/telegram-webhook/
   ```
3. Настройте параметры бота через BotFather:
   - Включите Domain Linking для вашего домена
   - Настройте Меню бота

## Структура проекта

```
office-desk-booking/
├── backend/                # Django проект
│   ├── core/               # Основное приложение
│   ├── users/              # Приложение пользователей
│   ├── desks/              # Приложение рабочих мест
│   ├── reservations/       # Приложение бронирований
│   ├── office_layout/      # Приложение схемы офиса
│   └── config/             # Настройки Django
├── frontend/               # React приложение
│   ├── public/
│   └── src/
│       ├── components/     # React компоненты
│       ├── pages/          # Страницы приложения
│       ├── services/       # Сервисы API
│       └── store/          # Redux хранилище
├── docker/                 # Docker конфигурация
├── docker-compose.yml      # Файл Docker Compose
└── README.md               # Документация
```

## Дальнейшее развитие проекта

- Интеграция с календарными системами (Google Calendar, Outlook)
- Мобильное приложение
- Расширенная аналитика использования рабочих мест
- Система подтверждения присутствия через QR-код или геолокацию
- Интеграция с системой контроля доступа

## Лицензия

[MIT](LICENSE)