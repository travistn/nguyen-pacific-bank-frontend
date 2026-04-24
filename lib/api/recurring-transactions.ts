import { apiFetch } from '@/lib/api/client';

export const RECURRING_TRANSACTIONS_UPDATED_EVENT = 'recurring-transactions-updated';

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

export type CreateRecurringTransactionInput = {
  accountId: number;
  description: string;
  amount: number;
  dayOfMonth: number;
};

export const createRecurringTransaction = async (
  input: CreateRecurringTransactionInput,
) => {
  return apiFetch('/api/recurring-transaction', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};
