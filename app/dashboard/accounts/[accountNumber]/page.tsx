'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { apiFetch } from '@/lib/api/client';
import { getUpcomingRecurringTransactions } from '@/lib/api/recurring-transactions';
import {
  applyPastRecurringTransactionsToAccounts,
  mergePastRecurringTransactions,
} from '@/lib/transactions/recurring-display';
import DashboardBackButton from '@/components/dashboard/dashboard-back-button';

type Account = {
  id: number;
  accountNumber: string;
  balance: number;
  type: 'CHECKING' | 'SAVINGS';
};

type Transaction = {
  id: number | string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  description: string;
  transactionDate: string;
  accountType: 'CHECKING' | 'SAVINGS';
  isRecurring?: boolean;
  recurringLabel?: string;
};

const AccountDetailsPage = () => {
  const params = useParams<{ accountNumber: string }>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        const [accountsData, transactionsData, upcomingRecurringTransactions] = await Promise.all([
          apiFetch('/api/accounts'),
          apiFetch('/api/transactions'),
          getUpcomingRecurringTransactions(),
        ]);

        const recurringTransactions = Array.isArray(upcomingRecurringTransactions)
          ? upcomingRecurringTransactions
          : [];

        setAccounts(
          applyPastRecurringTransactionsToAccounts(
            accountsData as Account[],
            transactionsData as Transaction[],
            recurringTransactions,
          ),
        );
        setTransactions(
          mergePastRecurringTransactions(transactionsData as Transaction[], recurringTransactions),
        );
      } catch (error) {
        console.log(error);
        setError('Unable to load account details');
      } finally {
        setLoading(false);
      }
    };

    loadAccountDetails();
  }, []);

  const selectedAccount = useMemo(() => {
    return accounts.find((account) => account.accountNumber === params.accountNumber);
  }, [accounts, params.accountNumber]);

  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return [];

    return transactions
      .filter((transaction) => transaction.accountType === selectedAccount.type)
      .sort(
        (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
      );
  }, [transactions, selectedAccount]);

  const recentTransactions = accountTransactions.slice(0, 5);

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

  const formatAccountType = (type: Account['type']) => {
    switch (type) {
      case 'CHECKING':
        return 'Checking';
      case 'SAVINGS':
        return 'Savings';
      default:
        return type;
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    const lastFour = accountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  const maskAccountNumbersInText = (text: string) => {
    return text.replace(/\d{5,}/g, (match) => {
      const last4 = match.slice(-4);
      return `**** ${last4}`;
    });
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

  const isIncomingTransaction = (type: Transaction['type']) => {
    return type === 'DEPOSIT' || type === 'TRANSFER_IN';
  };

  if (loading) {
    return (
      <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
        <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
          <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
            <DashboardBackButton className='mb-4 md:mb-5' />
            <div className='mx-auto max-w-6xl'>
              <section className='dashboard-card p-5 md:p-6 xl:p-7'>
                <div className='mb-4'>
                  <div className='dashboard-skeleton-soft h-4 w-24 rounded' />
                  <div className='dashboard-skeleton-strong mt-3 h-8 w-56 rounded' />
                  <div className='dashboard-skeleton-soft mt-3 h-4 w-40 rounded' />
                </div>
                <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
                <div className='grid gap-3 md:grid-cols-3 md:gap-4'>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
                      <div className='dashboard-skeleton-soft h-3 w-24 rounded' />
                      <div className='dashboard-skeleton-strong mt-3 h-7 w-32 rounded' />
                    </div>
                  ))}
                </div>
              </section>
              <section className='mt-6 dashboard-card p-5 md:mt-8 md:p-6 xl:p-7'>
                <div className='mb-4'>
                  <div className='dashboard-skeleton-soft h-4 w-20 rounded' />
                  <div className='dashboard-skeleton-strong mt-3 h-7 w-48 rounded' />
                </div>
                <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
                <div className='space-y-3'>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
                      <div className='dashboard-skeleton-soft h-3 w-24 rounded' />
                      <div className='dashboard-skeleton-strong mt-3 h-5 w-44 rounded' />
                      <div className='dashboard-skeleton-soft mt-3 h-4 w-32 rounded' />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
        <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
          <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
            <DashboardBackButton className='mb-4 md:mb-5' />
            <div className='mx-auto max-w-6xl'>
              <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
                <p className='dashboard-eyebrow'>Accounts</p>
                <h1 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
                  Account Details Unavailable
                </h1>
                <p className='dashboard-support mt-2'>{error}</p>
              </section>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!selectedAccount) {
    return (
      <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
        <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
          <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
            <DashboardBackButton className='mb-4 md:mb-5' />
            <div className='mx-auto max-w-6xl'>
              <section className='dashboard-card p-5 md:p-6 xl:p-7'>
                <p className='dashboard-eyebrow'>Accounts</p>
                <h1 className='dashboard-heading mt-2 text-2xl md:text-3xl'>Account Not Found</h1>
                <div className='dashboard-accent-divider mb-4 mt-4 h-px w-20 rounded-full md:mb-5' />
                <p className='dashboard-support max-w-2xl md:text-base'>
                  The account you selected could not be found.
                </p>
                <Link
                  href='/dashboard'
                  className='dashboard-heading mt-5 inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90'>
                  Return To Dashboard
                </Link>
              </section>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
      <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
        <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
          <DashboardBackButton className='mb-4 md:mb-5' />
          <div className='mx-auto max-w-6xl'>
            <section className='dashboard-card p-5 md:p-6 xl:p-7'>
              <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='dashboard-eyebrow'>Accounts</p>
                  <h1 className='dashboard-heading mt-2 text-2xl md:text-3xl'>
                    {formatAccountType(selectedAccount.type)} Account
                  </h1>
                  <p className='dashboard-support mt-3 md:text-base'>
                    {maskAccountNumber(selectedAccount.accountNumber)}
                  </p>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='dashboard-chip dashboard-chip-active dashboard-chip-label rounded-full px-3 py-1'>
                    Active
                  </span>
                  <Link
                    href='/dashboard/transactions'
                    className='dashboard-heading inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90'>
                    Create Transaction
                  </Link>
                </div>
              </div>
              <div className='dashboard-accent-divider mb-4 mt-4 h-px w-20 rounded-full md:mb-5' />
              <p className='dashboard-support max-w-2xl md:text-base'>
                Review your current balance and recent activity for this account.
              </p>
              <div className='mt-6 grid gap-3 md:grid-cols-3 md:gap-4'>
                <article className='dashboard-subcard p-4 md:p-5'>
                  <p className='dashboard-support'>Available Balance</p>
                  <p className='dashboard-heading mt-3 text-2xl md:text-3xl'>
                    {formatMoney(selectedAccount.balance)}
                  </p>
                </article>
                <article className='dashboard-subcard p-4 md:p-5'>
                  <p className='dashboard-support'>Recent Activity</p>
                  <p className='dashboard-heading mt-3 text-2xl md:text-3xl'>
                    {accountTransactions.length}
                  </p>
                  <p className='dashboard-support mt-2'>Transactions found</p>
                </article>
                <article className='dashboard-subcard p-4 md:p-5'>
                  <p className='dashboard-support'>Account Type</p>
                  <p className='dashboard-heading mt-3 text-2xl md:text-3xl'>
                    {formatAccountType(selectedAccount.type)}
                  </p>
                  <p className='dashboard-support mt-2'>Primary status: Active</p>
                </article>
              </div>
            </section>
            <section className='mt-6 dashboard-card p-5 md:mt-8 md:p-6 xl:p-7'>
              <div className='mb-4 flex flex-col gap-4 md:mb-5 md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='dashboard-eyebrow'>Activity</p>
                  <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
                    Recent Activity
                  </h2>
                </div>
                <Link
                  href='/dashboard/transactions/history'
                  className='dashboard-support inline-flex items-center hover:underline md:text-base'>
                  View Full History
                </Link>
              </div>
              <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
              {recentTransactions.length === 0 ? (
                <div className='dashboard-subcard flex flex-col items-start gap-4 p-5 md:p-6'>
                  <div>
                    <p className='dashboard-heading text-base md:text-lg'>No recent activity</p>
                    <p className='dashboard-support mt-2 md:text-base'>
                      Create a new transaction to start tracking activity for this account.
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
                  {recentTransactions.map((transaction) => {
                    const isIncoming = isIncomingTransaction(transaction.type);
                    return (
                      <article
                        key={transaction.id}
                        className='dashboard-subcard p-4 transition hover:bg-(--color-card) md:p-5'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='dashboard-eyebrow'>
                              {transaction.type.replace('_', ' ')}
                            </p>
                            <p className='dashboard-heading mt-2 truncate text-base md:text-lg'>
                              {formatTransactionLabel(transaction)}
                            </p>
                            <p className='dashboard-support mt-2 md:text-base'>
                              {formatDate(transaction.transactionDate)}
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
          </div>
        </div>
      </section>
    </main>
  );
};

export default AccountDetailsPage;
