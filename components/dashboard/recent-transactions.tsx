'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api/client';
import { getUpcomingRecurringTransactions } from '@/lib/api/recurring-transactions';
import {
  mergePastRecurringTransactions,
  type TransactionDisplay,
} from '@/lib/transactions/recurring-display';

type Transaction = TransactionDisplay;

type Account = {
  id: number;
  accountNumber: string;
  type: 'CHECKING' | 'SAVINGS';
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [transactionsData, accountsData, upcomingRecurringTransactions] = await Promise.all([
          apiFetch('/api/transactions'),
          apiFetch('/api/accounts'),
          getUpcomingRecurringTransactions(),
        ]);

        const now = Date.now();
        const transactionsWithRecurring = mergePastRecurringTransactions(
          transactionsData as Transaction[],
          Array.isArray(upcomingRecurringTransactions) ? upcomingRecurringTransactions : [],
        );

        const pastTransactions = transactionsWithRecurring.filter((transaction: Transaction) => {
          const parsedDate = new Date(transaction.transactionDate).getTime();

          return !Number.isNaN(parsedDate) && parsedDate <= now;
        });

        const sortedTransactions = [...pastTransactions].sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
        );

        setTransactions(sortedTransactions);
        setAccounts(accountsData);
      } catch (error) {
        console.log(error);
        setError('Unable to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
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

  const visibleTransactions = showMore ? transactions.slice(0, 10) : transactions.slice(0, 5);

  const canShowMore = transactions.length > 5 && !showMore;
  const canShowLess = transactions.length > 5 && showMore;

  if (loading) {
    return (
      <section className='dashboard-card p-5 md:p-6 xl:p-7'>
        <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
          <div>
            <p className='dashboard-eyebrow'>Activity</p>
            <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
              Recent Transactions
            </h2>
          </div>
          <Link
            href='/dashboard/transactions/history'
            className='dashboard-support text-sm underline-offset-4 hover:underline'>
            View All
          </Link>
        </div>
        <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
        <div className='space-y-3'>
          {[1, 2, 3].map((item) => (
            <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
              <div className='dashboard-skeleton-strong mb-3 h-4 w-32 rounded' />
              <div className='dashboard-skeleton-soft mb-2 h-3 w-24 rounded' />
              <div className='dashboard-skeleton-strong h-5 w-28 rounded' />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Activity</p>
        <h2 className='dashboard-heading dashboard-section-title'>Transactions Unavailable</h2>
        <p className='dashboard-support mt-2'>{error}</p>
      </section>
    );
  }

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
        <div>
          <p className='dashboard-eyebrow'>Activity</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Recent Transactions
          </h2>
        </div>
        <Link
          href='/dashboard/transactions/history'
          className='dashboard-support text-sm underline-offset-4 hover:underline'>
          View All
        </Link>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      {transactions.length === 0 ? (
        <p className='dashboard-support'>No recent transactions yet</p>
      ) : (
        <>
          <div className='grid gap-3 md:gap-4'>
            {visibleTransactions.map((transaction) => {
              const isIncoming = isIncomingTransaction(transaction.type);
              const account = getAccountByType(transaction.accountType);
              return (
                <article
                  key={transaction.id}
                  className='dashboard-subcard p-4 transition hover:bg-(--color-card) md:p-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='dashboard-eyebrow'>{transaction.type.replace('_', ' ')}</p>
                        {transaction.isRecurring && (
                          <span className='dashboard-eyebrow rounded-lg border border-(--color-border) px-2 py-1'>
                            {transaction.recurringLabel ?? 'Recurring'}
                          </span>
                        )}
                      </div>
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
          {(canShowMore || canShowLess) && (
            <div className='mt-5 flex justify-center md:mt-6'>
              <button
                type='button'
                onClick={() => setShowMore((prev) => !prev)}
                className='dashboard-heading inline-flex items-center justify-center rounded-xl border border-(--color-border) px-4 py-3 transition hover:cursor-pointer hover:bg-white/5'>
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RecentTransactions;
