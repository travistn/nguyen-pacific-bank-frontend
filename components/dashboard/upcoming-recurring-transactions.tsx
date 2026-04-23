'use client';

import { useEffect, useState } from 'react';

import {
  getUpcomingRecurringTransactions,
  type UpcomingRecurringTransaction,
} from '@/lib/api/recurring-transactions';

const UpcomingRecurringTransactions = () => {
  const [transactions, setTransactions] = useState<UpcomingRecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUpcomingRecurringTransactions = async () => {
      try {
        const data = await getUpcomingRecurringTransactions();

        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
        setError('Unable to load upcoming recurring transactions');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingRecurringTransactions();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const getTransactionName = (transaction: UpcomingRecurringTransaction) =>
    transaction.name || transaction.label || transaction.description || 'Recurring transaction';

  const getNextRunDate = (transaction: UpcomingRecurringTransaction) =>
    transaction.nextRunDate ||
    transaction.nextRunAt ||
    transaction.scheduledDate ||
    transaction.transactionDate ||
    '';

  const formatNextRunDate = (nextRunDate: string) => {
    if (!nextRunDate) {
      return 'Date unavailable';
    }

    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(nextRunDate)
      ? `${nextRunDate}T12:00:00`
      : nextRunDate;

    const parsedDate = new Date(normalizedDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className='dashboard-card p-5 md:p-6 xl:p-7'>
        <div className='mb-4'>
          <p className='dashboard-eyebrow'>Recurring</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Upcoming Charges
          </h2>
        </div>
        <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
        <div className='space-y-3'>
          {[1, 2, 3].map((item) => (
            <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
              <div className='dashboard-skeleton-strong mb-3 h-4 w-28 rounded' />
              <div className='dashboard-skeleton-soft mb-2 h-3 w-24 rounded' />
              <div className='dashboard-skeleton-strong h-5 w-20 rounded' />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Recurring</p>
        <h2 className='dashboard-heading dashboard-section-title'>
          Upcoming Charges Unavailable
        </h2>
        <p className='dashboard-support mt-2'>{error}</p>
      </section>
    );
  }

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4'>
        <p className='dashboard-eyebrow'>Recurring</p>
        <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
          Upcoming Charges
        </h2>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      {transactions.length === 0 ? (
        <p className='dashboard-support'>No upcoming recurring transactions</p>
      ) : (
        <div className='grid gap-3 md:gap-4'>
          {transactions.map((transaction, index) => {
            const amount = Math.abs(Number(transaction.amount ?? 0));

            return (
              <article
                key={transaction.id ?? `${getTransactionName(transaction)}-${index}`}
                className='dashboard-subcard p-4 md:p-5'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='dashboard-heading truncate text-base md:text-lg'>
                      {getTransactionName(transaction)}
                    </p>
                    <p className='dashboard-support mt-2 md:text-base'>
                      Next charge: {formatNextRunDate(getNextRunDate(transaction))}
                    </p>
                  </div>
                  <p className='shrink-0 text-lg font-semibold text-white md:text-2xl'>
                    -{formatMoney(amount)}
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

export default UpcomingRecurringTransactions;
