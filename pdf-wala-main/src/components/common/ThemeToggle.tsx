import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const isDarkMode =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full transition-colors border-2"
      style={{
        backgroundColor: isDark ? '#2d3748' : '#ffd89b',
        borderColor: isDark ? '#4a5568' : '#e6c200',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated toggle circle */}
      <motion.div
        animate={{
          x: isDark ? 36 : 2,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-gray-900" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
};
