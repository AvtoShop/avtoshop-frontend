import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ADMIN_STORAGE_KEY } from './shared/config/content';

const makeJsonResponse = (data: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const ok = options.ok ?? true;
  const status = options.status ?? (ok ? 200 : 500);

  return {
  ok,
  status,
  json: async () => data
  };
};

const adminSession = {
  token: 'test-token',
  user: {
    id: 1,
    email: 'admin@avtoshop.ru',
    role: 'admin'
  }
};

const persistedService = {
  id: 7,
  name: 'Диагностика',
  icon: 'scan',
  description: 'Проверка автомобиля',
  price: '1500 ₽',
  createdAt: '2026-04-14T10:00:00Z',
  updatedAt: '2026-04-14T10:00:00Z'
};

const seedSession = () => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminSession));
};

describe('AvtoShop app', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders public sections on the landing page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request) => {
        if (String(url).includes('/api/services')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        if (String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        return Promise.reject(new Error('unknown request'));
      })
    );

    render(<App />);

    expect(await screen.findByRole('heading', { name: /основные работы, с которых начинается нормальный сервис/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /сервис с рабочей дисциплиной/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /работаем как мастерская/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /говорим не за сервис/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /приехать, позвонить/i })).toBeInTheDocument();
  });

  it('logs in through the backend and stores the auth session', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request, options?: RequestInit) => {
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

        if (String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        if (String(url).includes('/api/auth/logout')) {
          return Promise.resolve(makeJsonResponse({}));
        }

        return Promise.reject(new Error('unknown request'));
      })
    );

    window.history.pushState({}, '', '/login');
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@avtoshop.ru');
    await user.type(screen.getByLabelText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти в админ-панель/i }));

    expect(JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) as string)).toEqual(adminSession);
    expect(await screen.findByRole('heading', { name: /управление услугами/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /выйти/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('shows a backend error and keeps the user on login when auth fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request) => {
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

        if (String(url).includes('/api/services') || String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        return Promise.reject(new Error('unknown request'));
      })
    );

    window.history.pushState({}, '', '/login');
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@avtoshop.ru');
    await user.type(screen.getByLabelText(/пароль/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /войти в админ-панель/i }));

    expect(await screen.findByText(/неверный логин или пароль/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('redirects unauthenticated users away from admin route', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(makeJsonResponse([]))));

    window.history.pushState({}, '', '/admin');
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(screen.getByRole('heading', { name: /доступ к управлению каталогом через защищённую авторизацию/i })).toBeInTheDocument();
  });

  it('falls back to local services and testimonials when backend is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));

    render(<App />);

    expect(await screen.findByText(/показываем локальный список услуг/i)).toBeInTheDocument();
    expect(await screen.findByText(/отзывы загружены из локального режима/i)).toBeInTheDocument();
    expect(screen.getByText(/компьютерная диагностика/i)).toBeInTheDocument();
    expect(screen.getByText(/алексей смирнов/i)).toBeInTheDocument();
  });

  it('submits testimonial locally when post request fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request, options?: RequestInit) => {
        if (String(url).includes('/api/reviews') && options?.method === 'POST') {
          return Promise.reject(new Error('offline'));
        }

        if (String(url).includes('/api/services')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        if (String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
        }

        return Promise.reject(new Error('unknown request'));
      })
    );

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /оставить отзыв/i }));
    await user.type(screen.getByPlaceholderText(/ваше имя/i), 'Тестовый клиент');
    await user.type(screen.getByPlaceholderText(/как прошёл визит/i), 'Сервер был недоступен, но форма не сломалась.');
    const ratingInput = screen.getByRole('spinbutton');
    await user.clear(ratingInput);
    await user.type(ratingInput, '7');
    await user.click(screen.getByRole('button', { name: /отправить отзыв/i }));

    expect(await screen.findByText(/отзыв сохранён локально для демо-режима/i)).toBeInTheDocument();
    expect(screen.getByText(/тестовый клиент/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/оценка 5 из 5/i).length).toBeGreaterThan(0);
  });

  it('sends the bearer token for protected admin writes', async () => {
    const user = userEvent.setup();
    seedSession();

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request, options?: RequestInit) => {
        if (String(url).includes('/api/services') && !options?.method) {
          return Promise.resolve(makeJsonResponse([persistedService]));
        }

        if (String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
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

        if (String(url).includes('/api/auth/logout')) {
          return Promise.resolve(makeJsonResponse({}));
        }

        return Promise.reject(new Error('unknown request'));
      })
    );

    window.history.pushState({}, '', '/admin');
    render(<App />);

    await screen.findByRole('heading', { name: /управление услугами/i });
    await user.type(screen.getByPlaceholderText(/название услуги/i), 'Новая услуга');
    await user.type(screen.getByPlaceholderText(/код иконки или метка/i), 'tool');
    await user.type(screen.getByPlaceholderText(/описание услуги/i), 'Описание');
    await user.type(screen.getByPlaceholderText(/^цена$/i), '1000 ₽');
    await user.click(screen.getByRole('button', { name: /добавить услугу/i }));

    expect(await screen.findByText(/услуга добавлена/i)).toBeInTheDocument();
    expect(screen.getAllByText(/новая услуга/i).length).toBeGreaterThan(0);
  });

  it('clears auth and redirects to login when an admin write returns 401', async () => {
    const user = userEvent.setup();
    seedSession();

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL | Request, options?: RequestInit) => {
        if (String(url).includes('/api/services') && !options?.method) {
          return Promise.resolve(makeJsonResponse([persistedService]));
        }

        if (String(url).includes('/api/reviews')) {
          return Promise.resolve(makeJsonResponse([]));
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
      })
    );

    window.history.pushState({}, '', '/admin');
    render(<App />);

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
});
