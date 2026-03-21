import { apiFetch } from './client';

export const login = async (email: string, password: string) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
    }),
  });
};
