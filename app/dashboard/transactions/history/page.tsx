'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api/client';
import { getRecurringTransaction } from '@/lib/api/recurring-transaction';
import {
  mapRecurringTransaction,
  markRecurringTransaction,
} from '@/lib/transactions/recurring-transaction';
import DashboardBackButton from '@/components/dashboard/dashboard-back-button';
import TransactionList, { type Transaction } from '@/components/transactions/transaction-list';
import type { TransactionFilters } from '@/components/transactions/transaction-history-filters';

const TransactionsHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'ALL',
    accountType: 'ALL',
  });

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [data, recurringTransaction] = await Promise.all([
          apiFetch('/api/transactions'),
          getRecurringTransaction(),
        ]);
        const recurringDisplayTransaction = mapRecurringTransaction(recurringTransaction);
        const transactionsWithRecurringLabels = recurringDisplayTransaction
          ? data.map((transaction: Transaction) =>
              markRecurringTransaction(transaction, recurringDisplayTransaction),
            )
          : data;

        const sortedTransactions = [...transactionsWithRecurringLabels].sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
        );

        setTransactions(sortedTransactions);
      } catch (error) {
        console.log(error);
        setError('Unable to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        filters.type === 'ALL'
          ? true
          : filters.type === 'TRANSFER'
            ? transaction.type === 'TRANSFER_IN' || transaction.type === 'TRANSFER_OUT'
            : transaction.type === filters.type;

      const matchesAccountType =
        filters.accountType === 'ALL' ? true : transaction.accountType === filters.accountType;

      return matchesType && matchesAccountType;
    });
  }, [transactions, filters]);

  return (
    <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
      <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
        <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
          <DashboardBackButton className='mb-4 md:mb-5' />
          <div className='mx-auto max-w-6xl'>
            <section className='dashboard-card p-5 md:p-6 xl:p-7'>
              <div className='mb-4 flex flex-col gap-4 md:mb-5 md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='dashboard-eyebrow'>Transactions</p>
                  <h1 className='dashboard-heading mt-2 text-2xl md:text-3xl'>
                    Transaction History
                  </h1>
                </div>
                <Link
                  href='/dashboard/transactions'
                  className='dashboard-heading inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90'>
                  Create Transaction
                </Link>
              </div>
              <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
              <p className='dashboard-support max-w-2xl md:text-base'>
                Review your recent account activity, including deposits, withdrawals, and transfers
                across your accounts.
              </p>
            </section>
            <div className='mt-6 md:mt-8'>
              {loading ? (
                <section className='dashboard-card p-5 md:p-6 xl:p-7'>
                  <div className='mb-4 flex flex-col gap-4 md:mb-5 md:flex-row md:items-end md:justify-between'>
                    <div>
                      <p className='dashboard-eyebrow'>Activity</p>
                      <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
                        Transaction Activity
                      </h2>
                    </div>
                    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-end'>
                      <div className='dashboard-subcard h-12 rounded-xl md:min-w-44' />
                      <div className='dashboard-subcard h-12 rounded-xl md:min-w-44' />
                    </div>
                  </div>
                  <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
                  <div className='space-y-3'>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
                        <div className='dashboard-skeleton-strong mb-3 h-4 w-32 rounded' />
                        <div className='dashboard-skeleton-soft mb-2 h-3 w-24 rounded' />
                        <div className='dashboard-skeleton-strong h-5 w-28 rounded' />
                      </div>
                    ))}
                  </div>
                </section>
              ) : error ? (
                <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
                  <p className='dashboard-eyebrow'>Activity</p>
                  <h2 className='dashboard-heading dashboard-section-title'>
                    Transactions Unavailable
                  </h2>
                  <p className='dashboard-support mt-2'>{error}</p>
                </section>
              ) : (
                <TransactionList
                  transactions={filteredTransactions}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TransactionsHistoryPage;
