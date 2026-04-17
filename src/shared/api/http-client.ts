import { API_BASE } from '../config/env';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const parseErrorResponse = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const data = (await response.json()) as {
      error?: { message?: string };
      detail?: Array<{ msg?: string }> | string;
      message?: string;
    };
    const detail =
      data.error?.message ??
      (Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail) ??
      data.message;

    return typeof detail === 'string' && detail.trim() ? detail : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  token?: string | null;
}

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { headers, token, ...restOptions } = options;
  const requestHeaders: Record<string, string> = {
    ...(headers ?? {})
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers: requestHeaders
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Не удалось выполнить запрос.');
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && [401, 403].includes(error.status);
