import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import desksReducer from './desksSlice';
import reservationsReducer from './reservationsSlice';
import officeLayoutReducer from './officeLayoutSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    desks: desksReducer,
    reservations: reservationsReducer,
    officeLayout: officeLayoutReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Для работы с объектами Date в state
    }),
});