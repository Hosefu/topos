import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';

const DatePicker = ({ selectedDate, onChange, minDate, maxDate, className = '' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Закрываем календарь при клике вне компонента
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

  // Переход к предыдущему месяцу
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Переход к следующему месяцу
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Выбор даты
  const onDateClick = (day) => {
    onChange(day);
    setIsOpen(false);
  };

  // Проверка, можно ли выбрать дату
  const isDisabled = (day) => {
    if (minDate && isBefore(day, minDate)) {
      return true;
    }
    if (maxDate && isBefore(maxDate, day)) {
      return true;
    }
    return false;
  };

  // Рендер дней недели
  const renderDaysOfWeek = () => {
    const days = [];
    let startDate = startOfWeek(new Date(), { locale: ru });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-medium text-gray-500 uppercase">
          {format(addDays(startDate, i), 'EEE', { locale: ru })}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-1">{days}</div>;
  };

  // Рендер дней месяца
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ru });
    const endDate = endOfWeek(monthEnd, { locale: ru });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentDay = isToday(day);
        const disabled = isDisabled(day);

        days.push(
          <div
            key={day.toString()}
            className={`text-center py-1 ${isCurrentMonth ? '' : 'text-gray-300'} ${
              isSelected
                ? 'bg-primary-600 text-white rounded-full'
                : isCurrentDay
                ? 'bg-primary-100 text-primary-600 rounded-full'
                : ''
            }`}
          >
            <button
              type="button"
              className={`w-8 h-8 inline-flex items-center justify-center ${
                disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 rounded-full'
              }`}
              onClick={() => !disabled && onDateClick(cloneDay)}
              disabled={disabled}
            >
              {formattedDate}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mt-1">{rows}</div>;
  };

  // Рендер заголовка календаря
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-sm font-medium text-gray-800">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedDate ? format(selectedDate, 'PPP', { locale: ru }) : 'Выберите дату'}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          {renderHeader()}
          {renderDaysOfWeek()}
          {renderDays()}
        </div>
      )}
    </div>
  );
};

export default DatePicker;