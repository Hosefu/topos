// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// WebSocket URL
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

// Telegram Bot Name
export const TELEGRAM_BOT_NAME = process.env.REACT_APP_TELEGRAM_BOT_NAME || 'your_bot_name';

// Desk статусы для отображения
export const DESK_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
};

// Цвета для статусов столов
export const DESK_STATUS_COLORS = {
  available: '#22c55e', // green-500
  occupied: '#ef4444', // red-500
  maintenance: '#6b7280', // gray-500
  reserved: '#eab308', // yellow-500
};

// Статусы бронирований
export const RESERVATION_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// Цвета для статусов бронирований
export const RESERVATION_STATUS_COLORS = {
  active: '#22c55e', // green-500
  completed: '#3b82f6', // blue-500
  cancelled: '#6b7280', // gray-500
  no_show: '#ef4444', // red-500
};

// Типы бронирований
export const RESERVATION_TYPES = {
  SINGLE: 'single',
  RECURRING: 'recurring',
};

// Шаблоны повторения для бронирований
export const RECURRENCE_PATTERNS = {
  DAILY: 'daily',
  WEEKDAYS: 'weekdays',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
};

// Названия шаблонов повторения на русском
export const RECURRENCE_PATTERN_NAMES = {
  daily: 'Ежедневно',
  weekdays: 'Будние дни',
  weekly: 'Еженедельно',
  biweekly: 'Раз в две недели',
  monthly: 'Ежемесячно',
};

// Настройки рабочего времени
export const WORKING_HOURS = {
  start: 9, // 9:00
  end: 18, // 18:00
};

// Настройки шага времени для выбора (минуты)
export const TIME_STEP = 30; // 30 минут