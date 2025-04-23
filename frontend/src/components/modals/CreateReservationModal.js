import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { createReservation } from '../../store/reservationsSlice';
import { addNotification } from '../../store/uiSlice';
import { RESERVATION_TYPES, RECURRENCE_PATTERNS, RECURRENCE_PATTERN_NAMES } from '../../config';

const CreateReservationModal = ({ desk, date, timeRange, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.reservations);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    desk: desk.id,
    start_time: `${format(date, 'yyyy-MM-dd')}T${timeRange.start}:00`,
    end_time: `${format(date, 'yyyy-MM-dd')}T${timeRange.end}:00`,
    reservation_type: RESERVATION_TYPES.SINGLE,
    recurrence_pattern: '',
    recurrence_end_date: '',
    notes: '',
  });
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Обработчик изменения типа бронирования
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      reservation_type: newType,
      recurrence_pattern: newType === RESERVATION_TYPES.RECURRING ? RECURRENCE_PATTERNS.WEEKLY : '',
      recurrence_end_date: newType === RESERVATION_TYPES.RECURRING 
        ? format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 30 дней вперед
        : '',
    }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем, заполнены ли все обязательные поля
    if (formData.reservation_type === RESERVATION_TYPES.RECURRING && 
        (!formData.recurrence_pattern || !formData.recurrence_end_date)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Для повторяющегося бронирования необходимо указать шаблон и дату окончания'
      }));
      return;
    }
    
    dispatch(createReservation(formData))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Бронирование создано',
          message: 'Ваше бронирование успешно создано'
        }));
        onClose();
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          title: 'Ошибка',
          message: error?.message || 'Не удалось создать бронирование'
        }));
      });
  };
  
  // Форматируем дату для отображения
  const formatDate = (date) => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: ru });
  };
  
  return (
    <div>
      <div className="mt-3 sm:mt-0">
        <div className="mt-2">
          <div className="text-center sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Бронирование рабочего места
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {desk.name} ({desk.desk_number}) • {formatDate(date)}
              </p>
            </div>
          </div>
          
          <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="time-range" className="block text-sm font-medium text-gray-700">
                Время
              </label>
              <div id="time-range" className="mt-1 text-sm text-gray-900">
                {timeRange.start} - {timeRange.end}
              </div>
            </div>
            
            <div>
              <label htmlFor="reservation_type" className="block text-sm font-medium text-gray-700">
                Тип бронирования
              </label>
              <select
                id="reservation_type"
                name="reservation_type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={formData.reservation_type}
                onChange={handleTypeChange}
              >
                <option value={RESERVATION_TYPES.SINGLE}>Однократное</option>
                <option value={RESERVATION_TYPES.RECURRING}>Повторяющееся</option>
              </select>
            </div>
            
            {formData.reservation_type === RESERVATION_TYPES.RECURRING && (
              <>
                <div>
                  <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700">
                    Шаблон повторения
                  </label>
                  <select
                    id="recurrence_pattern"
                    name="recurrence_pattern"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={formData.recurrence_pattern}
                    onChange={handleChange}
                  >
                    <option value="">Выберите шаблон</option>
                    {Object.entries(RECURRENCE_PATTERN_NAMES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="recurrence_end_date" className="block text-sm font-medium text-gray-700">
                    Дата окончания повторений
                  </label>
                  <input
                    type="date"
                    id="recurrence_end_date"
                    name="recurrence_end_date"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={formData.recurrence_end_date}
                    onChange={handleChange}
                    min={format(date, 'yyyy-MM-dd')}
                  />
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Примечания
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Дополнительная информация (необязательно)"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
              >
                {loading ? 'Бронирование...' : 'Забронировать'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReservationModal;