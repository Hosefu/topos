import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCurrentReservation, fetchUpcomingReservations } from '../store/reservationsSlice';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DESK_STATUS_COLORS, RESERVATION_STATUS_COLORS } from '../config';
import ReservationCard from '../components/reservations/ReservationCard';
import StatCard from '../components/dashboard/StatCard';
import axios from 'axios';
import { API_URL } from '../config';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentReservation, upcomingReservations, loading } = useSelector(state => state.reservations);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Загружаем текущее и предстоящие бронирования
  useEffect(() => {
    dispatch(fetchCurrentReservation());
    dispatch(fetchUpcomingReservations());
  }, [dispatch]);

  // Загружаем статистику
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/office/stats/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm', { locale: ru });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
          <p className="mt-1 text-sm text-gray-500">
            Добро пожаловать, {user?.first_name || user?.username}!
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/map"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Забронировать стол
          </Link>
        </div>
      </div>

      {/* Статистика */}
      {statsLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Доступные столы"
            value={stats.desk_stats.available}
            total={stats.desk_stats.total}
            color="green"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Занятые столы"
            value={stats.desk_stats.occupied + stats.desk_stats.reserved}
            total={stats.desk_stats.total}
            color="red"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Активных бронирований"
            value={stats.reservation_stats.active_now}
            prev={stats.reservation_stats.today_total}
            isIncreaseGood={false}
            color="blue"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Загруженность офиса"
            value={Math.round((stats.desk_stats.occupied + stats.desk_stats.reserved) / stats.desk_stats.total * 100)}
            unit="%"
            color="yellow"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      ) : null}

      {/* Текущее бронирование */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Текущее бронирование</h2>
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </div>
        ) : currentReservation ? (
          <ReservationCard reservation={currentReservation} isCurrent={true} />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет активных бронирований</h3>
                <p className="mt-1 text-sm text-gray-500">Сейчас у вас нет активного бронирования.</p>
                <div className="mt-6">
                  <Link
                    to="/map"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Забронировать стол
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Предстоящие бронирования */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Предстоящие бронирования</h2>
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </div>
        ) : upcomingReservations && upcomingReservations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingReservations.slice(0, 3).map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет предстоящих бронирований</h3>
                <p className="mt-1 text-sm text-gray-500">У вас нет запланированных бронирований на ближайшее время.</p>
                <div className="mt-6">
                  <Link
                    to="/map"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Забронировать стол
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {upcomingReservations && upcomingReservations.length > 3 && (
          <div className="text-center mt-4">
            <Link to="/reservations" className="text-primary-600 hover:text-primary-700 font-medium">
              Посмотреть все бронирования
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;