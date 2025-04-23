import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

// Начальное состояние
const initialState = {
  reservations: [],
  currentReservation: null,
  upcomingReservations: [],
  loading: false,
  error: null,
};

// Асинхронный thunk для получения бронирований пользователя
export const fetchUserReservations = createAsyncThunk(
  'reservations/fetchUserReservations',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/reservations/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки бронирований');
    }
  }
);

// Асинхронный thunk для получения текущего бронирования
export const fetchCurrentReservation = createAsyncThunk(
  'reservations/fetchCurrentReservation',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/reservations/current/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Если нет текущего бронирования, это не ошибка
        return null;
      }
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки текущего бронирования');
    }
  }
);

// Асинхронный thunk для получения предстоящих бронирований
export const fetchUpcomingReservations = createAsyncThunk(
  'reservations/fetchUpcomingReservations',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/reservations/upcoming/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки предстоящих бронирований');
    }
  }
);

// Асинхронный thunk для создания нового бронирования
export const createReservation = createAsyncThunk(
  'reservations/createReservation',
  async (reservationData, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.post(`${API_URL}/api/reservations/`, reservationData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка создания бронирования');
    }
  }
);

// Асинхронный thunk для отметки о прибытии
export const checkInReservation = createAsyncThunk(
  'reservations/checkInReservation',
  async (reservationId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.post(`${API_URL}/api/reservations/${reservationId}/check_in/`, {}, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return { ...response.data, id: reservationId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка отметки о прибытии');
    }
  }
);

// Асинхронный thunk для отмены бронирования
export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async (reservationId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.post(`${API_URL}/api/reservations/${reservationId}/cancel/`, {}, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return { ...response.data, id: reservationId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка отмены бронирования');
    }
  }
);

// Создаем slice
const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    updateReservationStatus: (state, action) => {
      const { reservationId, status } = action.payload;
      
      // Обновляем статус в списке всех бронирований
      const reservation = state.reservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = status;
      }
      
      // Обновляем в предстоящих бронированиях
      const upcomingReservation = state.upcomingReservations.find(r => r.id === reservationId);
      if (upcomingReservation) {
        upcomingReservation.status = status;
      }
      
      // Обновляем текущее бронирование, если совпадает
      if (state.currentReservation && state.currentReservation.id === reservationId) {
        state.currentReservation.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserReservations
      .addCase(fetchUserReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchUserReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchCurrentReservation
      .addCase(fetchCurrentReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReservation = action.payload;
      })
      .addCase(fetchCurrentReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchUpcomingReservations
      .addCase(fetchUpcomingReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingReservations = action.payload;
      })
      .addCase(fetchUpcomingReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createReservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.unshift(action.payload);
        
        // Добавляем в предстоящие, если подходит по условиям
        const now = new Date();
        if (new Date(action.payload.start_time) > now && action.payload.status === 'active') {
          state.upcomingReservations.unshift(action.payload);
          // Сортируем по времени начала
          state.upcomingReservations.sort((a, b) => 
            new Date(a.start_time) - new Date(b.start_time)
          );
        }
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // checkInReservation
      .addCase(checkInReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInReservation.fulfilled, (state, action) => {
        state.loading = false;
        
        // Обновляем статус бронирования в списках
        const reservationId = action.payload.id;
        
        // В общем списке
        const reservation = state.reservations.find(r => r.id === reservationId);
        if (reservation) {
          reservation.check_in_time = new Date().toISOString();
        }
        
        // В текущем бронировании
        if (state.currentReservation && state.currentReservation.id === reservationId) {
          state.currentReservation.check_in_time = new Date().toISOString();
        }
      })
      .addCase(checkInReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // cancelReservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        
        // Обновляем статус бронирования в списках
        const reservationId = action.payload.id;
        
        // В общем списке
        const reservation = state.reservations.find(r => r.id === reservationId);
        if (reservation) {
          reservation.status = 'cancelled';
        }
        
        // В текущем бронировании
        if (state.currentReservation && state.currentReservation.id === reservationId) {
          state.currentReservation.status = 'cancelled';
        }
        
        // Удаляем из предстоящих
        state.upcomingReservations = state.upcomingReservations.filter(
          r => r.id !== reservationId
        );
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateReservationStatus } = reservationsSlice.actions;

export default reservationsSlice.reducer;