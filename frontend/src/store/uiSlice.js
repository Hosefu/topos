import { createSlice } from '@reduxjs/toolkit';

// Начальное состояние
const initialState = {
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  modalProps: {},
  notifications: [],
  selectedDate: new Date(),
  timeRange: {
    start: '09:00',
    end: '18:00',
  },
};

// Создаем slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
      state.modalProps = action.payload.props || {};
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalProps = {};
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        title: action.payload.title || '',
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
      };
      
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setSelectedDate,
  setTimeRange,
} = uiSlice.actions;

export default uiSlice.reducer;