import React from 'react';

const StatCard = ({
  title,
  value,
  prev,
  total,
  unit = '',
  color = 'blue',
  icon,
  isIncreaseGood = true,
  className = '',
}) => {
  // Рассчитываем процент изменения
  const calculatePercentChange = () => {
    if (prev === undefined || prev === null || prev === 0) return null;
    const change = ((value - prev) / prev) * 100;
    return Math.round(change);
  };

  // Рассчитываем процент от общего
  const calculatePercentOfTotal = () => {
    if (total === undefined || total === null || total === 0) return null;
    return Math.round((value / total) * 100);
  };

  // Получаем процент изменения
  const percentChange = calculatePercentChange();
  // Получаем процент от общего
  const percentOfTotal = calculatePercentOfTotal();

  // Цвета в зависимости от типа
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
  };

  // Цвет для изменения: зеленый для положительного изменения, красный для отрицательного
  const getChangeColor = (change) => {
    if (change === null) return 'text-gray-500';
    
    // Для метрик, где увеличение хорошо (например, доход)
    if (isIncreaseGood) {
      return change >= 0 ? 'text-green-600' : 'text-red-600';
    }
    
    // Для метрик, где уменьшение хорошо (например, количество ошибок)
    return change <= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Иконка для изменения
  const getChangeIcon = (change) => {
    if (change === null) return null;
    
    // Для метрик, где увеличение хорошо
    if (isIncreaseGood) {
      return change >= 0 ? (
        <svg
          className="w-4 h-4 self-center"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 self-center"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    
    // Для метрик, где уменьшение хорошо
    return change <= 0 ? (
      <svg
        className="w-4 h-4 self-center"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 self-center"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`rounded-md p-3 ${
                colorClasses[color] || colorClasses.blue
              }`}
            >
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                    {unit && <span className="text-lg ml-1">{unit}</span>}
                  </div>
                  
                  {/* Процент изменения */}
                  {percentChange !== null && (
                    <div className={`ml-2 flex items-baseline text-sm ${getChangeColor(percentChange)}`}>
                      {getChangeIcon(percentChange)}
                      <span className="ml-1">{Math.abs(percentChange)}%</span>
                    </div>
                  )}
                  
                  {/* Процент от общего */}
                  {percentOfTotal !== null && percentChange === null && (
                    <div className="ml-2 text-sm text-gray-500">
                      {percentOfTotal}%
                    </div>
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Дополнительная информация */}
      {(prev !== undefined || total !== undefined) && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            {prev !== undefined && (
              <span className="text-gray-500">
                {isIncreaseGood ? 'Было' : 'Предыдущее'}: {prev}
              </span>
            )}
            {total !== undefined && (
              <span className="text-gray-500">
                {prev !== undefined && ' • '}
                Всего: {total}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;