const { loadServicesMock, loadTestimonialsMock, submitTestimonialMock } = vi.hoisted(() => ({
  loadServicesMock: vi.fn(),
  loadTestimonialsMock: vi.fn(),
  submitTestimonialMock: vi.fn()
}));

vi.mock('../../../shared/api/services-api', () => ({
  loadServices: loadServicesMock
}));

vi.mock('../../../shared/api/reviews-api', () => ({
  loadTestimonials: loadTestimonialsMock,
  submitTestimonial: submitTestimonialMock
}));

import { HomePageViewModel } from './home-page-view-model';

describe('HomePageViewModel', () => {
  beforeEach(() => {
    loadServicesMock.mockReset();
    loadTestimonialsMock.mockReset();
    submitTestimonialMock.mockReset();
  });

  it('loads services and reviews only once', async () => {
    loadServicesMock.mockResolvedValue({
      services: [{ id: 1, name: 'Диагностика', icon: 'scan', description: 'desc', price: '1000 ₽' }],
      usingFallback: false,
      message: ''
    });
    loadTestimonialsMock.mockResolvedValue({
      reviews: [{ id: 1, name: 'Клиент', text: 'Отзыв', rating: 5 }],
      usingFallback: false,
      message: ''
    });
    const viewModel = new HomePageViewModel();

    await viewModel.load();
    await viewModel.load();

    expect(loadServicesMock).toHaveBeenCalledTimes(1);
    expect(loadTestimonialsMock).toHaveBeenCalledTimes(1);
    expect(viewModel.services).toHaveLength(1);
    expect(viewModel.reviews).toHaveLength(1);
    expect(viewModel.expandedServiceId).toBe(1);
    expect(viewModel.serviceCountLabel).toBe('1 направлений');
    expect(viewModel.servicesLoading).toBe(false);
    expect(viewModel.reviewsLoading).toBe(false);
  });

  it('toggles services and form visibility', () => {
    const viewModel = new HomePageViewModel();

    viewModel.toggleService(2);
    expect(viewModel.expandedServiceId).toBe(2);

    viewModel.toggleService(2);
    expect(viewModel.expandedServiceId).toBeNull();

    viewModel.toggleFormVisibility();
    expect(viewModel.formVisible).toBe(true);

    viewModel.toggleFormVisibility();
    expect(viewModel.formVisible).toBe(false);
  });

  it('updates testimonial fields and clamps rating', () => {
    const viewModel = new HomePageViewModel();

    viewModel.setTestimonialField('name', 'Клиент');
    viewModel.setTestimonialField('text', 'Текст');
    viewModel.setTestimonialField('rating', 11);

    expect(viewModel.testimonialForm).toEqual({
      name: 'Клиент',
      text: 'Текст',
      rating: 5
    });
  });

  it('rejects empty testimonial submissions', async () => {
    const viewModel = new HomePageViewModel();

    await viewModel.submitTestimonial();

    expect(submitTestimonialMock).not.toHaveBeenCalled();
    expect(viewModel.submitState).toEqual({
      pending: false,
      message: 'Заполните имя и текст отзыва, чтобы отправить форму.',
      tone: 'error'
    });
  });

  it('submits testimonials and resets the form on success', async () => {
    submitTestimonialMock.mockResolvedValue({
      review: {
        id: 5,
        name: 'Новый клиент',
        text: 'Все хорошо',
        rating: 4
      },
      offline: false
    });
    const viewModel = new HomePageViewModel();
    viewModel.formVisible = true;
    viewModel.reviews = [{ id: 1, name: 'Старый', text: 'Старый отзыв', rating: 5 }];
    viewModel.setTestimonialField('name', 'Новый клиент');
    viewModel.setTestimonialField('text', 'Все хорошо');
    viewModel.setTestimonialField('rating', 4);

    await viewModel.submitTestimonial();

    expect(submitTestimonialMock).toHaveBeenCalledWith({
      name: 'Новый клиент',
      text: 'Все хорошо',
      rating: 4
    });
    expect(viewModel.reviews.map((review) => review.id)).toEqual([5, 1]);
    expect(viewModel.testimonialForm).toEqual({
      name: '',
      text: '',
      rating: 5
    });
    expect(viewModel.formVisible).toBe(false);
    expect(viewModel.submitState).toEqual({
      pending: false,
      message: 'Спасибо. Отзыв успешно отправлен.',
      tone: 'note'
    });
  });

  it('shows the offline confirmation when testimonial submission falls back locally', async () => {
    submitTestimonialMock.mockResolvedValue({
      review: {
        id: 9,
        name: 'Локальный клиент',
        text: 'Без сервера',
        rating: 5
      },
      offline: true
    });
    const viewModel = new HomePageViewModel();
    viewModel.setTestimonialField('name', 'Локальный клиент');
    viewModel.setTestimonialField('text', 'Без сервера');

    await viewModel.submitTestimonial();

    expect(viewModel.submitState.message).toBe('Сервер недоступен. Отзыв сохранён локально для демо-режима.');
    expect(viewModel.reviews[0]?.id).toBe(9);
  });
});
