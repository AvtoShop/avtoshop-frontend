const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn()
}));

vi.mock('./http-client', () => ({
  apiRequest: apiRequestMock
}));

import { loginAdmin, logoutAdmin } from './auth-api';

describe('auth-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('submits admin credentials as json', async () => {
    const session = {
      token: 'token',
      user: { id: 1, email: 'admin@avtoshop.ru', role: 'admin' }
    };
    apiRequestMock.mockResolvedValue(session);

    await expect(loginAdmin({ email: 'admin@avtoshop.ru', password: 'secret' })).resolves.toEqual(session);
    expect(apiRequestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@avtoshop.ru',
        password: 'secret'
      })
    });
  });

  it('posts logout with the current token', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await expect(logoutAdmin('token')).resolves.toBeUndefined();
    expect(apiRequestMock).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      token: 'token'
    });
  });
});
