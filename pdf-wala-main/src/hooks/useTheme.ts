import { useEffect, useState } from 'react';
import { useStore } from '../store/appStore';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useStore();

  useEffect(() => {
    setMounted(true);
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let effectiveTheme = theme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    mounted,
  };
};
