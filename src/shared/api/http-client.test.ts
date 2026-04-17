import { API_BASE } from '../config/env';
import { ApiError, apiRequest, isAuthError } from './http-client';

describe('http-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the api with the base url and merges headers', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true })
    } as Response);

    const result = await apiRequest<{ ok: boolean }>('/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      token: 'secret-token'
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer secret-token'
      }
    });
  });

  it('returns null for a 204 response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204
    } as Response);

    const result = await apiRequest<null>('/logout');

    expect(result).toBeNull();
  });

  it('surfaces nested backend error messages', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Недействительный токен.' } })
    } as Response);

    await expect(apiRequest('/admin')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Недействительный токен.',
      status: 401
    });
  });

  it('uses array detail messages when present', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: 'Поле обязательно.' }] })
    } as Response);

    await expect(apiRequest('/reviews')).rejects.toMatchObject({
      message: 'Поле обязательно.',
      status: 422
    });
  });

  it('falls back to the default error message when the body is unreadable', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      }
    } as Response);

    await expect(apiRequest('/broken')).rejects.toMatchObject({
      message: 'Не удалось выполнить запрос.',
      status: 500
    });
  });

  it('detects auth errors only for 401 and 403 api errors', () => {
    expect(isAuthError(new ApiError('unauthorized', 401))).toBe(true);
    expect(isAuthError(new ApiError('forbidden', 403))).toBe(true);
    expect(isAuthError(new ApiError('invalid', 422))).toBe(false);
    expect(isAuthError(new Error('plain error'))).toBe(false);
  });
});
