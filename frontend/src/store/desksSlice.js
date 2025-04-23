import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

// Начальное состояние
const initialState = {
  desks: [],
  selectedDesk: null,
  availableDesks: [],
  areas: [],
  loading: false,
  error: null,
};

// Асинхронный thunk для получения всех столов
export const fetchDesks = createAsyncThunk(
  'desks/fetchDesks',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/desks/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки столов');
    }
  }
);

// Асинхронный thunk для получения доступных столов на указанную дату
export const fetchAvailableDesks = createAsyncThunk(
  'desks/fetchAvailableDesks',
  async ({ date, timeFrom, timeTo }, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      let url = `${API_URL}/api/desks/available/?date=${date}`;
      
      if (timeFrom) {
        url += `&time_from=${timeFrom}`;
      }
      
      if (timeTo) {
        url += `&time_to=${timeTo}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки доступных столов');
    }
  }
);

// Асинхронный thunk для получения подробной информации о столе
export const fetchDeskDetail = createAsyncThunk(
  'desks/fetchDeskDetail',
  async (deskId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/desks/${deskId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки информации о столе');
    }
  }
);

// Асинхронный thunk для получения зон офиса
export const fetchAreas = createAsyncThunk(
  'desks/fetchAreas',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/desks/areas/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки зон офиса');
    }
  }
);

// Создаем slice
const desksSlice = createSlice({
  name: 'desks',
  initialState,
  reducers: {
    selectDesk: (state, action) => {
      state.selectedDesk = action.payload;
    },
    clearSelectedDesk: (state) => {
      state.selectedDesk = null;
    },
    updateDeskStatus: (state, action) => {
      const { deskId, status } = action.payload;
      const desk = state.desks.find(d => d.id === deskId);
      
      if (desk) {
        desk.status = status;
      }
      
      // Также обновляем в availableDesks, если есть
      const availableDesk = state.availableDesks.find(d => d.id === deskId);
      if (availableDesk) {
        availableDesk.status = status;
      }
      
      // Обновляем selectedDesk, если выбран
      if (state.selectedDesk && state.selectedDesk.id === deskId) {
        state.selectedDesk.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDesks
      .addCase(fetchDesks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesks.fulfilled, (state, action) => {
        state.loading = false;
        state.desks = action.payload;
      })
      .addCase(fetchDesks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchAvailableDesks
      .addCase(fetchAvailableDesks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableDesks.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDesks = action.payload;
      })
      .addCase(fetchAvailableDesks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchDeskDetail
      .addCase(fetchDeskDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeskDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDesk = action.payload;
        
        // Обновляем стол в общем списке, если он там есть
        const deskIndex = state.desks.findIndex(d => d.id === action.payload.id);
        if (deskIndex !== -1) {
          state.desks[deskIndex] = { ...state.desks[deskIndex], ...action.payload };
        }
      })
      .addCase(fetchDeskDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchAreas
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectDesk, clearSelectedDesk, updateDeskStatus } = desksSlice.actions;

export default desksSlice.reducer;