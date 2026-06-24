import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export const useAuth = () => {
  const {
    user: auth0User,
    isAuthenticated: isAuth0Authenticated,
    isLoading: isAuth0Loading,
    error,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const storeAuth = useAuthStore();

  const isAuthenticated = isAuth0Authenticated || storeAuth.isAuthenticated;
  const isLoading = isAuth0Loading || storeAuth.isLoading;

  const user: User | null = isAuth0Authenticated && auth0User
    ? {
        id: auth0User.sub || '',
        name: auth0User.name || auth0User.nickname || auth0User.email?.split('@')[0] || 'User',
        email: auth0User.email || '',
        subscription: 'free',
        createdAt: new Date().toISOString(),
      }
    : storeAuth.user;

  const login = async () => {
    await loginWithRedirect();
  };

  const signup = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  const logout = () => {
    if (isAuth0Authenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } else {
      storeAuth.logout();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loginWithEmail: storeAuth.login,
    signupWithEmail: storeAuth.signup,
  };
};
