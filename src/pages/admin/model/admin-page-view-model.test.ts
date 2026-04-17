const {
  createServiceMock,
  deleteServiceMock,
  loadServicesMock,
  updateServiceMock,
  isAuthErrorMock
} = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  deleteServiceMock: vi.fn(),
  loadServicesMock: vi.fn(),
  updateServiceMock: vi.fn(),
  isAuthErrorMock: vi.fn()
}));

vi.mock('../../../shared/api/services-api', () => ({
  createService: createServiceMock,
  deleteService: deleteServiceMock,
  loadServices: loadServicesMock,
  updateService: updateServiceMock
}));

vi.mock('../../../shared/api/http-client', async () => {
  const actual = await vi.importActual<typeof import('../../../shared/api/http-client')>(
    '../../../shared/api/http-client'
  );

  return {
    ...actual,
    isAuthError: isAuthErrorMock
  };
});

import type { NavigateFunction } from 'react-router-dom';
import { AdminPageViewModel } from './admin-page-view-model';

const firstService = {
  id: 1,
  name: 'Диагностика',
  icon: 'scan',
  description: 'desc',
  price: '1000 ₽'
};

const secondService = {
  id: 2,
  name: 'Тормоза',
  icon: 'brake',
  description: 'desc2',
  price: '2000 ₽'
};

describe('AdminPageViewModel', () => {
  const navigate = vi.fn() as unknown as NavigateFunction;
  const sessionStore = {
    token: 'token',
    logout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createServiceMock.mockReset();
    deleteServiceMock.mockReset();
    loadServicesMock.mockReset();
    updateServiceMock.mockReset();
    isAuthErrorMock.mockReset();
    window.confirm = vi.fn(() => true);
  });

  it('loads services once and configures selection state', async () => {
    loadServicesMock.mockResolvedValue({
      services: [firstService, secondService],
      usingFallback: false,
      message: ''
    });
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    await viewModel.load();
    await viewModel.load();

    expect(loadServicesMock).toHaveBeenCalledTimes(1);
    expect(viewModel.services).toEqual([firstService, secondService]);
    expect(viewModel.selectedId).toBe(1);
    expect(viewModel.selectedService).toEqual(firstService);
    expect(viewModel.loading).toBe(false);
    expect(viewModel.canMutate).toBe(true);
  });

  it('enables fallback preview mode when the backend result uses fallback data', async () => {
    loadServicesMock.mockResolvedValue({
      services: [firstService],
      usingFallback: true,
      message: 'ignored'
    });
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    await viewModel.load();

    expect(viewModel.usingFallback).toBe(true);
    expect(viewModel.canMutate).toBe(false);
    expect(viewModel.message).toBe('Сервер недоступен или пуст. В админ-панели включён локальный предпросмотр.');
  });

  it('starts editing and resets the form', () => {
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    viewModel.startEditing(secondService);

    expect(viewModel.editingId).toBe(2);
    expect(viewModel.selectedId).toBe(2);
    expect(viewModel.formData).toEqual({
      name: secondService.name,
      icon: secondService.icon,
      description: secondService.description,
      price: secondService.price
    });

    viewModel.resetForm();

    expect(viewModel.editingId).toBeNull();
    expect(viewModel.formData).toEqual({
      name: '',
      icon: '',
      description: '',
      price: ''
    });
  });

  it('toggles the selected service', () => {
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    viewModel.toggleSelectedService(1);
    expect(viewModel.selectedId).toBe(1);

    viewModel.toggleSelectedService(1);
    expect(viewModel.selectedId).toBeNull();
  });

  it('creates a new service and selects it', async () => {
    createServiceMock.mockResolvedValue(secondService);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);
    viewModel.services = [firstService];
    viewModel.setFormField('name', secondService.name);
    viewModel.setFormField('icon', secondService.icon);
    viewModel.setFormField('description', secondService.description);
    viewModel.setFormField('price', secondService.price);

    await viewModel.submitForm();

    expect(createServiceMock).toHaveBeenCalledWith(
      {
        name: secondService.name,
        icon: secondService.icon,
        description: secondService.description,
        price: secondService.price
      },
      'token'
    );
    expect(viewModel.services.map((service) => service.id)).toEqual([2, 1]);
    expect(viewModel.selectedId).toBe(2);
    expect(viewModel.message).toBe('Услуга добавлена.');
    expect(viewModel.editingId).toBeNull();
  });

  it('updates an existing service', async () => {
    updateServiceMock.mockResolvedValue(secondService);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);
    viewModel.services = [firstService, { ...secondService, name: 'Старое имя' }];
    viewModel.startEditing({ ...secondService, name: 'Старое имя' });
    viewModel.setFormField('name', secondService.name);

    await viewModel.submitForm();

    expect(updateServiceMock).toHaveBeenCalledWith(
      2,
      {
        name: secondService.name,
        icon: secondService.icon,
        description: secondService.description,
        price: secondService.price
      },
      'token'
    );
    expect(viewModel.services[1]).toEqual(secondService);
    expect(viewModel.message).toBe('Услуга обновлена.');
    expect(viewModel.selectedId).toBe(2);
  });

  it('stops with a local error when no admin token exists', async () => {
    const tokenlessSessionStore = {
      token: null,
      logout: vi.fn()
    };
    const viewModel = new AdminPageViewModel(tokenlessSessionStore as never, navigate);

    await viewModel.submitForm();

    expect(createServiceMock).not.toHaveBeenCalled();
    expect(viewModel.message).toBe('Сессия администратора не найдена.');
    expect(viewModel.pending).toBe(false);
  });

  it('deletes a service when deletion is confirmed', async () => {
    deleteServiceMock.mockResolvedValue(undefined);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);
    viewModel.services = [firstService, secondService];
    viewModel.selectedId = 2;
    viewModel.startEditing(secondService);

    await viewModel.deleteService(2);

    expect(deleteServiceMock).toHaveBeenCalledWith(2, 'token');
    expect(viewModel.services).toEqual([firstService]);
    expect(viewModel.selectedId).toBeNull();
    expect(viewModel.editingId).toBeNull();
    expect(viewModel.message).toBe('Услуга удалена.');
  });

  it('does not delete a service when confirmation is declined', async () => {
    window.confirm = vi.fn(() => false);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);
    viewModel.services = [firstService];

    await viewModel.deleteService(1);

    expect(deleteServiceMock).not.toHaveBeenCalled();
    expect(viewModel.services).toEqual([firstService]);
  });

  it('logs out and redirects on auth errors from save requests', async () => {
    const authError = new Error('unauthorized');
    createServiceMock.mockRejectedValue(authError);
    isAuthErrorMock.mockReturnValue(true);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    await viewModel.submitForm();

    expect(sessionStore.logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(viewModel.pending).toBe(false);
  });

  it('shows regular delete errors without redirecting', async () => {
    deleteServiceMock.mockRejectedValue(new Error('Ошибка удаления.'));
    isAuthErrorMock.mockReturnValue(false);
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);
    viewModel.services = [firstService];

    await viewModel.deleteService(1);

    expect(sessionStore.logout).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(viewModel.message).toBe('Ошибка удаления.');
  });

  it('logs out and navigates to login explicitly', async () => {
    const viewModel = new AdminPageViewModel(sessionStore as never, navigate);

    await viewModel.logout();

    expect(sessionStore.logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
