'use client';

import { useState, useEffect } from 'react';

import { apiFetch } from '@/lib/api/client';
import { getUpcomingRecurringTransactions } from '@/lib/api/recurring-transactions';
import { applyPastRecurringTransactionsToAccounts } from '@/lib/transactions/recurring-display';

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

const BalanceSummary = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [accountsData, transactionsData, upcomingRecurringTransactions] = await Promise.all([
          apiFetch('/api/accounts'),
          apiFetch('/api/transactions'),
          getUpcomingRecurringTransactions(),
        ]);

        const adjustedAccounts = applyPastRecurringTransactionsToAccounts(
          accountsData as Account[],
          transactionsData as Transaction[],
          Array.isArray(upcomingRecurringTransactions) ? upcomingRecurringTransactions : [],
        );

        setAccounts(adjustedAccounts);
      } catch (error) {
        console.log(error);
        setError('Unable to load balance summary');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return (
      <section className='dashboard-card dashboard-status p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Overview</p>
        <h2 className='dashboard-heading dashboard-section-title'>Loading Balance</h2>
        <p className='dashboard-support'>{`We're pulling in your latest account totals.`}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Overview</p>
        <h2 className='dashboard-heading dashboard-section-title'>Balance Unavailable</h2>
        <p className='dashboard-support'>{error}</p>
      </section>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const checkingTotal = accounts
    .filter((acc) => acc.type === 'CHECKING')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const savingsTotal = accounts
    .filter((acc) => acc.type === 'SAVINGS')
    .reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
        <div>
          <p className='dashboard-eyebrow'>Overview</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Total Balance
          </h2>
        </div>
        <p className='dashboard-support md:text-base'>
          {`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      <p className='dashboard-accent-value text-2xl font-semibold md:text-3xl'>
        {formatMoney(totalBalance)}
      </p>
      <div className='mt-6 grid grid-cols-2 gap-4 md:mt-7'>
        <div>
          <p className='dashboard-support'>Checking</p>
          <p className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            {formatMoney(checkingTotal)}
          </p>
        </div>
        <div>
          <p className='dashboard-support'>Savings</p>
          <p className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            {formatMoney(savingsTotal)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BalanceSummary;
