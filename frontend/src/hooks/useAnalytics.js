import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

export function useAnalytics() {
  const location = useLocation();

  // Initialize GA once on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    const path = location.pathname + location.search;
    // Attempt to extract title, defaulting to document title or path
    const title = document.title || path;
    trackPageView(path, title);
  }, [location]);
}
