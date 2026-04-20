import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminSession,
  makeJsonResponse,
  persistedService,
  renderAppAtRoute,
  resetAppTestState,
  secondaryService,
  seedSession,
  stubFetch
} from '../../test/integration-helpers';

describe('admin services integration', () => {
  beforeEach(() => {
    resetAppTestState();
    seedSession();
  });

  afterEach(() => {
    resetAppTestState();
  });

  it('loads services from the backend into the admin panel', async () => {
    stubFetch((url: string | URL | Request) => {
      if (String(url).includes('/api/services')) {
        return Promise.resolve(makeJsonResponse([persistedService, secondaryService]));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    expect(await screen.findByRole('heading', { name: /управление услугами/i })).toBeInTheDocument();
    expect(screen.getAllByText(/диагностика/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/шиномонтаж/i)).toBeInTheDocument();
    expect(screen.getAllByText(/проверка автомобиля/i).length).toBeGreaterThan(0);
  });

  it('creates a service with the bearer token and renders the new item', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService]));
      }

      if (String(url).includes('/api/services') && options?.method === 'POST') {
        expect((options?.headers as Record<string, string> | undefined)?.Authorization).toBe(`Bearer ${adminSession.token}`);

        return Promise.resolve(
          makeJsonResponse({
            id: 101,
            name: 'Новая услуга',
            icon: 'tool',
            description: 'Описание',
            price: '1000 ₽',
            createdAt: '2026-04-14T10:00:00Z',
            updatedAt: '2026-04-14T10:00:00Z'
          })
        );
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

    expect(await screen.findByText(/услуга добавлена/i)).toBeInTheDocument();
    expect(screen.getAllByText(/новая услуга/i).length).toBeGreaterThan(0);
  });

  it('updates an existing service and resets the form back to create mode', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService, secondaryService]));
      }

      if (String(url).includes('/api/services/7') && options?.method === 'PUT') {
        expect((options?.headers as Record<string, string> | undefined)?.Authorization).toBe(`Bearer ${adminSession.token}`);

        return Promise.resolve(
          makeJsonResponse({
            ...persistedService,
            name: 'Диагностика PRO',
            description: 'Расширенная проверка автомобиля',
            price: '2500 ₽'
          })
        );
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.click(screen.getByRole('button', { name: /редактировать/i }));
    expect(screen.getByRole('heading', { name: /редактирование услуги/i })).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/название услуги/i));
    await user.type(screen.getByPlaceholderText(/название услуги/i), 'Диагностика PRO');
    await user.clear(screen.getByPlaceholderText(/описание услуги/i));
    await user.type(screen.getByPlaceholderText(/описание услуги/i), 'Расширенная проверка автомобиля');
    await user.clear(screen.getByPlaceholderText(/^цена$/i));
    await user.type(screen.getByPlaceholderText(/^цена$/i), '2500 ₽');
    await user.click(screen.getByRole('button', { name: /обновить услугу/i }));

    expect(await screen.findByText(/услуга обновлена/i)).toBeInTheDocument();
    expect(screen.getAllByText(/диагностика pro/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /новая услуга/i })).toBeInTheDocument();
  });

  it('deletes a service after confirmation and removes it from the rendered list', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.fn(() => true);
    window.confirm = confirmSpy;

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService, secondaryService]));
      }

      if (String(url).includes('/api/services/7') && options?.method === 'DELETE') {
        expect((options?.headers as Record<string, string> | undefined)?.Authorization).toBe(`Bearer ${adminSession.token}`);
        return Promise.resolve(makeJsonResponse({}));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    expect(await screen.findByText(/услуга удалена/i)).toBeInTheDocument();
    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.queryByText(/^диагностика$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/шиномонтаж/i)).toBeInTheDocument();
  });

  it('switches to preview-only mode when services fall back locally', async () => {
    stubFetch(() => Promise.reject(new Error('offline')));

    renderAppAtRoute('/admin');

    expect(await screen.findByText(/режиме предпросмотра/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить услугу/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /удалить/i })).toBeDisabled();
  });

  it('keeps admin mutations enabled when the backend returns an empty service list', async () => {
    stubFetch((url: string | URL | Request) => {
      if (String(url).includes('/api/services')) {
        return Promise.resolve(makeJsonResponse([]));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    expect(await screen.findByText(/список услуг пуст/i)).toBeInTheDocument();
    expect(screen.queryByText(/режиме предпросмотра/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить услугу/i })).toBeEnabled();
  });

  it('shows backend mutation errors and keeps the current service state intact', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
      if (String(url).includes('/api/services') && !options?.method) {
        return Promise.resolve(makeJsonResponse([persistedService, secondaryService]));
      }

      if (String(url).includes('/api/services/7') && options?.method === 'PUT') {
        return Promise.resolve(
          makeJsonResponse(
            {
              error: { message: 'Не удалось сохранить изменения.' }
            },
            { ok: false, status: 400 }
          )
        );
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/admin');

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.click(screen.getByRole('button', { name: /редактировать/i }));
    await user.clear(screen.getByPlaceholderText(/описание услуги/i));
    await user.type(screen.getByPlaceholderText(/описание услуги/i), 'Ошибка сохранения');
    await user.click(screen.getByRole('button', { name: /обновить услугу/i }));

    expect(await screen.findByText(/не удалось сохранить изменения/i)).toBeInTheDocument();
    expect(screen.getAllByText(/диагностика/i).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue(/ошибка сохранения/i)).toBeInTheDocument();
  });
});
