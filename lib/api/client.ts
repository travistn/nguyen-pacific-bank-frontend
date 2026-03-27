const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isUnauthorizedError = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(await res.text(), res.status);
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return res.json();
  }

  return res.text();
};
