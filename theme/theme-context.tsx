import React, { createContext, useContext, useState, useEffect } from 'react';
import themeData from './theme.json';
import { getConfig } from '../store/config-storage';

type ThemeType = 'light' | 'dark';
type ThemeColors = typeof themeData.light;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const config = await getConfig();
      if (config?.theme) {
        setIsDark(config.theme === 'dark');
      }
    } catch (error) {
      console.error('Error loading stored theme:', error);
    }
  };

  const setTheme = (theme: ThemeType) => {
    setIsDark(theme === 'dark');
    // Theme persistence is handled by the config storage in the Preferences screen
  };

  useEffect(() => {
    // This effect will run whenever isDark changes
    console.log('Theme changed:', isDark ? 'dark' : 'light');
  }, [isDark]);

  const colors = isDark ? themeData.dark : themeData.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
