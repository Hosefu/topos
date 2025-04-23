import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cancelReservation } from '../../store/reservationsSlice';
import { addNotification } from '../../store/uiSlice';

const ConfirmCancelReservationModal = ({ reservation, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.reservations);
  
  // Форматируем дату и время
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
  };
  
  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm', { locale: ru });
  };
  
  // Обработчик отмены бронирования
  const handleCancelReservation = () => {
    dispatch(cancelReservation(reservation.id))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Бронирование отменено',
          message: 'Ваше бронирование успешно отменено'
        }));
        onClose();
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          title: 'Ошибка',
          message: error?.message || 'Не удалось отменить бронирование'
        }));
      });
  };
  
  return (
    <div>
      <div className="mt-3 sm:mt-0">
        <div className="mt-2">
          <div className="text-center sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Отмена бронирования
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Вы уверены, что хотите отменить данное бронирование?
              </p>
            </div>
          </div>
          
          <div className="mt-5 bg-gray-50 p-4 rounded-md">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Рабочее место</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {reservation.desk_name} ({reservation.desk_number})
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Дата</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(reservation.start_time)}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Время</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                </dd>
              </div>
              
              {reservation.reservation_type === 'recurring' && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Тип</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Повторяющееся
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          {reservation.reservation_type === 'recurring' && (
            <div className="mt-4">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Внимание
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Это повторяющееся бронирование. При отмене будет отменено только данное бронирование, а не вся серия.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={handleCancelReservation}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            >
              {loading ? 'Отмена...' : 'Отменить бронирование'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Не отменять
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelReservationModal;