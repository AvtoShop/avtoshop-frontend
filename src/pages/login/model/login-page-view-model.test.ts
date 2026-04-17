const { loginAdminMock } = vi.hoisted(() => ({
  loginAdminMock: vi.fn()
}));

vi.mock('../../../shared/api/auth-api', () => ({
  loginAdmin: loginAdminMock
}));

import type { NavigateFunction } from 'react-router-dom';
import type { AuthSession } from '../../../shared/model/types';
import { LoginPageViewModel } from './login-page-view-model';

describe('LoginPageViewModel', () => {
  const navigate = vi.fn() as unknown as NavigateFunction;
  const sessionStore = {
    login: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    loginAdminMock.mockReset();
  });

  it('updates credentials fields', () => {
    const viewModel = new LoginPageViewModel(sessionStore as never, navigate, '/admin');

    viewModel.setEmail('admin@avtoshop.ru');
    viewModel.setPassword('secret');

    expect(viewModel.email).toBe('admin@avtoshop.ru');
    expect(viewModel.password).toBe('secret');
  });

  it('logs in, persists the session, and navigates to the redirect target', async () => {
    const session: AuthSession = {
      token: 'token',
      user: { id: 1, email: 'admin@avtoshop.ru', role: 'admin' }
    };
    loginAdminMock.mockResolvedValue(session);
    const viewModel = new LoginPageViewModel(sessionStore as never, navigate, '/admin');
    viewModel.setEmail('  admin@avtoshop.ru  ');
    viewModel.setPassword('secret');

    await viewModel.submit();

    expect(loginAdminMock).toHaveBeenCalledWith({
      email: 'admin@avtoshop.ru',
      password: 'secret'
    });
    expect(sessionStore.login).toHaveBeenCalledWith(session);
    expect(navigate).toHaveBeenCalledWith('/admin', { replace: true });
    expect(viewModel.pending).toBe(false);
    expect(viewModel.message).toBe('');
  });

  it('stores backend errors and clears pending state', async () => {
    loginAdminMock.mockRejectedValue(new Error('Неверный логин или пароль.'));
    const viewModel = new LoginPageViewModel(sessionStore as never, navigate, '/admin');
    viewModel.setEmail('admin@avtoshop.ru');
    viewModel.setPassword('wrong');

    await viewModel.submit();

    expect(sessionStore.login).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(viewModel.message).toBe('Неверный логин или пароль.');
    expect(viewModel.pending).toBe(false);
  });
});
