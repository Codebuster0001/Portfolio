import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiSlice } from './store/apiSlice';
import { PortfolioDataProvider } from './context/PortfolioDataContext';
import { ToastProvider } from './components/ui/Toast';
import LoginGate from './pages/LoginGate';
import GlobalLoader from './components/ui/GlobalLoader';
import ScrollManager from './components/ScrollManager';

// Lazy load AdminDashboard for code splitting
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('admin_token');
  });
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Preload critical admin APIs if authenticated
  useEffect(() => {
    const preloadAdminData = async () => {
      if (!isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      try {
        // We only preload critical authentication or lightweight shell data here.
        // Heavy data grids will use Skeletons.
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error("Failed to preload admin data", err);
      } finally {
        setTimeout(() => setIsInitializing(false), 800);
      }
    };
    
    preloadAdminData();
  }, [isAuthenticated, dispatch]);

  // Sync state if localstorage changes
  useEffect(() => {
    const isAuth = !!localStorage.getItem('admin_token');
    if (isAuthenticated !== isAuth) {
      setIsAuthenticated(isAuth);
    }
  }, [location.pathname]);

  const handleAccessGranted = () => {
    // The token is saved in LoginGate, so we just set auth state
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>
      <GlobalLoader isLoading={isInitializing} />
      
      {!isInitializing && (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
          <ScrollManager />
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginGate onAccessGranted={handleAccessGranted} />
              }
            />
            <Route
              path="/reset-password"
              element={<LoginGate onAccessGranted={handleAccessGranted} />}
            />
            {/* All dashboard pages as flat routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AdminDashboard onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      )}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioDataProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </PortfolioDataProvider>
    </BrowserRouter>
  );
}
