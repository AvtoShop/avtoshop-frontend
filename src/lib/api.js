import mockAdminServices from '../mock/adminServices';
import mockTestimonials from '../mock/testimonials';
import { clearAuthSession, getAuthSession } from './auth';

const env = import.meta.env ?? {};
const API_ORIGIN =
  env.VITE_BACKEND_API_BASE_URL ??
  env.BACKEND_API_BASE_URL ??
  // 'http://localhost:5000';
  'https://convulsively-central-greyhound.cloudpub.ru';
const API_BASE = API_ORIGIN.endsWith('/api') ? API_ORIGIN : `${API_ORIGIN}/api`;

const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 1));

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const parseErrorResponse = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    const detail =
      data?.error?.message ??
      data?.detail?.[0]?.msg ??
      data?.detail ??
      data?.message;

    return typeof detail === 'string' && detail.trim() ? detail : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const apiRequest = async (path, options = {}) => {
  const { requireAuth = false, headers, ...restOptions } = options;
  const authSession = getAuthSession();
  const requestHeaders = {
    ...(headers ?? {})
  };

  if (requireAuth && authSession?.token) {
    requestHeaders.Authorization = `Bearer ${authSession.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers: requestHeaders
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Не удалось выполнить запрос.');
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const isAuthError = (error) => error instanceof ApiError && [401, 403].includes(error.status);

export const loginAdmin = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
};

export const logoutAdmin = async () => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      requireAuth: true
    });
  } finally {
    clearAuthSession();
  }
};

export const loadServices = async () => {
  try {
    const data = await apiRequest('/services');
    const services = Array.isArray(data) && data.length > 0 ? data : mockAdminServices;

    return {
      services,
      usingFallback: services === mockAdminServices,
      message:
        services === mockAdminServices
          ? 'Сервер вернул пустой список. Показываем локальный каталог услуг.'
          : ''
    };
  } catch {
    return {
      services: mockAdminServices,
      usingFallback: true,
      message: 'Онлайн-каталог недоступен. Показываем локальный список услуг.'
    };
  }
};

export const loadTestimonials = async () => {
  try {
    const data = await apiRequest('/reviews');
    const reviews = Array.isArray(data) && data.length > 0 ? data : mockTestimonials;

    return {
      reviews,
      usingFallback: reviews === mockTestimonials,
      message:
        reviews === mockTestimonials
          ? 'Сервер пока не вернул отзывы. Показываем локальные отзывы клиентов.'
          : ''
    };
  } catch {
    return {
      reviews: mockTestimonials,
      usingFallback: true,
      message: 'Отзывы загружены из локального режима, пока сервер недоступен.'
    };
  }
};

export const submitTestimonial = async (testimonial) => {
  const payload = {
    ...testimonial,
    rating: clampRating(testimonial.rating)
  };

  try {
    const created = await apiRequest('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { review: { ...created, rating: clampRating(created.rating) }, offline: false };
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

export const createService = async (service) => {
  return apiRequest('/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    requireAuth: true
  });
};

export const updateService = async (id, service) => {
  return apiRequest(`/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    requireAuth: true
  });
};

export const deleteService = async (id) => {
  return apiRequest(`/services/${id}`, {
    method: 'DELETE',
    requireAuth: true
  });
};
