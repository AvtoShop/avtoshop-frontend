import { ADMIN_STORAGE_KEY } from './constants';

const AUTH_EVENT = 'avtoshop-auth-change';

export const getAuthSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(ADMIN_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue);

    if (!session?.token || !session?.user) {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
};

export const getAdminAuthState = () => Boolean(getAuthSession());

export const setAuthSession = (session) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (session?.token && session?.user) {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuthSession = () => {
  setAuthSession(null);
};

export const isAuthenticated = () => Boolean(getAuthSession()?.token);

export const subscribeToAdminAuth = (callback) => {
  const handler = () => callback(getAdminAuthState());

  window.addEventListener('storage', handler);
  window.addEventListener(AUTH_EVENT, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
};
