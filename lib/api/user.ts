import { apiFetch } from './client';

export const deleteCurrentUser = async () => {
  return apiFetch('/api/users/me', {
    method: 'DELETE',
  });
};
