import axios from 'axios';
import { API_URL } from '../config';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обрабатываем ошибку истечения токена
    if (error.response && error.response.status === 401) {
      // Удаляем токен и перенаправляем на страницу входа
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Функция для добавления токена авторизации в заголовки запроса
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Если токен уже есть в localStorage, добавляем его в заголовки
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Сервис для работы с API
const apiService = {
  // Метод для установки токена
  setToken(token) {
    setAuthToken(token);
  },

  // Метод для очистки токена
  clearToken() {
    setAuthToken(null);
  },

  // Методы для работы с пользователями
  users: {
    // Получение информации о текущем пользователе
    getCurrent() {
      return api.get('/api/users/me/');
    },

    // Авторизация через Telegram
    telegramLogin(data) {
      return api.post('/api/users/telegram-login/', data);
    },

    // Обновление профиля пользователя
    updateProfile(data) {
      return api.put('/api/users/update_me/', data);
    },

    // Обновление предпочтений пользователя
    updatePreferences(data) {
      return api.put('/api/users/preferences/', data);
    },
  },

  // Методы для работы со столами
  desks: {
    // Получение всех столов
    getAll() {
      return api.get('/api/desks/');
    },

    // Получение стола по ID
    getById(id) {
      return api.get(`/api/desks/${id}/`);
    },

    // Получение доступных столов на указанную дату и время
    getAvailable(date, timeFrom, timeTo) {
      let url = `/api/desks/available/?date=${date}`;
      if (timeFrom) url += `&time_from=${timeFrom}`;
      if (timeTo) url += `&time_to=${timeTo}`;
      return api.get(url);
    },

    // Получение зон офиса
    getAreas() {
      return api.get('/api/desks/areas/');
    },

    // Обновление статуса стола
    updateStatus(id, status) {
      return api.patch(`/api/desks/${id}/`, { status });
    },
  },

  // Методы для работы с бронированиями
  reservations: {
    // Получение всех бронирований пользователя
    getAll() {
      return api.get('/api/reservations/');
    },

    // Получение бронирования по ID
    getById(id) {
      return api.get(`/api/reservations/${id}/`);
    },

    // Получение текущего активного бронирования
    getCurrent() {
      return api.get('/api/reservations/current/');
    },

    // Получение предстоящих бронирований
    getUpcoming() {
      return api.get('/api/reservations/upcoming/');
    },

    // Создание нового бронирования
    create(data) {
      return api.post('/api/reservations/', data);
    },

    // Отметка о прибытии
    checkIn(id) {
      return api.post(`/api/reservations/${id}/check_in/`);
    },

    // Отмена бронирования
    cancel(id) {
      return api.post(`/api/reservations/${id}/cancel/`);
    },

    // Получение бронирований для календаря
    getCalendar(startDate, endDate, deskId) {
      let url = '/api/reservations/calendar/';
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (deskId) params.desk = deskId;
      return api.get(url, { params });
    },
  },

  // Методы для работы со схемами офиса
  officeLayout: {
    // Получение всех схем офиса
    getAll() {
      return api.get('/api/office/layouts/');
    },

    // Получение активных схем офиса
    getActive() {
      return api.get('/api/office/layouts/active/');
    },

    // Получение схемы офиса по ID
    getById(id) {
      return api.get(`/api/office/layouts/${id}/`);
    },

    // Получение элементов схемы офиса
    getElements(layoutId) {
      return api.get(`/api/office/elements/?layout=${layoutId}`);
    },

    // Обновление позиций столов на схеме
    updateDesksPositions(layoutId, desksData) {
      return api.post(`/api/office/layouts/${layoutId}/update_desks_positions/`, {
        desks: desksData,
      });
    },
  },

  // Методы для получения статистики
  stats: {
    // Получение общей статистики по офису
    getOfficeStats() {
      return api.get('/api/office/stats/');
    },
  },
};

export default apiService;