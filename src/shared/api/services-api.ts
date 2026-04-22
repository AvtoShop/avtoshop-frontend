import { mockServices } from '../mocks/services';
import type { LoadServicesResult, Service, ServiceInput } from '../model/types';
import { apiRequest } from './http-client';

let servicesCache: LoadServicesResult | null = null;
let servicesRequest: Promise<LoadServicesResult> | null = null;

export const resetServicesCache = (): void => {
  servicesCache = null;
  servicesRequest = null;
};

export const loadServices = async (): Promise<LoadServicesResult> => {
  if (servicesCache) {
    return servicesCache;
  }

  if (!servicesRequest) {
    servicesRequest = (async () => {
      try {
        const data = await apiRequest<Service[]>('/services');
        const services = Array.isArray(data) ? data : mockServices;

        servicesCache = {
          services,
          usingFallback: services === mockServices,
          message:
            services === mockServices ? 'Сервер вернул некорректный ответ. Показываем локальный каталог услуг.' : ''
        };
      } catch {
        servicesCache = {
          services: mockServices,
          usingFallback: true,
          message: 'Онлайн-каталог недоступен. Показываем локальный список услуг.'
        };
      }

      return servicesCache;
    })().finally(() => {
      servicesRequest = null;
    });
  }

  return servicesRequest;
};

export const createService = async (service: ServiceInput, token: string): Promise<Service> => {
  resetServicesCache();

  return apiRequest<Service>('/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    token
  });
};

export const updateService = async (id: number, service: ServiceInput, token: string): Promise<Service> => {
  resetServicesCache();

  return apiRequest<Service>(`/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    token
  });
};

export const deleteService = async (id: number, token: string): Promise<void> => {
  resetServicesCache();

  return apiRequest<void>(`/services/${id}`, {
    method: 'DELETE',
    token
  });
};
