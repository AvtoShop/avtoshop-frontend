import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeJsonResponse, renderAppAtRoute, resetAppTestState, stubFetch } from './test/integration-helpers';

describe('AvtoShop app', () => {
  beforeEach(() => {
    resetAppTestState();
  });

  afterEach(() => {
    resetAppTestState();
  });

  it('renders public sections on the landing page', async () => {
    stubFetch((url: string | URL | Request) => {
      if (String(url).includes('/api/services')) {
        return Promise.resolve(makeJsonResponse([]));
      }

      if (String(url).includes('/api/reviews')) {
        return Promise.resolve(makeJsonResponse([]));
      }

      return Promise.reject(new Error('unknown request'));
    });

    renderAppAtRoute('/');

    expect(await screen.findByRole('heading', { name: /основные работы, с которых начинается нормальный сервис/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /сервис с рабочей дисциплиной/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /работаем как мастерская/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /говорим не за сервис/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /приехать, позвонить/i })).toBeInTheDocument();
  });

  it('submits testimonial locally when post request fails', async () => {
    const user = userEvent.setup();

    stubFetch((url: string | URL | Request, options?: RequestInit) => {
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
    });

    renderAppAtRoute('/');

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
