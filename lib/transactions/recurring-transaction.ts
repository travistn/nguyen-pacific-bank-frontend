import type { RecurringTransaction } from '@/lib/api/recurring-transaction';

type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
type AccountType = 'CHECKING' | 'SAVINGS';

export type TransactionDisplay = {
  id: number | string;
  amount: number;
  type: TransactionType;
  description: string;
  transactionDate: string;
  accountType: AccountType;
  isRecurring?: boolean;
  recurringLabel?: string;
};

const getNextMonthlyRunDate = (dayOfMonth: number) => {
  const today = new Date();
  const month = today.getDate() > dayOfMonth ? today.getMonth() + 1 : today.getMonth();
  const nextRun = new Date(today.getFullYear(), month, dayOfMonth);

  return nextRun.toISOString();
};

const normalizeTransactionType = (type?: RecurringTransaction['type']) => {
  return type === 'DEPOSIT' ||
    type === 'WITHDRAWAL' ||
    type === 'TRANSFER_IN' ||
    type === 'TRANSFER_OUT'
    ? type
    : 'WITHDRAWAL';
};

const normalizeAccountType = (accountType?: RecurringTransaction['accountType']) => {
  return accountType === 'SAVINGS' ? accountType : 'CHECKING';
};

const normalizeText = (value: string) => value.trim().toLowerCase();

export const mapRecurringTransaction = (
  recurringTransaction: RecurringTransaction | null,
): TransactionDisplay | null => {
  if (!recurringTransaction) {
    return null;
  }

  const transactionDate =
    recurringTransaction.nextRunAt ||
    recurringTransaction.nextRunDate ||
    recurringTransaction.scheduledDate ||
    recurringTransaction.transactionDate ||
    getNextMonthlyRunDate(20);

  return {
    id: `recurring-${recurringTransaction.id ?? 'netflix'}`,
    amount: Number(recurringTransaction.amount ?? 20),
    type: normalizeTransactionType(recurringTransaction.type || recurringTransaction.transactionType),
    description:
      recurringTransaction.label ||
      recurringTransaction.name ||
      recurringTransaction.description ||
      'Netflix',
    transactionDate,
    accountType: normalizeAccountType(
      recurringTransaction.sourceAccountType || recurringTransaction.accountType,
    ),
    isRecurring: true,
    recurringLabel: 'Monthly',
  };
};

export const isSameRecurringTransaction = (
  transaction: TransactionDisplay,
  recurringTransaction: TransactionDisplay,
) => {
  return (
    normalizeText(transaction.description).includes(normalizeText(recurringTransaction.description)) &&
    Math.abs(transaction.amount) === Math.abs(recurringTransaction.amount) &&
    transaction.type === recurringTransaction.type &&
    transaction.accountType === recurringTransaction.accountType
  );
};

export const markRecurringTransaction = <T extends TransactionDisplay>(
  transaction: T,
  recurringTransaction: TransactionDisplay,
) => {
  if (!isSameRecurringTransaction(transaction, recurringTransaction)) {
    return transaction;
  }

  return {
    ...transaction,
    isRecurring: true,
    recurringLabel: recurringTransaction.recurringLabel,
  };
};
