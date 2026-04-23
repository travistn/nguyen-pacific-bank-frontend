import { apiFetch } from '@/lib/api/client';

export type UpcomingRecurringTransaction = {
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

export const getUpcomingRecurringTransactions = async () => {
  return apiFetch('/api/recurring-transactions/upcoming');
};
