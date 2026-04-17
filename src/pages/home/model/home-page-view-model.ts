import { makeAutoObservable, runInAction } from 'mobx';
import { clampRating } from '../../../shared/lib/rating';
import type { Review, ReviewInput, Service, StatusTone } from '../../../shared/model/types';
import { loadTestimonials, submitTestimonial } from '../../../shared/api/reviews-api';
import { loadServices } from '../../../shared/api/services-api';

const emptyForm: ReviewInput = {
  name: '',
  text: '',
  rating: 5
};

interface SubmitState {
  pending: boolean;
  message: string;
  tone: StatusTone;
}

export class HomePageViewModel {
  services: Service[] = [];
  reviews: Review[] = [];
  expandedServiceId: number | null = null;
  servicesLoading = true;
  reviewsLoading = true;
  servicesMessage = '';
  reviewsMessage = '';
  formVisible = false;
  testimonialForm: ReviewInput = { ...emptyForm };
  submitState: SubmitState = { pending: false, message: '', tone: 'note' };
  private initialized = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get serviceCountLabel(): string {
    return `${this.services.length || 0} направлений`;
  }

  async load(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    await Promise.all([this.loadServices(), this.loadReviews()]);
  }

  async loadServices(): Promise<void> {
    runInAction(() => {
      this.servicesLoading = true;
    });

    const result = await loadServices();

    runInAction(() => {
      this.services = result.services;
      this.servicesMessage = result.message;
      this.expandedServiceId = result.services[0]?.id ?? null;
      this.servicesLoading = false;
    });
  }

  async loadReviews(): Promise<void> {
    runInAction(() => {
      this.reviewsLoading = true;
    });

    const result = await loadTestimonials();

    runInAction(() => {
      this.reviews = result.reviews;
      this.reviewsMessage = result.message;
      this.reviewsLoading = false;
    });
  }

  toggleService(id: number): void {
    this.expandedServiceId = this.expandedServiceId === id ? null : id;
  }

  toggleFormVisibility(): void {
    this.formVisible = !this.formVisible;
  }

  setTestimonialField<K extends keyof ReviewInput>(field: K, value: ReviewInput[K]): void {
    this.testimonialForm = {
      ...this.testimonialForm,
      [field]: field === 'rating' ? clampRating(Number(value)) : value
    };
  }

  async submitTestimonial(): Promise<void> {
    if (!this.testimonialForm.name.trim() || !this.testimonialForm.text.trim()) {
      this.submitState = {
        pending: false,
        message: 'Заполните имя и текст отзыва, чтобы отправить форму.',
        tone: 'error'
      };
      return;
    }

    runInAction(() => {
      this.submitState = { pending: true, message: '', tone: 'note' };
    });

    const result = await submitTestimonial(this.testimonialForm);

    runInAction(() => {
      this.reviews = [result.review, ...this.reviews];
      this.testimonialForm = { ...emptyForm };
      this.formVisible = false;
      this.submitState = {
        pending: false,
        message: result.offline
          ? 'Сервер недоступен. Отзыв сохранён локально для демо-режима.'
          : 'Спасибо. Отзыв успешно отправлен.',
        tone: 'note'
      };
    });
  }
}
