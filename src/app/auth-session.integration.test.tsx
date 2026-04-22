import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  adminSession,
  makeJsonResponse,
  persistedService,
  renderAppAtRoute,
  resetAppTestState,
  seedSession,
  stubFetch
} from '../test/integration-helpers';
import { ADMIN_STORAGE_KEY } from '../shared/config/content';

describe('auth and session integration', () => {
  beforeEach(() => {
    resetAppTestState();
  });

  afterEach(() => {
    resetAppTestState();
  });

  it('redirects unauthenticated users away from admin route', async () => {
    stubFetch(() => Promise.resolve(makeJsonResponse([])));

    renderAppAtRoute('/admin');

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(
      await screen.findByRole('heading', { name: /доступ к управлению каталогом через защищённую авторизацию/i })
    ).toBeInTheDocument();
  });

  it('logs in and redirects back to the protected admin route', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/auth/login')) {
        expect(options?.method).toBe('POST');
        return Promise.resolve(
          makeJsonResponse({
            token: adminSession.token,
            user: adminSession.user
          })
        );
      }

      if (String(url).includes('/api/services')) {
        return Promise.resolve(makeJsonResponse([persistedService]));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await user.type(await screen.findByLabelText(/email/i), 'admin@avtoshop.ru');
    await user.type(screen.getByLabelText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти в админ-панель/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/admin');
    });
    expect(JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) as string)).toEqual(adminSession);
    expect(await screen.findByRole('heading', { name: /управление услугами/i })).toBeInTheDocument();
  });

  it('shows a backend error and keeps the user on login when auth fails', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request) => {
      if (String(url).includes('/api/auth/login')) {
        return Promise.resolve(
          makeJsonResponse(
            {
              error: { message: 'Неверный логин или пароль.' }
            },
            { ok: false, status: 401 }
          )
        );
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/login');

    await user.type(await screen.findByLabelText(/email/i), 'admin@avtoshop.ru');
    await user.type(screen.getByLabelText(/пароль/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /войти в админ-панель/i }));

    expect(await screen.findByText(/неверный логин или пароль/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('restores a persisted session and opens admin directly', async () => {
    seedSession();

    stubFetch((url: string | URL | Request) => {
      if (String(url).includes('/api/services')) {
        return Promise.resolve(makeJsonResponse([persistedService]));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    expect(await screen.findByRole('heading', { name: /управление услугами/i })).toBeInTheDocument();
    expect(screen.getAllByText(/диагностика/i).length).toBeGreaterThan(0);
  });

  it('clears auth and redirects to login when a protected admin write returns 401', async () => {
    const user = userEvent.setup();
    seedSession();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService]));
      }

      if (String(url).includes('/api/services') && options?.method === 'POST') {
        return Promise.resolve(
          makeJsonResponse(
            {
              error: { message: 'Сессия истекла.' }
            },
            { ok: false, status: 401 }
          )
        );
      }

      if (String(url).includes('/api/auth/logout')) {
        return Promise.resolve(makeJsonResponse({}));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.type(screen.getByPlaceholderText(/название услуги/i), 'Новая услуга');
    await user.type(screen.getByPlaceholderText(/код иконки или метка/i), 'tool');
    await user.type(screen.getByPlaceholderText(/описание услуги/i), 'Описание');
    await user.type(screen.getByPlaceholderText(/^цена$/i), '1000 ₽');
    await user.click(screen.getByRole('button', { name: /добавить услугу/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('clears the stored session even when backend logout fails', async () => {
    const user = userEvent.setup();
    seedSession();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService]));
      }

      if (String(url).includes('/api/auth/logout')) {
        return Promise.reject(new Error('offline'));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.click(screen.getByRole('button', { name: /выйти/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });
});
