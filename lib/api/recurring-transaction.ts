import { ApiError, apiFetch } from '@/lib/api/client';

export type RecurringTransaction = {
  id?: number | string;
  label?: string;
  name?: string;
  description?: string;
  amount?: number | string;
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | string;
  transactionType?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | string;
  accountType?: 'CHECKING' | 'SAVINGS' | string;
  sourceAccountType?: 'CHECKING' | 'SAVINGS' | string;
  nextRunAt?: string;
  nextRunDate?: string;
  scheduledDate?: string;
  transactionDate?: string;
};

export const getRecurringTransaction = async () => {
  try {
    const data = await apiFetch('/api/recurring-transaction');

    return data || null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    console.log(error);
    return null;
  }
};
