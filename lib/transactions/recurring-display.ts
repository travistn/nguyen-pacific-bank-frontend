import type { UpcomingRecurringTransaction } from '@/lib/api/recurring-transactions';

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

type AccountLike = {
  balance: number;
  type: AccountType;
};

const normalizeTransactionType = (type?: string) => {
  return type === 'DEPOSIT' ||
    type === 'WITHDRAWAL' ||
    type === 'TRANSFER_IN' ||
    type === 'TRANSFER_OUT'
    ? type
    : 'WITHDRAWAL';
};

const normalizeAccountType = (accountType?: string) => {
  return accountType === 'SAVINGS' ? accountType : 'CHECKING';
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const parseDate = (value: string) => {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const parsedDate = new Date(normalizedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getNextMonthlyOccurrence = (date: Date, now = new Date()) => {
  const nextOccurrence = new Date(date);

  while (nextOccurrence.getTime() <= now.getTime()) {
    nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
  }

  return nextOccurrence;
};

const getPreviousMonthlyRunDate = (nextRunDate: Date) => {
  return new Date(
    nextRunDate.getFullYear(),
    nextRunDate.getMonth() - 1,
    nextRunDate.getDate(),
    12,
  );
};

const getUpcomingRunDate = (transaction: UpcomingRecurringTransaction) => {
  return (
    transaction.nextRunDate ||
    transaction.nextRunAt ||
    transaction.scheduledDate ||
    transaction.transactionDate ||
    ''
  );
};

export const getEffectiveUpcomingRunDate = (
  transaction: UpcomingRecurringTransaction,
  now = new Date(),
) => {
  const parsedDate = parseDate(getUpcomingRunDate(transaction));

  if (!parsedDate) {
    return null;
  }

  return getNextMonthlyOccurrence(parsedDate, now);
};

export const mapUpcomingRecurringTransactionToPastTransaction = (
  transaction: UpcomingRecurringTransaction,
): TransactionDisplay | null => {
  const nextRunDate = getEffectiveUpcomingRunDate(transaction);

  if (!nextRunDate) {
    return null;
  }

  const previousRunDate = getPreviousMonthlyRunDate(nextRunDate);

  return {
    id: `recurring-${transaction.id ?? `${transaction.name ?? transaction.label ?? 'transaction'}-${previousRunDate.toISOString()}`}`,
    amount: Number(transaction.amount ?? 0),
    type: normalizeTransactionType(transaction.type || transaction.transactionType),
    description:
      transaction.name || transaction.label || transaction.description || 'Recurring transaction',
    transactionDate: previousRunDate.toISOString(),
    accountType: normalizeAccountType(transaction.sourceAccountType || transaction.accountType),
    isRecurring: true,
    recurringLabel: 'Recurring',
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

export const getPastRecurringTransactions = (
  upcomingRecurringTransactions: UpcomingRecurringTransaction[],
) => {
  return upcomingRecurringTransactions
    .map(mapUpcomingRecurringTransactionToPastTransaction)
    .filter((transaction): transaction is TransactionDisplay => transaction !== null);
};

export const getTransactionTimestamp = (transaction: TransactionDisplay) => {
  const timestamp = new Date(transaction.transactionDate).getTime();

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

export const compareTransactionsNewestFirst = (
  a: TransactionDisplay,
  b: TransactionDisplay,
) => {
  const timestampDifference = getTransactionTimestamp(b) - getTransactionTimestamp(a);

  if (timestampDifference !== 0) {
    return timestampDifference;
  }

  if (a.isRecurring !== b.isRecurring) {
    return a.isRecurring ? 1 : -1;
  }

  return 0;
};

export const mergePastRecurringTransactions = (
  transactions: TransactionDisplay[],
  upcomingRecurringTransactions: UpcomingRecurringTransaction[],
) => {
  const recurringDisplayTransactions = getPastRecurringTransactions(upcomingRecurringTransactions);

  const labeledTransactions = transactions.map((transaction) => {
    const matchingRecurringTransaction = recurringDisplayTransactions.find((recurringTransaction) =>
      isSameRecurringTransaction(transaction, recurringTransaction),
    );

    return matchingRecurringTransaction
      ? markRecurringTransaction(transaction, matchingRecurringTransaction)
      : transaction;
  });

  const syntheticPastRecurringTransactions = recurringDisplayTransactions.filter(
    (recurringTransaction) =>
      !labeledTransactions.some((transaction) =>
        isSameRecurringTransaction(transaction, recurringTransaction),
      ),
  );

  return [...labeledTransactions, ...syntheticPastRecurringTransactions];
};

export const applyPastRecurringTransactionsToAccounts = <T extends AccountLike>(
  accounts: T[],
  transactions: TransactionDisplay[],
  upcomingRecurringTransactions: UpcomingRecurringTransaction[],
): T[] => {
  const mergedTransactions = mergePastRecurringTransactions(transactions, upcomingRecurringTransactions);
  const postedTransactionIds = new Set(transactions.map((transaction) => String(transaction.id)));

  const syntheticRecurringTransactions = mergedTransactions.filter(
    (transaction) => transaction.isRecurring && !postedTransactionIds.has(String(transaction.id)),
  );

  return accounts.map((account) => {
    const recurringBalanceAdjustment = syntheticRecurringTransactions.reduce((sum, transaction) => {
      if (transaction.accountType !== account.type) {
        return sum;
      }

      switch (transaction.type) {
        case 'DEPOSIT':
        case 'TRANSFER_IN':
          return sum + Math.abs(transaction.amount);
        case 'WITHDRAWAL':
        case 'TRANSFER_OUT':
        default:
          return sum - Math.abs(transaction.amount);
      }
    }, 0);

    return {
      ...account,
      balance: account.balance + recurringBalanceAdjustment,
    };
  });
};
