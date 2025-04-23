import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, updateUserPreferences } from '../store/authSlice';
import { addNotification } from '../store/uiSlice';
import { fetchDesks } from '../store/desksSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { desks, loading: desksLoading } = useSelector(state => state.desks);
  
  // Состояние для формы профиля
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
  });
  
  // Состояние для формы предпочтений
  const [preferencesForm, setPreferencesForm] = useState({
    preferred_desk_ids: [],
    preferred_area: '',
    notification_enabled: true,
  });
  
  // Инициализируем формы при загрузке пользователя
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
      });
      
      if (user.preference) {
        setPreferencesForm({
          preferred_desk_ids: user.preference.preferred_desk_ids || [],
          preferred_area: user.preference.preferred_area || '',
          notification_enabled: user.preference.notification_enabled,
        });
      }
    }
  }, [user]);
  
  // Загружаем список столов для выбора предпочтений
  useEffect(() => {
    dispatch(fetchDesks());
  }, [dispatch]);
  
  // Обработчик изменения полей формы профиля
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Обработчик изменения полей формы предпочтений
  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPreferencesForm(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'preferred_desk_ids') {
      // Для множественного выбора столов
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => Number(option.value));
      setPreferencesForm(prev => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else {
      setPreferencesForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Обработчик отправки формы профиля
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(profileForm))
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Профиль обновлен',
          message: 'Ваши данные успешно сохранены',
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось обновить профиль',
        }));
      });
  };
  
  // Обработчик отправки формы предпочтений
  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserPreferences(preferencesForm))
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Предпочтения обновлены',
          message: 'Ваши предпочтения успешно сохранены',
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось обновить предпочтения',
        }));
      });
  };
  
  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мой профиль</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление персональными данными и настройками
        </p>
      </div>
      
      {/* Секция профиля */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Персональная информация</h2>
          <p className="mt-1 text-sm text-gray-500">
            Обновите ваши персональные данные и контактную информацию
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Telegram-данные (не редактируемые) */}
              {user?.telegram_id && (
                <div className="sm:col-span-6">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                    {user.telegram_photo_url && (
                      <img 
                        src={user.telegram_photo_url} 
                        alt="Telegram аватар" 
                        className="h-12 w-12 rounded-full mr-4" 
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Вы вошли через Telegram
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.telegram_username ? `@${user.telegram_username}` : `ID: ${user.telegram_id}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Имя */}
              <div className="sm:col-span-3">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Имя
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Фамилия */}
              <div className="sm:col-span-3">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Отдел */}
              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Отдел
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="department"
                    id="department"
                    value={profileForm.department}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Должность */}
              <div className="sm:col-span-3">
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Должность
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="position"
                    id="position"
                    value={profileForm.position}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Телефон */}
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Секция предпочтений */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Предпочтения</h2>
          <p className="mt-1 text-sm text-gray-500">
            Настройте ваши предпочтения по рабочим местам и уведомлениям
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Предпочитаемые столы */}
              <div className="sm:col-span-6">
                <label htmlFor="preferred_desk_ids" className="block text-sm font-medium text-gray-700">
                  Предпочитаемые рабочие места
                </label>
                <div className="mt-1">
                  <select
                    id="preferred_desk_ids"
                    name="preferred_desk_ids"
                    multiple
                    value={preferencesForm.preferred_desk_ids.map(String)}
                    onChange={handlePreferencesChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={desksLoading}
                  >
                    {desksLoading ? (
                      <option>Загрузка столов...</option>
                    ) : (
                      desks.map(desk => (
                        <option key={desk.id} value={desk.id}>
                          {desk.name} ({desk.desk_number})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Выберите рабочие места, которые вы предпочитаете (удерживайте Ctrl для выбора нескольких)
                </p>
              </div>
              
              {/* Предпочитаемая зона */}
              <div className="sm:col-span-3">
                <label htmlFor="preferred_area" className="block text-sm font-medium text-gray-700">
                  Предпочитаемая зона
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="preferred_area"
                    id="preferred_area"
                    value={preferencesForm.preferred_area}
                    onChange={handlePreferencesChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Уведомления */}
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notification_enabled"
                      name="notification_enabled"
                      type="checkbox"
                      checked={preferencesForm.notification_enabled}
                      onChange={handlePreferencesChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notification_enabled" className="font-medium text-gray-700">
                      Включить уведомления
                    </label>
                    <p className="text-gray-500">
                      Получать уведомления о бронированиях и изменениях в Telegram
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? 'Сохранение...' : 'Сохранить предпочтения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;