import { ADMIN_STORAGE_KEY } from './constants';

const AUTH_EVENT = 'avtoshop-auth-change';

export const getAdminAuthState = () =>
  typeof window !== 'undefined' &&
  window.localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';

export const setAdminAuthState = (isAdmin) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isAdmin) {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
  } else {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const subscribeToAdminAuth = (callback) => {
  const handler = () => callback(getAdminAuthState());

  window.addEventListener('storage', handler);
  window.addEventListener(AUTH_EVENT, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
};
