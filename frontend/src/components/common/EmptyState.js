import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title,
  description,
  icon,
  actionText,
  actionLink,
  secondaryActionText,
  secondaryActionLink,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Иконка */}
        {icon && <div className="mb-6">{icon}</div>}

        {/* Заголовок */}
        {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}

        {/* Описание */}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}

        {/* Кнопка действия */}
        {actionText && actionLink && (
          <div className="mt-6">
            <Link
              to={actionLink}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {actionText}
            </Link>
          </div>
        )}

        {/* Вторичная кнопка */}
        {secondaryActionText && secondaryActionLink && (
          <div className="mt-2">
            <Link
              to={secondaryActionLink}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              {secondaryActionText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;