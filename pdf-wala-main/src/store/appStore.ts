import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';

interface AppStore {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // User Settings
  language: string;
  settings: UserSettings;
  
  // State Management
  isLoading: boolean;
  notification: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  clearNotification: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: true,
  compressImages: true,
  deleteAfter: 60,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial State
      theme: 'system',
      language: 'en',
      settings: defaultSettings,
      isLoading: false,
      notification: null,
      
      // Theme Actions
      setTheme: (theme) => set({ theme }),
      
      // Language & Settings Actions
      setLanguage: (language) => set({ language }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // UI State Actions
      setLoading: (loading) => set({ isLoading: loading }),
      showNotification: (type, message) =>
        set({ notification: { type, message } }),
      clearNotification: () => set({ notification: null }),
    }),
    {
      name: 'docforge-store',
    }
  )
);

// Alias for useTheme compatibility
export const useStore = useAppStore;
