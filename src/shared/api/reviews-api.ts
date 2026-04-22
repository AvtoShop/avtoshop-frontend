import { mockReviews } from '../mocks/reviews';
import { clampRating } from '../lib/rating';
import type { LoadReviewsResult, Review, ReviewInput, TestimonialSubmitResult } from '../model/types';
import { apiRequest } from './http-client';

let reviewsCache: LoadReviewsResult | null = null;
let reviewsRequest: Promise<LoadReviewsResult> | null = null;

export const resetReviewsCache = (): void => {
  reviewsCache = null;
  reviewsRequest = null;
};

export const loadTestimonials = async (): Promise<LoadReviewsResult> => {
  if (reviewsCache) {
    return reviewsCache;
  }

  if (!reviewsRequest) {
    reviewsRequest = (async () => {
      try {
        const data = await apiRequest<Review[]>('/reviews');
        const reviews = Array.isArray(data) && data.length > 0 ? data : mockReviews;

        reviewsCache = {
          reviews,
          usingFallback: reviews === mockReviews,
          message:
            reviews === mockReviews
              ? 'Сервер пока не вернул отзывы. Показываем локальные отзывы клиентов.'
              : ''
        };
      } catch {
        reviewsCache = {
          reviews: mockReviews,
          usingFallback: true,
          message: 'Отзывы загружены из локального режима, пока сервер недоступен.'
        };
      }

      return reviewsCache;
    })().finally(() => {
      reviewsRequest = null;
    });
  }

  return reviewsRequest;
};

export const submitTestimonial = async (testimonial: ReviewInput): Promise<TestimonialSubmitResult> => {
  resetReviewsCache();

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
