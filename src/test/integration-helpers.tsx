import { cleanup, render } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { ADMIN_STORAGE_KEY } from '../shared/config/content';
import type { AuthSession, Service } from '../shared/model/types';

export const makeJsonResponse = (data: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const ok = options.ok ?? true;
  const status = options.status ?? (ok ? 200 : 500);

  return {
    ok,
    status,
    json: async () => data
  };
};

export const adminSession: AuthSession = {
  token: 'test-token',
  user: {
    id: 1,
    email: 'admin@avtoshop.ru',
    role: 'admin'
  }
};

export const persistedService: Service = {
  id: 7,
  name: 'Диагностика',
  icon: 'scan',
  description: 'Проверка автомобиля',
  price: '1500 ₽',
  createdAt: '2026-04-14T10:00:00Z',
  updatedAt: '2026-04-14T10:00:00Z'
};

export const secondaryService: Service = {
  id: 8,
  name: 'Шиномонтаж',
  icon: 'wheel',
  description: 'Балансировка и сезонная замена',
  price: '2200 ₽',
  createdAt: '2026-04-15T10:00:00Z',
  updatedAt: '2026-04-15T10:00:00Z'
};

export const seedSession = (session: AuthSession = adminSession) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
};

export const renderAppAtRoute = (route: string) => {
  window.history.pushState({}, '', route);
  return render(<App />);
};

export const stubFetch = (
  handler: (url: string | URL | Request, options?: RequestInit) => Promise<unknown>
) => vi.stubGlobal('fetch', vi.fn(handler));

export const resetAppTestState = () => {
  cleanup();
  localStorage.clear();
  window.history.pushState({}, '', '/');
  window.confirm = vi.fn(() => true);
  vi.restoreAllMocks();
};
