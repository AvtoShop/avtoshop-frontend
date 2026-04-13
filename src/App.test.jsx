import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ADMIN_STORAGE_KEY } from './lib/constants';

const makeJsonResponse = (data, ok = true) => ({
  ok,
  json: async () => data
});

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
      vi.fn((url) => {
        if (String(url).includes('/api/posts')) {
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

  it('allows demo login and logout via shared auth state', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(makeJsonResponse([]))));
    const user = userEvent.setup();

    window.history.pushState({}, '', '/login');
    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@avtoshop.ru');
    await user.type(screen.getByLabelText(/пароль/i), 'secret');
    await user.click(screen.getByRole('button', { name: /войти в админ-панель/i }));

    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBe('true');
    expect(await screen.findByRole('heading', { name: /управление услугами и локальным предпросмотром/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /выйти/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
  });

  it('redirects unauthenticated users away from admin route', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(makeJsonResponse([]))));

    window.history.pushState({}, '', '/admin');
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(screen.getByRole('heading', { name: /доступ к управлению каталогом/i })).toBeInTheDocument();
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
      vi.fn((url, options) => {
        if (String(url).includes('/api/reviews') && options?.method === 'POST') {
          return Promise.reject(new Error('offline'));
        }

        if (String(url).includes('/api/posts')) {
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
});
