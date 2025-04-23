import React, { useState, useEffect, useRef } from 'react';
import { WORKING_HOURS, TIME_STEP } from '../../config';

const TimeRangePicker = ({ timeRange, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState(timeRange?.start || '09:00');
  const [selectedEnd, setSelectedEnd] = useState(timeRange?.end || '18:00');
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  // Закрываем выпадающий список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Устанавливаем начальные значения при изменении пропсов
  useEffect(() => {
    if (timeRange) {
      setSelectedStart(timeRange.start);
      setSelectedEnd(timeRange.end);
    }
  }, [timeRange]);

  // Генерируем список времени с заданным шагом
  const generateTimeOptions = () => {
    const options = [];
    const startHour = WORKING_HOURS.start;
    const endHour = WORKING_HOURS.end;
    
    // Кол-во минут в одном шаге
    const minutesStep = TIME_STEP;
    // Количество шагов в одном часе
    const stepsPerHour = 60 / minutesStep;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let step = 0; step < stepsPerHour; step++) {
        // Пропускаем последний шаг конечного часа
        if (hour === endHour && step > 0) continue;
        
        const minutes = step * minutesStep;
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinutes}`;
        
        options.push(time);
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Обработчик изменения времени начала
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    setSelectedStart(newStart);
    
    // Проверяем, что время начала меньше времени окончания
    if (newStart >= selectedEnd) {
      setError('Время начала должно быть меньше времени окончания');
    } else {
      setError('');
      onChange({ start: newStart, end: selectedEnd });
    }
  };

  // Обработчик изменения времени окончания
  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    setSelectedEnd(newEnd);
    
    // Проверяем, что время окончания больше времени начала
    if (selectedStart >= newEnd) {
      setError('Время окончания должно быть больше времени начала');
    } else {
      setError('');
      onChange({ start: selectedStart, end: newEnd });
    }
  };

  // Обработчик применения выбранного диапазона
  const handleApply = () => {
    if (selectedStart >= selectedEnd) {
      setError('Время начала должно быть меньше времени окончания');
      return;
    }
    
    setError('');
    onChange({ start: selectedStart, end: selectedEnd });
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {timeRange ? `${timeRange.start} - ${timeRange.end}` : 'Выберите время'}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                  Начало
                </label>
                <select
                  id="start-time"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={selectedStart}
                  onChange={handleStartChange}
                >
                  {timeOptions.map((time) => (
                    <option key={`start-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                  Окончание
                </label>
                <select
                  id="end-time"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={selectedEnd}
                  onChange={handleEndChange}
                >
                  {timeOptions.map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleApply}
                disabled={!!error}
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangePicker;