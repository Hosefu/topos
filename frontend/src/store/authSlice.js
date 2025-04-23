import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

// Начальное состояние
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

// Асинхронный thunk для проверки авторизации
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    if (!token) {
      return rejectWithValue('Нет токена авторизации');
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/users/me/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      // Удаляем невалидный токен
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.detail || 'Ошибка авторизации');
    }
  }
);

// Асинхронный thunk для авторизации через Telegram
export const telegramLogin = createAsyncThunk(
  'auth/telegramLogin',
  async (telegramData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/telegram-login/`, telegramData);
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка авторизации через Telegram');
    }
  }
);

// Асинхронный thunk для обновления профиля пользователя
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.put(`${API_URL}/api/users/update_me/`, userData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления профиля');
    }
  }
);

// Асинхронный thunk для обновления предпочтений пользователя
export const updateUserPreferences = createAsyncThunk(
  'auth/updateUserPreferences',
  async (preferences, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    try {
      const response = await axios.put(`${API_URL}/api/users/preferences/`, preferences, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления предпочтений');
    }
  }
);

// Создаем slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Удаляем токен из localStorage при выходе
      localStorage.removeItem('token');
      
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // telegramLogin
      .addCase(telegramLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(telegramLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(telegramLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateUserPreferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.preference = action.payload;
        }
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;