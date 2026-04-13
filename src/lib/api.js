import mockAdminServices from '../mock/adminServices';
import mockTestimonials from '../mock/testimonials';

const API_BASE = 'http://localhost:5000/api';

const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 1));

export const loadServices = async () => {
  try {
    const response = await fetch(`${API_BASE}/posts`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить услуги с сервера.');
    }

    const data = await response.json();
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
    const response = await fetch(`${API_BASE}/reviews`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить отзывы с сервера.');
    }

    const data = await response.json();
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
    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Не удалось отправить отзыв.');
    }

    const created = await response.json();
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
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });

  if (!response.ok) {
    throw new Error('Не удалось добавить услугу.');
  }

  return response.json();
};

export const updateService = async (id, service) => {
  const response = await fetch(`${API_BASE}/post/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });

  if (!response.ok) {
    throw new Error('Не удалось обновить услугу.');
  }

  return response.json();
};

export const deleteService = async (id) => {
  const response = await fetch(`${API_BASE}/post/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Не удалось удалить услугу.');
  }
};
