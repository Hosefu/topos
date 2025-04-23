import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  fetchActiveLayouts, 
  fetchLayoutDetail, 
  setCurrentLayout 
} from '../store/officeLayoutSlice';
import { 
  fetchAvailableDesks, 
  selectDesk, 
  clearSelectedDesk 
} from '../store/desksSlice';
import { 
  setSelectedDate, 
  setTimeRange, 
  openModal 
} from '../store/uiSlice';
import OfficeMap from '../components/map/OfficeMap';
import DatePicker from '../components/common/DatePicker';
import TimeRangePicker from '../components/common/TimeRangePicker';
import DeskDetail from '../components/map/DeskDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OfficeMapPage = () => {
  const dispatch = useDispatch();
  const { layouts, currentLayout, loading: layoutLoading } = useSelector(state => state.officeLayout);
  const { availableDesks, selectedDesk, loading: desksLoading } = useSelector(state => state.desks);
  const { selectedDate, timeRange } = useSelector(state => state.ui);
  const [selectedFloor, setSelectedFloor] = useState(null);

  // Загружаем активные схемы офиса при монтировании
  useEffect(() => {
    dispatch(fetchActiveLayouts());
  }, [dispatch]);

  // Устанавливаем текущий этаж, когда загружены схемы
  useEffect(() => {
    if (layouts.length > 0 && !selectedFloor) {
      setSelectedFloor(layouts[0].floor);
    }
  }, [layouts, selectedFloor]);

  // Загружаем детали схемы для выбранного этажа
  useEffect(() => {
    if (selectedFloor) {
      const layout = layouts.find(l => l.floor === selectedFloor);
      if (layout) {
        dispatch(setCurrentLayout(layout));
        dispatch(fetchLayoutDetail(layout.id));
      }
    }
  }, [dispatch, layouts, selectedFloor]);

  // Загружаем доступные столы при изменении даты или времени
  useEffect(() => {
    if (selectedDate) {
      const date = format(selectedDate, 'yyyy-MM-dd');
      dispatch(fetchAvailableDesks({ 
        date, 
        timeFrom: timeRange.start,
        timeTo: timeRange.end
      }));
    }
  }, [dispatch, selectedDate, timeRange]);

  // Обработчик выбора этажа
  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    dispatch(clearSelectedDesk());
  };

  // Обработчик выбора даты
  const handleDateChange = (date) => {
    dispatch(setSelectedDate(date));
    dispatch(clearSelectedDesk());
  };

  // Обработчик выбора времени
  const handleTimeRangeChange = (range) => {
    dispatch(setTimeRange(range));
    dispatch(clearSelectedDesk());
  };

  // Обработчик выбора стола
  const handleDeskSelect = (desk) => {
    dispatch(selectDesk(desk));
  };

  // Обработчик бронирования стола
  const handleBookDesk = () => {
    if (selectedDesk) {
      dispatch(openModal({
        type: 'createReservation',
        props: {
          desk: selectedDesk,
          date: selectedDate,
          timeRange: timeRange
        }
      }));
    }
  };

  // Форматирование даты для отображения
  const formattedDate = selectedDate 
    ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ru })
    : '';

  // Получение списка уникальных этажей
  const availableFloors = [...new Set(layouts.map(layout => layout.floor))].sort();

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Карта офиса</h1>
        <p className="mt-1 text-sm text-gray-500">
          Выберите стол для бронирования
        </p>
      </div>

      {/* Фильтры и выбор даты/времени */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Выбор этажа */}
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
              Этаж
            </label>
            <select
              id="floor"
              name="floor"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedFloor || ''}
              onChange={(e) => handleFloorChange(Number(e.target.value))}
              disabled={layoutLoading || availableFloors.length === 0}
            >
              {availableFloors.length === 0 ? (
                <option value="">Нет доступных этажей</option>
              ) : (
                availableFloors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor} этаж
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Выбор даты */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Дата
            </label>
            <DatePicker
              selectedDate={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              className="mt-1"
            />
          </div>

          {/* Выбор времени */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Время
            </label>
            <TimeRangePicker
              timeRange={timeRange}
              onChange={handleTimeRangeChange}
              className="mt-1"
            />
          </div>

          {/* Информация о выборе */}
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              {formattedDate && (
                <p>
                  Выбрано: <span className="font-medium">{formattedDate}</span>
                </p>
              )}
              {timeRange && (
                <p>
                  Время: <span className="font-medium">{timeRange.start} - {timeRange.end}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Карта офиса */}
        <div className="lg:col-span-3 bg-white shadow rounded-lg p-4 h-[600px] overflow-hidden">
          {layoutLoading || desksLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="large" />
            </div>
          ) : currentLayout ? (
            <OfficeMap
              layout={currentLayout}
              desks={availableDesks}
              selectedDesk={selectedDesk}
              onDeskSelect={handleDeskSelect}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Выберите этаж для отображения карты</p>
            </div>
          )}
        </div>

        {/* Информация о выбранном столе */}
        <div className="lg:col-span-1">
          <DeskDetail
            desk={selectedDesk}
            onBookDesk={handleBookDesk}
            date={selectedDate}
            timeRange={timeRange}
          />
        </div>
      </div>

      {/* Легенда */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Легенда</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Доступен</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Занят</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">Зарезервирован</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-gray-500 mr-2"></div>
            <span className="text-sm text-gray-600">На обслуживании</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeMapPage;