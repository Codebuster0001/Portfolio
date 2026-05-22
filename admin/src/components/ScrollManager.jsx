import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Admin dashboard layout is a full height flex container with an overflow-y-auto main area.
    // We need to scroll the main scrollable area to top, not the window.
    const scrollContainer = document.querySelector('main.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}
