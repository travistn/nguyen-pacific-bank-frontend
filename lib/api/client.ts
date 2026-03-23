const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    throw new Error(await res.text());
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
