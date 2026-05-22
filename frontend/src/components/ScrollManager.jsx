import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollManager() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    // If the navigation has state.scrollTo (used by our Navbar for hash links on home)
    // or if there is a hash in the URL, we shouldn't force scroll to top here.
    // The component that handles the hash will take care of it.
    if (state?.scrollTo || hash) {
      return;
    }

    // Default behavior on route change: scroll to the top instantly (not smooth) 
    // to prevent the user from seeing the page scroll upwards on a new route.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, state]);

  return null;
}
