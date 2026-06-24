// Premium Theme Configuration
export const COLORS = {
  light: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8F9FB',
      tertiary: '#F0F2F7',
      overlay: 'rgba(0, 0, 0, 0.02)',
    },
    text: {
      primary: '#0A0E27',
      secondary: '#5A6478',
      tertiary: '#8B92A9',
      inverse: '#FFFFFF',
    },
    border: '#E5E7EB',
    divider: '#F0F2F7',
    glass: 'rgba(255, 255, 255, 0.7)',
  },
  dark: {
    bg: {
      primary: '#0A0E27',
      secondary: '#14172A',
      tertiary: '#1E2240',
      overlay: 'rgba(255, 255, 255, 0.02)',
    },
    text: {
      primary: '#F5F7FB',
      secondary: '#A3AABF',
      tertiary: '#7A8294',
      inverse: '#0A0E27',
    },
    border: '#2A2F45',
    divider: '#1E2240',
    glass: 'rgba(20, 23, 42, 0.7)',
  },
  accent: {
    primary: '#6366F1',
    secondary: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
    secondary: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
    warm: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
  },
};

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
};

export const BORDER_RADIUS = {
  sm: '0.375rem', // 6px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  full: '9999px',
};

export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Inter", "Geist", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", monospace',
  },
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },
    sm: { size: '0.875rem', lineHeight: '1.25rem' },
    base: { size: '1rem', lineHeight: '1.5rem' },
    lg: { size: '1.125rem', lineHeight: '1.75rem' },
    xl: { size: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { size: '1.5rem', lineHeight: '2rem' },
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
    '5xl': { size: '3rem', lineHeight: '3.5rem' },
  },
};

export const ANIMATIONS = {
  durations: {
    instant: '50ms',
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1920px',
};
