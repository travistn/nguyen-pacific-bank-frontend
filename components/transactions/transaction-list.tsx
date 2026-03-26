'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api/client';
import TransactionHistoryFilters, {
  type TransactionFilters,
} from '@/components/transactions/transaction-history-filters';

type Transaction = {
  id: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  description: string;
  transactionDate: string;
  accountType: 'CHECKING' | 'SAVINGS';
};

type Account = {
  id: number;
  accountNumber: string;
  type: 'CHECKING' | 'SAVINGS';
};

type TransactionListProps = {
  transactions: Transaction[];
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
};

const TransactionList = ({ transactions, filters, onFiltersChange }: TransactionListProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await apiFetch('/api/accounts');
        setAccounts(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadAccounts();
  }, []);

  const getAccountByType = (type: Account['type']) => {
    return accounts.find((account) => account.type === type);
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const maskAccountNumbersInText = (text: string) => {
    return text.replace(/\d{5,}/g, (match) => {
      const last4 = match.slice(-4);
      return `**** ${last4}`;
    });
  };

  const isIncomingTransaction = (type: Transaction['type']) => {
    return type === 'DEPOSIT' || type === 'TRANSFER_IN';
  };

  const formatTransactionLabel = (transaction: Transaction) => {
    if (transaction.description?.trim()) {
      return maskAccountNumbersInText(transaction.description);
    }

    switch (transaction.type) {
      case 'DEPOSIT':
        return 'Deposit';
      case 'WITHDRAWAL':
        return 'Withdrawal';
      case 'TRANSFER_IN':
        return 'Transfer In';
      case 'TRANSFER_OUT':
        return 'Transfer Out';
      default:
        return 'Transaction';
    }
  };

  const formatAccountType = (accountType: Transaction['accountType']) => {
    switch (accountType) {
      case 'CHECKING':
        return 'Checking';
      case 'SAVINGS':
        return 'Savings';
      default:
        return accountType;
    }
  };

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex flex-col gap-4 md:mb-5 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='dashboard-eyebrow'>Activity</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Transaction Activity
          </h2>
        </div>
        <TransactionHistoryFilters filters={filters} onChange={onFiltersChange} />
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      {transactions.length === 0 ? (
        <div className='dashboard-subcard flex flex-col items-start gap-4 p-5 md:p-6'>
          <div>
            <p className='dashboard-heading text-base md:text-lg'>No matching transactions</p>
            <p className='dashboard-support mt-2 md:text-base'>
              Try changing your filters or create a new transaction to get started.
            </p>
          </div>
          <Link
            href='/dashboard/transactions'
            className='dashboard-heading inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90'>
            Create Transaction
          </Link>
        </div>
      ) : (
        <div className='grid gap-3 md:gap-4'>
          {transactions.map((transaction) => {
            const isIncoming = isIncomingTransaction(transaction.type);
            const account = getAccountByType(transaction.accountType);
            return (
              <article
                key={transaction.id}
                className='dashboard-subcard p-4 transition hover:bg-(--color-card) md:p-5'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='dashboard-eyebrow'>{transaction.type.replace('_', ' ')}</p>
                    <p className='dashboard-heading mt-2 truncate text-base md:text-lg'>
                      {formatTransactionLabel(transaction)}
                    </p>
                    <p className='dashboard-support mt-2 md:text-base'>
                      {account ? (
                        <Link
                          href={`/dashboard/accounts/${account.accountNumber}`}
                          className='transition hover:text-(--color-accent-primary) hover:underline'>
                          {formatAccountType(transaction.accountType)}
                        </Link>
                      ) : (
                        formatAccountType(transaction.accountType)
                      )}{' '}
                      • {formatDate(transaction.transactionDate)}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-lg font-semibold md:text-2xl ${
                      isIncoming ? 'dashboard-accent-value' : 'text-white'
                    }`}>
                    {isIncoming ? '+' : '-'} {formatMoney(Math.abs(transaction.amount))}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export type { Transaction };
export default TransactionList;
