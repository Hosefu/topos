import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { telegramLogin } from '../store/authSlice';
import { TELEGRAM_BOT_NAME } from '../config';

// Telegram Login Widget callback
window.onTelegramAuth = (user) => {
  const event = new CustomEvent('telegram-login', { detail: user });
  window.dispatchEvent(event);
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  // Обработчик события успешной авторизации через Telegram
  useEffect(() => {
    const handleTelegramLogin = (event) => {
      const userData = event.detail;
      dispatch(telegramLogin(userData));
    };
    
    window.addEventListener('telegram-login', handleTelegramLogin);
    
    return () => {
      window.removeEventListener('telegram-login', handleTelegramLogin);
    };
  }, [dispatch]);
  
  // Если уже авторизованы, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OfficeMap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Интерактивная карта офиса с системой бронирования столов
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Вход в систему</h3>
              <p className="mt-1 text-sm text-gray-500">
                Для входа в систему используйте авторизацию через Telegram
              </p>
            </div>
            
            {/* Ошибка авторизации */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Telegram Login виджет */}
            <div className="flex justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              ) : (
                <div id="telegram-login-container">
                  <script
                    async
                    src="https://telegram.org/js/telegram-widget.js?22"
                    data-telegram-login={TELEGRAM_BOT_NAME}
                    data-size="large"
                    data-radius="8"
                    data-userpic="true"
                    data-auth-url="#"
                    data-request-access="write"
                    data-onauth="onTelegramAuth(user)"
                  ></script>
                </div>
              )}
            </div>
            
            <div className="text-sm text-center text-gray-500 mt-4">
              При авторизации вы соглашаетесь с правилами использования системы бронирования.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;