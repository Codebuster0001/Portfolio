import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default to dark until calculated

  useEffect(() => {
    const calculateTheme = () => {
      // Get current UTC time
      const now = new Date();
      
      // Convert to IST (UTC +5:30)
      const utcOffset = now.getTimezoneOffset() * 60000;
      const istOffset = 5.5 * 60 * 60000;
      const istTime = new Date(now.getTime() + utcOffset + istOffset);
      
      const hours = istTime.getHours();
      
      // Light mode from 6 AM to 5:59 PM IST. Dark mode otherwise.
      const isDaytime = hours >= 6 && hours < 18;
      
      const newTheme = isDaytime ? 'light' : 'dark';
      setTheme(newTheme);
      
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    };

    calculateTheme();
    
    // Recalculate theme every minute to catch the transition
    const interval = setInterval(calculateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
