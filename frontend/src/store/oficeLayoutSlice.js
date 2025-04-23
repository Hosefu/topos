import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

// Начальное состояние
const initialState = {
  layouts: [],
  currentLayout: null,
  elements: [],
  loading: false,
  error: null,
};

// Асинхронный thunk для получения всех схем офиса
export const fetchOfficeLayouts = createAsyncThunk(
  'officeLayout/fetchOfficeLayouts',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/office/layouts/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки схем офиса');
    }
  }
);

// Асинхронный thunk для получения активных схем офиса
export const fetchActiveLayouts = createAsyncThunk(
  'officeLayout/fetchActiveLayouts',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/office/layouts/active/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки активных схем офиса');
    }
  }
);

// Асинхронный thunk для получения подробной информации о схеме офиса
export const fetchLayoutDetail = createAsyncThunk(
  'officeLayout/fetchLayoutDetail',
  async (layoutId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/office/layouts/${layoutId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки информации о схеме офиса');
    }
  }
);

// Асинхронный thunk для получения элементов схемы офиса
export const fetchLayoutElements = createAsyncThunk(
  'officeLayout/fetchLayoutElements',
  async (layoutId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.get(`${API_URL}/api/office/elements/?layout=${layoutId}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки элементов схемы офиса');
    }
  }
);

// Асинхронный thunk для обновления позиций столов на схеме офиса
export const updateDesksPositions = createAsyncThunk(
  'officeLayout/updateDesksPositions',
  async ({ layoutId, desksData }, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/office/layouts/${layoutId}/update_desks_positions/`,
        { desks: desksData },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления позиций столов');
    }
  }
);

// Создаем slice
const officeLayoutSlice = createSlice({
  name: 'officeLayout',
  initialState,
  reducers: {
    setCurrentLayout: (state, action) => {
      state.currentLayout = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOfficeLayouts
      .addCase(fetchOfficeLayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficeLayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.layouts = action.payload;
        
        // Если нет текущей схемы, устанавливаем первую активную
        if (!state.currentLayout && action.payload.length > 0) {
          const activeLayout = action.payload.find(layout => layout.is_active);
          state.currentLayout = activeLayout || action.payload[0];
        }
      })
      .addCase(fetchOfficeLayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchActiveLayouts
      .addCase(fetchActiveLayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveLayouts.fulfilled, (state, action) => {
        state.loading = false;
        
        // Обновляем только активные схемы
        const activeLayouts = action.payload;
        
        // Объединяем с существующими
        const nonActiveLayouts = state.layouts.filter(layout => 
          !activeLayouts.some(activeLayout => activeLayout.id === layout.id)
        );
        
        state.layouts = [...activeLayouts, ...nonActiveLayouts];
        
        // Если нет текущей схемы, устанавливаем первую активную
        if (!state.currentLayout && activeLayouts.length > 0) {
          state.currentLayout = activeLayouts[0];
        }
      })
      .addCase(fetchActiveLayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchLayoutDetail
      .addCase(fetchLayoutDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLayoutDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLayout = action.payload;
        
        // Обновляем схему в общем списке, если она там есть
        const layoutIndex = state.layouts.findIndex(l => l.id === action.payload.id);
        if (layoutIndex !== -1) {
          state.layouts[layoutIndex] = action.payload;
        } else {
          state.layouts.push(action.payload);
        }
        
        // Обновляем элементы, если они есть в ответе
        if (action.payload.elements) {
          state.elements = action.payload.elements;
        }
      })
      .addCase(fetchLayoutDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchLayoutElements
      .addCase(fetchLayoutElements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLayoutElements.fulfilled, (state, action) => {
        state.loading = false;
        state.elements = action.payload;
      })
      .addCase(fetchLayoutElements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateDesksPositions
      .addCase(updateDesksPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDesksPositions.fulfilled, (state, action) => {
        state.loading = false;
        // Обновления происходят на сервере, здесь дополнительные действия не нужны
      })
      .addCase(updateDesksPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentLayout } = officeLayoutSlice.actions;

export default officeLayoutSlice.reducer;