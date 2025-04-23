import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from '@headlessui/react';
import { 
  XMarkIcon,
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { removeNotification } from '../../store/uiSlice';

const NotificationsList = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector(state => state.ui);

  // Автоматически удаляем уведомления по истечении времени
  useEffect(() => {
    const timers = notifications.map(notification => {
      return setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  // Получение иконки в зависимости от типа уведомления
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
        );
      case 'error':
        return (
          <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
        );
      case 'warning':
        return (
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
        );
      case 'info':
      default:
        return (
          <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
        );
    }
  };

  // Получение цвета в зависимости от типа уведомления
  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  // Получение цвета текста в зависимости от типа уведомления
  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map(notification => (
          <Transition
            key={notification.id}
            show={true}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={`max-w-sm w-full ${getBgColor(
                notification.type
              )} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    {notification.title && (
                      <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                        {notification.title}
                      </p>
                    )}
                    <p className={`mt-1 text-sm ${getTextColor(notification.type)}`}>
                      {notification.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className={`bg-transparent rounded-md inline-flex ${getTextColor(
                        notification.type
                      )} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                      onClick={() => {
                        dispatch(removeNotification(notification.id));
                      }}
                    >
                      <span className="sr-only">Закрыть</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;