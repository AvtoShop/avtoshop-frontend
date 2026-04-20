import { mockServices } from '../mocks/services';
import type { LoadServicesResult, Service, ServiceInput } from '../model/types';
import { apiRequest } from './http-client';

export const loadServices = async (): Promise<LoadServicesResult> => {
  try {
    const data = await apiRequest<Service[]>('/services');
    const services = Array.isArray(data) ? data : mockServices;

    return {
      services,
      usingFallback: services === mockServices,
      message:
        services === mockServices ? 'Сервер вернул некорректный ответ. Показываем локальный каталог услуг.' : ''
    };
  } catch {
    return {
      services: mockServices,
      usingFallback: true,
      message: 'Онлайн-каталог недоступен. Показываем локальный список услуг.'
    };
  }
};

export const createService = async (service: ServiceInput, token: string): Promise<Service> =>
  apiRequest<Service>('/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    token
  });

export const updateService = async (id: number, service: ServiceInput, token: string): Promise<Service> =>
  apiRequest<Service>(`/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
    token
  });

export const deleteService = async (id: number, token: string): Promise<void> =>
  apiRequest<void>(`/services/${id}`, {
    method: 'DELETE',
    token
  });
