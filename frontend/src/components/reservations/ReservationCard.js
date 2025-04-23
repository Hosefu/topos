import React from 'react';
import { format, parseISO, isAfter, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDispatch } from 'react-redux';
import { checkInReservation, cancelReservation } from '../../store/reservationsSlice';
import { openModal } from '../../store/uiSlice';
import { RESERVATION_STATUSES, RESERVATION_STATUS_COLORS, RECURRENCE_PATTERN_NAMES } from '../../config';

const ReservationCard = ({ reservation, isCurrent = false }) => {
  const dispatch = useDispatch();
  
  // Форматируем дату и время
  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Сегодня';
    }
    
    return format(date, 'd MMMM yyyy', { locale: ru });
  };
  
  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm', { locale: ru });
  };
  
  // Проверяем, можно ли отметиться о прибытии
  const canCheckIn = () => {
    if (reservation.status !== RESERVATION_STATUSES.ACTIVE) {
      return false;
    }
    
    if (reservation.check_in_time) {
      return false;
    }
    
    const now = new Date();
    const startTime = parseISO(reservation.start_time);
    const endTime = parseISO(reservation.end_time);
    
    // Можно отметиться, если текущее время в промежутке бронирования
    return now >= startTime && now <= endTime;
  };
  
  // Проверяем, можно ли отменить бронирование
  const canCancel = () => {
    if (reservation.status !== RESERVATION_STATUSES.ACTIVE) {
      return false;
    }
    
    const now = new Date();
    const startTime = parseISO(reservation.start_time);
    
    // Можно отменить, если бронирование еще не началось
    return isAfter(startTime, now);
  };
  
  // Обработчик отметки о прибытии
  const handleCheckIn = () => {
    dispatch(checkInReservation(reservation.id));
  };
  
  // Обработчик отмены бронирования
  const handleCancel = () => {
    dispatch(
      openModal({
        type: 'confirmCancelReservation',
        props: { reservation },
      })
    );
  };
  
  // Функция для определения статуса на русском
  const getStatusText = (status) => {
    switch (status) {
      case RESERVATION_STATUSES.ACTIVE:
        return 'Активно';
      case RESERVATION_STATUSES.COMPLETED:
        return 'Завершено';
      case RESERVATION_STATUSES.CANCELLED:
        return 'Отменено';
      case RESERVATION_STATUSES.NO_SHOW:
        return 'Неявка';
      default:
        return 'Неизвестно';
    }
  };
  
  // Цвет статуса
  const statusColor = RESERVATION_STATUS_COLORS[reservation.status] || RESERVATION_STATUS_COLORS.active;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      {/* Заголовок */}
      <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {reservation.desk_name} <span className="text-sm">({reservation.desk_number})</span>
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(reservation.start_time)}
          </p>
        </div>
        <div>
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${statusColor}20`, 
              color: statusColor 
            }}
          >
            {getStatusText(reservation.status)}
          </span>
        </div>
      </div>
      
      {/* Тело карточки */}
      <div className="px-4 py-4 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {/* Время */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Время</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
            </dd>
          </div>
          
          {/* Тип бронирования */}
          {reservation.reservation_type === 'recurring' && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Тип</dt>
              <dd className="mt-1 text-sm text-gray-900">
                Повторяющееся ({RECURRENCE_PATTERN_NAMES[reservation.recurrence_pattern]})
              </dd>
            </div>
          )}
          
          {/* Отметка о прибытии */}
          {reservation.check_in_time && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Отметка о прибытии</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatTime(reservation.check_in_time)}
              </dd>
            </div>
          )}
          
          {/* Примечания */}
          {reservation.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Примечания</dt>
              <dd className="mt-1 text-sm text-gray-900">{reservation.notes}</dd>
            </div>
          )}
        </dl>
      </div>
      
      {/* Кнопки действий */}
      {(canCheckIn() || canCancel()) && (
        <div className="px-4 py-4 sm:px-6 flex space-x-3">
          {canCheckIn() && (
            <button
              type="button"
              onClick={handleCheckIn}
              className="flex-grow inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Отметиться
            </button>
          )}
          
          {canCancel() && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-grow inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Отменить
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;