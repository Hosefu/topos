import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { checkAuth } from './store/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import OfficeMapPage from './pages/OfficeMapPage';
import ReservationsPage from './pages/ReservationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ModalContainer from './components/modals/ModalContainer';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  
  // Check authentication on app load
  useEffect(() => {
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch, token]);
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="map" element={<OfficeMapPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Global modals */}
      <ModalContainer />
    </>
  );
};

export default App;