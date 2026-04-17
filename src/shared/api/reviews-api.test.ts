const { apiRequestMock, nowMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  nowMock: vi.fn()
}));

vi.mock('./http-client', () => ({
  apiRequest: apiRequestMock
}));

import { mockReviews } from '../mocks/reviews';
import { loadTestimonials, submitTestimonial } from './reviews-api';

describe('reviews-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    nowMock.mockReset();
    vi.spyOn(Date, 'now').mockImplementation(nowMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns backend reviews when the api responds with data', async () => {
    const reviews = [{ id: 8, name: 'Клиент', text: 'Все хорошо', rating: 4 }];
    apiRequestMock.mockResolvedValue(reviews);

    await expect(loadTestimonials()).resolves.toEqual({
      reviews,
      usingFallback: false,
      message: ''
    });
  });

  it('falls back to mock reviews when the backend returns an empty list', async () => {
    apiRequestMock.mockResolvedValue([]);

    await expect(loadTestimonials()).resolves.toEqual({
      reviews: mockReviews,
      usingFallback: true,
      message: 'Сервер пока не вернул отзывы. Показываем локальные отзывы клиентов.'
    });
  });

  it('falls back to mock reviews when loading fails', async () => {
    apiRequestMock.mockRejectedValue(new Error('offline'));

    await expect(loadTestimonials()).resolves.toEqual({
      reviews: mockReviews,
      usingFallback: true,
      message: 'Отзывы загружены из локального режима, пока сервер недоступен.'
    });
  });

  it('clamps the outgoing and incoming rating for successful submissions', async () => {
    apiRequestMock.mockResolvedValue({
      id: 10,
      name: 'Новый клиент',
      text: 'Отзыв',
      rating: 10
    });

    await expect(
      submitTestimonial({
        name: 'Новый клиент',
        text: 'Отзыв',
        rating: 9
      })
    ).resolves.toEqual({
      review: {
        id: 10,
        name: 'Новый клиент',
        text: 'Отзыв',
        rating: 5
      },
      offline: false
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Новый клиент',
        text: 'Отзыв',
        rating: 5
      })
    });
  });

  it('creates a local review when the request fails', async () => {
    nowMock.mockReturnValue(12345);
    apiRequestMock.mockRejectedValue(new Error('offline'));

    await expect(
      submitTestimonial({
        name: 'Локальный клиент',
        text: 'Без сервера',
        rating: 0
      })
    ).resolves.toEqual({
      review: {
        id: 12345,
        name: 'Локальный клиент',
        text: 'Без сервера',
        rating: 1
      },
      offline: true
    });
  });
});
