import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DESK_STATUSES, DESK_STATUS_COLORS } from '../../config';

const DeskDetail = ({ desk, onBookDesk, date, timeRange }) => {
  if (!desk) {
    // Если стол не выбран, показываем заглушку
    return (
      <div className="bg-white shadow rounded-lg p-4 h-full">
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Не выбрано рабочее место</h3>
          <p className="mt-1 text-sm text-gray-500">
            Выберите рабочее место на карте, чтобы увидеть подробную информацию и забронировать его.
          </p>
        </div>
      </div>
    );
  }

  // Форматируем дату
  const formattedDate = date ? format(date, 'EEEE, d MMMM yyyy', { locale: ru }) : '';

  // Проверяем, доступен ли стол для бронирования
  const isAvailable = desk.status === DESK_STATUSES.AVAILABLE;

  // Получаем цвет статуса стола
  const statusColor = DESK_STATUS_COLORS[desk.status] || DESK_STATUS_COLORS[DESK_STATUSES.AVAILABLE];

  // Статус стола на русском
  const getStatusText = (status) => {
    switch (status) {
      case DESK_STATUSES.AVAILABLE:
        return 'Доступен';
      case DESK_STATUSES.OCCUPIED:
        return 'Занят';
      case DESK_STATUSES.RESERVED:
        return 'Зарезервирован';
      case DESK_STATUSES.MAINTENANCE:
        return 'На обслуживании';
      default:
        return 'Неизвестно';
    }
  };

  // Форматируем особенности стола
  const formatFeatures = (features) => {
    if (!features || Object.keys(features).length === 0) {
      return 'Нет дополнительных особенностей';
    }

    // Преобразуем объект особенностей в список
    return Object.entries(features)
      .filter(([key, value]) => value) // Только true значения
      .map(([key]) => {
        switch (key) {
          case 'monitor':
            return 'Монитор';
          case 'adjustable_height':
            return 'Регулировка высоты';
          case 'near_window':
            return 'Рядом с окном';
          case 'quiet_zone':
            return 'Тихая зона';
          default:
            return key;
        }
      })
      .join(', ');
  };

  return (
    <div className="bg-white shadow rounded-lg h-full flex flex-col">
      {/* Заголовок */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {desk.name} <span className="text-sm">({desk.desk_number})</span>
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {desk.area_name}
        </p>
      </div>

      {/* Информация о столе */}
      <div className="px-4 py-5 sm:p-6 flex-grow">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
          {/* Статус */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Статус</dt>
            <dd className="mt-1 text-sm text-gray-900 flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: statusColor }}
              />
              {getStatusText(desk.status)}
            </dd>
          </div>

          {/* Особенности */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Особенности</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatFeatures(desk.features)}
            </dd>
          </div>

          {/* Примечания */}
          {desk.notes && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Примечания</dt>
              <dd className="mt-1 text-sm text-gray-900">{desk.notes}</dd>
            </div>
          )}

          {/* Информация о бронировании */}
          {isAvailable && formattedDate && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Информация о бронировании</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>{formattedDate}</p>
                <p>
                  Время: {timeRange.start} - {timeRange.end}
                </p>
              </dd>
            </div>
          )}

          {/* Текущее бронирование */}
          {desk.current_reservation && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Текущее бронирование</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <p>
                  {desk.current_reservation.user_details?.first_name}{' '}
                  {desk.current_reservation.user_details?.last_name}
                </p>
                <p>
                  {format(new Date(desk.current_reservation.start_time), 'HH:mm')} - {' '}
                  {format(new Date(desk.current_reservation.end_time), 'HH:mm')}
                </p>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Кнопка бронирования */}
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
        {isAvailable ? (
          <button
            type="button"
            onClick={onBookDesk}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Забронировать
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
          >
            Недоступен для бронирования
          </button>
        )}
      </div>
    </div>
  );
};

export default DeskDetail;