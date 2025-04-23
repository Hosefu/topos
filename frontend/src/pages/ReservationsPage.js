import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserReservations } from '../store/reservationsSlice';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { RESERVATION_STATUSES } from '../config';
import ReservationCard from '../components/reservations/ReservationCard';
import FilterTabs from '../components/common/FilterTabs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const ReservationsPage = () => {
  const dispatch = useDispatch();
  const { reservations, loading } = useSelector(state => state.reservations);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filteredReservations, setFilteredReservations] = useState([]);

  // Загружаем бронирования при монтировании
  useEffect(() => {
    dispatch(fetchUserReservations());
  }, [dispatch]);

  // Фильтруем бронирования при изменении вкладки или списка бронирований
  useEffect(() => {
    if (reservations.length > 0) {
      const now = new Date();
      
      let filtered = [];
      
      switch (activeTab) {
        case 'upcoming':
          // Предстоящие активные бронирования
          filtered = reservations.filter(res => 
            res.status === RESERVATION_STATUSES.ACTIVE && 
            isAfter(parseISO(res.start_time), now)
          );
          // Сортируем по дате начала (ближайшие сначала)
          filtered.sort((a, b) => parseISO(a.start_time) - parseISO(b.start_time));
          break;
          
        case 'active':
          // Текущие активные бронирования
          filtered = reservations.filter(res => 
            res.status === RESERVATION_STATUSES.ACTIVE && 
            isBefore(parseISO(res.start_time), now) && 
            isAfter(parseISO(res.end_time), now)
          );
          break;
          
        case 'today':
          // Все бронирования на сегодня
          filtered = reservations.filter(res => 
            isToday(parseISO(res.start_time))
          );
          // Сортируем по дате начала
          filtered.sort((a, b) => parseISO(a.start_time) - parseISO(b.start_time));
          break;
          
        case 'past':
          // Прошедшие бронирования
          filtered = reservations.filter(res => 
            res.status !== RESERVATION_STATUSES.ACTIVE || 
            isBefore(parseISO(res.end_time), now)
          );
          // Сортируем по дате начала (более поздние сначала)
          filtered.sort((a, b) => parseISO(b.start_time) - parseISO(a.start_time));
          break;
          
        default:
          filtered = reservations;
          // Сортируем по дате начала (более поздние сначала)
          filtered.sort((a, b) => parseISO(b.start_time) - parseISO(a.start_time));
      }
      
      setFilteredReservations(filtered);
    } else {
      setFilteredReservations([]);
    }
  }, [activeTab, reservations]);

  // Вкладки фильтрации
  const tabs = [
    { id: 'upcoming', label: 'Предстоящие' },
    { id: 'active', label: 'Текущие' },
    { id: 'today', label: 'Сегодня' },
    { id: 'past', label: 'История' },
  ];

  // Группировка бронирований по дате
  const groupReservationsByDate = (reservations) => {
    const groups = {};
    
    reservations.forEach(reservation => {
      const dateKey = format(parseISO(reservation.start_time), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(reservation);
    });
    
    return groups;
  };

  const reservationGroups = groupReservationsByDate(filteredReservations);

  // Форматирование даты группы
  const formatGroupDate = (dateKey) => {
    const date = parseISO(dateKey);
    
    if (isToday(date)) {
      return 'Сегодня';
    }
    
    return format(date, 'd MMMM yyyy', { locale: ru });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои бронирования</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление бронированиями рабочих мест
        </p>
      </div>

      {/* Вкладки фильтрации */}
      <FilterTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Список бронирований */}
      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(reservationGroups)
            .sort((a, b) => {
              if (activeTab === 'past') {
                return b.localeCompare(a); // Для истории показываем новые сначала
              }
              return a.localeCompare(b); // Для остальных вкладок показываем старые сначала
            })
            .map(dateKey => (
              <div key={dateKey} className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {formatGroupDate(dateKey)}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {reservationGroups[dateKey].map(reservation => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      isCurrent={activeTab === 'active'}
                    />
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <EmptyState
          title="Нет бронирований"
          description={`У вас нет ${activeTab === 'past' ? 'прошедших' : 'активных'} бронирований.`}
          icon={
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          actionText={activeTab !== 'past' ? "Забронировать стол" : undefined}
          actionLink={activeTab !== 'past' ? "/map" : undefined}
        />
      )}
    </div>
  );
};

export default ReservationsPage;