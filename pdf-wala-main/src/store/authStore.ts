import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Simulate API network request
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Basic check for UI simulation
          if (!email.includes('@') || password.length < 6) {
            throw new Error('Invalid email or password must be at least 6 characters.');
          }

          const mockUser: User = {
            id: 'usr_mock123',
            name: email.split('@')[0]
              .replace(/[^a-zA-Z]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
            subscription: 'free',
            createdAt: new Date().toISOString(),
          };
          const mockToken = 'mock-jwt-token-xyz123';
          
          localStorage.setItem('authToken', mockToken);
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          // Simulate API network request
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (!name.trim()) {
            throw new Error('Name is required.');
          }
          if (!email.includes('@')) {
            throw new Error('Please enter a valid email address.');
          }
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
          }
          
          const mockUser: User = {
            id: 'usr_mock' + Math.random().toString(36).substring(2, 9),
            name,
            email,
            subscription: 'free',
            createdAt: new Date().toISOString(),
          };
          const mockToken = 'mock-jwt-token-xyz123';
          
          localStorage.setItem('authToken', mockToken);
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      resetPassword: async (email) => {
        set({ isLoading: true });
        try {
          // Simulate API network request
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!email.includes('@')) {
            throw new Error('Please enter a valid email address.');
          }
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'docforge-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
