import { mockReviews } from '../mocks/reviews';
import { clampRating } from '../lib/rating';
import type { LoadReviewsResult, Review, ReviewInput, TestimonialSubmitResult } from '../model/types';
import { apiRequest } from './http-client';

export const loadTestimonials = async (): Promise<LoadReviewsResult> => {
  try {
    const data = await apiRequest<Review[]>('/reviews');
    const reviews = Array.isArray(data) && data.length > 0 ? data : mockReviews;

    return {
      reviews,
      usingFallback: reviews === mockReviews,
      message:
        reviews === mockReviews
          ? 'Сервер пока не вернул отзывы. Показываем локальные отзывы клиентов.'
          : ''
    };
  } catch {
    return {
      reviews: mockReviews,
      usingFallback: true,
      message: 'Отзывы загружены из локального режима, пока сервер недоступен.'
    };
  }
};

export const submitTestimonial = async (testimonial: ReviewInput): Promise<TestimonialSubmitResult> => {
  const payload: ReviewInput = {
    ...testimonial,
    rating: clampRating(testimonial.rating)
  };

  try {
    const created = await apiRequest<Review>('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return {
      review: {
        ...created,
        rating: clampRating(created.rating)
      },
      offline: false
    };
  } catch {
    return {
      review: {
        ...payload,
        id: Date.now()
      },
      offline: true
    };
  }
};
