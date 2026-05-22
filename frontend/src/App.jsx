import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { portfolioApi } from './store/portfolioApi';
import Layout from './layout/Layout';
import GlobalLoader from './components/ui/GlobalLoader';
import ScrollManager from './components/ScrollManager';

// Lazy load components for route-based code splitting
const Home = React.lazy(() => import('./pages/Home'));
const AllProjects = React.lazy(() => import('./pages/AllProjects'));
const ProjectDetails = React.lazy(() => import('./pages/ProjectDetails'));
const AdminSkills = React.lazy(() => import('./pages/AdminSkills'));

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Preload critical APIs to avoid mid-page loading spinners
    const preloadCriticalData = async () => {
      try {
        await Promise.all([
          dispatch(portfolioApi.endpoints.getHero.initiate()).unwrap(),
          dispatch(portfolioApi.endpoints.getAboutContent.initiate()).unwrap(),
        ]);
      } catch (err) {
        console.error("Failed to preload some data", err);
      } finally {
        // Ensure the splash screen shows for at least 800ms to avoid flashing
        setTimeout(() => setIsInitializing(false), 800);
      }
    };
    preloadCriticalData();
  }, [dispatch]);

  return (
    <>
      <GlobalLoader isLoading={isInitializing} />
      
      {!isInitializing && (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <ScrollManager />
          <Routes>
            {/* ── Public portfolio routes ── */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="works" element={<AllProjects />} />
              <Route path="works/:id" element={<ProjectDetails />} />
              <Route path="*" element={<Home />} />
            </Route>

            {/* ── Admin routes (JWT-protected inside the page) ── */}
            <Route path="/admin/skills" element={<AdminSkills />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;
