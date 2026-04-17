const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn()
}));

vi.mock('./http-client', () => ({
  apiRequest: apiRequestMock
}));

import { mockServices } from '../mocks/services';
import type { Service } from '../model/types';
import { createService, deleteService, loadServices, updateService } from './services-api';

describe('services-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('returns backend services when the api responds with data', async () => {
    const services: Service[] = [{ id: 99, name: 'ТО', icon: 'oil', description: 'desc', price: '1000 ₽' }];
    apiRequestMock.mockResolvedValue(services);

    await expect(loadServices()).resolves.toEqual({
      services,
      usingFallback: false,
      message: ''
    });
  });

  it('falls back to mock services when the backend returns an empty list', async () => {
    apiRequestMock.mockResolvedValue([]);

    await expect(loadServices()).resolves.toEqual({
      services: mockServices,
      usingFallback: true,
      message: 'Сервер вернул пустой список. Показываем локальный каталог услуг.'
    });
  });

  it('falls back to mock services when the request fails', async () => {
    apiRequestMock.mockRejectedValue(new Error('offline'));

    await expect(loadServices()).resolves.toEqual({
      services: mockServices,
      usingFallback: true,
      message: 'Онлайн-каталог недоступен. Показываем локальный список услуг.'
    });
  });

  it('creates services with the auth token and serialized body', async () => {
    const payload = { name: 'Новая услуга', icon: 'tool', description: 'desc', price: '1000 ₽' };
    const created = { id: 1, ...payload };
    apiRequestMock.mockResolvedValue(created);

    await expect(createService(payload, 'token')).resolves.toEqual(created);
    expect(apiRequestMock).toHaveBeenCalledWith('/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      token: 'token'
    });
  });

  it('updates services with the target id and token', async () => {
    const payload = { name: 'Обновление', icon: 'tool', description: 'desc', price: '2000 ₽' };
    const updated = { id: 5, ...payload };
    apiRequestMock.mockResolvedValue(updated);

    await expect(updateService(5, payload, 'token')).resolves.toEqual(updated);
    expect(apiRequestMock).toHaveBeenCalledWith('/services/5', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      token: 'token'
    });
  });

  it('deletes services with the auth token', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await expect(deleteService(7, 'token')).resolves.toBeUndefined();
    expect(apiRequestMock).toHaveBeenCalledWith('/services/7', {
      method: 'DELETE',
      token: 'token'
    });
  });
});
