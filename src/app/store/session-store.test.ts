const { logoutAdminMock } = vi.hoisted(() => ({
  logoutAdminMock: vi.fn()
}));

vi.mock('../../shared/api/auth-api', () => ({
  logoutAdmin: logoutAdminMock
}));

import { ADMIN_STORAGE_KEY } from '../../shared/config/content';
import type { AuthSession } from '../../shared/model/types';
import { SessionStore } from './session-store';

const session: AuthSession = {
  token: 'token',
  user: {
    id: 1,
    email: 'admin@avtoshop.ru',
    role: 'admin'
  }
};

describe('SessionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    logoutAdminMock.mockReset();
  });

  it('restores a valid persisted session', () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));

    const store = new SessionStore();

    expect(store.session).toEqual(session);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('token');
  });

  it('clears invalid json from storage', () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, '{broken');

    const store = new SessionStore();

    expect(store.session).toBeNull();
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('clears incomplete sessions from storage', () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ token: 'token' }));

    const store = new SessionStore();

    expect(store.session).toBeNull();
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('persists login state', () => {
    const store = new SessionStore();

    store.login(session);

    expect(store.session).toEqual(session);
    expect(JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) as string)).toEqual(session);
  });

  it('clears storage after successful logout', async () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    logoutAdminMock.mockResolvedValue(undefined);
    const store = new SessionStore();

    await store.logout();

    expect(logoutAdminMock).toHaveBeenCalledWith('token');
    expect(store.session).toBeNull();
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('still clears storage when backend logout fails', async () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    logoutAdminMock.mockRejectedValue(new Error('offline'));
    const store = new SessionStore();

    await store.logout();

    expect(logoutAdminMock).toHaveBeenCalledWith('token');
    expect(store.session).toBeNull();
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });
});
