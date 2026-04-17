import { makeAutoObservable, runInAction } from 'mobx';
import type { NavigateFunction } from 'react-router-dom';
import type { SessionStore } from '../../../app/store/session-store';
import { deleteService, loadServices, updateService, createService } from '../../../shared/api/services-api';
import { isAuthError } from '../../../shared/api/http-client';
import type { Service, ServiceInput } from '../../../shared/model/types';

const createEmptyService = (): ServiceInput => ({
  name: '',
  icon: '',
  description: '',
  price: ''
});

export class AdminPageViewModel {
  services: Service[] = [];
  formData: ServiceInput = createEmptyService();
  editingId: number | null = null;
  selectedId: number | null = null;
  loading = true;
  usingFallback = false;
  message = '';
  pending = false;
  private initialized = false;
  private sessionStore: SessionStore;
  private navigate: NavigateFunction;

  constructor(sessionStore: SessionStore, navigate: NavigateFunction) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.sessionStore = sessionStore;
    this.navigate = navigate;
  }

  get selectedService(): Service | null {
    return this.services.find((service) => service.id === this.selectedId) ?? null;
  }

  get canMutate(): boolean {
    return !this.usingFallback;
  }

  async load(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    runInAction(() => {
      this.loading = true;
    });

    const result = await loadServices();

    runInAction(() => {
      this.services = result.services;
      this.usingFallback = result.usingFallback;
      this.message = result.usingFallback
        ? 'Сервер недоступен или пуст. В админ-панели включён локальный предпросмотр.'
        : result.message;
      this.selectedId = result.services[0]?.id ?? null;
      this.loading = false;
    });
  }

  setFormField<K extends keyof ServiceInput>(field: K, value: ServiceInput[K]): void {
    this.formData = {
      ...this.formData,
      [field]: value
    };
  }

  resetForm(): void {
    this.formData = createEmptyService();
    this.editingId = null;
  }

  toggleSelectedService(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
  }

  startEditing(service: Service): void {
    this.editingId = service.id;
    this.formData = {
      name: service.name,
      icon: service.icon,
      description: service.description,
      price: service.price
    };
    this.selectedId = service.id;
  }

  async submitForm(): Promise<void> {
    runInAction(() => {
      this.pending = true;
      this.message = '';
    });

    try {
      const token = this.requireToken();
      const savedService = this.editingId
        ? await updateService(this.editingId, this.formData, token)
        : await createService(this.formData, token);

      runInAction(() => {
        this.services = this.editingId
          ? this.services.map((service) => (service.id === this.editingId ? savedService : service))
          : [savedService, ...this.services];
        this.selectedId = savedService.id;
        this.message = this.editingId ? 'Услуга обновлена.' : 'Услуга добавлена.';
        this.resetForm();
      });
    } catch (error) {
      if (await this.handlePossibleAuthError(error)) {
        return;
      }

      runInAction(() => {
        this.message = error instanceof Error ? error.message : 'Не удалось сохранить услугу.';
      });
    } finally {
      runInAction(() => {
        this.pending = false;
      });
    }
  }

  async deleteService(id: number): Promise<void> {
    if (!window.confirm('Удалить услугу из списка?')) {
      return;
    }

    runInAction(() => {
      this.message = '';
    });

    try {
      await deleteService(id, this.requireToken());
      runInAction(() => {
        this.services = this.services.filter((service) => service.id !== id);
        if (this.selectedId === id) {
          this.selectedId = null;
        }
        if (this.editingId === id) {
          this.resetForm();
        }
        this.message = 'Услуга удалена.';
      });
    } catch (error) {
      if (await this.handlePossibleAuthError(error)) {
        return;
      }

      runInAction(() => {
        this.message = error instanceof Error ? error.message : 'Не удалось удалить услугу.';
      });
    }
  }

  async logout(): Promise<void> {
    await this.sessionStore.logout();
    this.navigate('/login', { replace: true });
  }

  private requireToken(): string {
    const token = this.sessionStore.token;

    if (!token) {
      throw new Error('Сессия администратора не найдена.');
    }

    return token;
  }

  private async handlePossibleAuthError(error: unknown): Promise<boolean> {
    if (!isAuthError(error)) {
      return false;
    }

    await this.sessionStore.logout();
    this.navigate('/login', { replace: true });
    return true;
  }
}
