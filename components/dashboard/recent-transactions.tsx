'use client';

import { apiFetch } from '@/lib/api/client';
import { useState, useEffect } from 'react';

type Transaction = {
  id: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  description: string;
  transactionDate: string;
  accountType: 'CHECKING' | 'SAVINGS';
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await apiFetch('/api/transactions');

        setTransactions(data);
      } catch (error) {
        console.log(error);
        setError('Unable to load transactions');
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

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

  const isIncomingTransaction = (type: Transaction['type']) => {
    return type === 'DEPOSIT' || type === 'TRANSFER_IN';
  };

  const formatTransactionLabel = (transaction: Transaction) => {
    if (transaction.description?.trim()) {
      return transaction.description;
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

  if (loading) {
    return (
      <section className='dashboard-card p-5 md:p-6 xl:p-7'>
        <div className='mb-4'>
          <p className='dashboard-eyebrow'>Activity</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Recent Transactions
          </h2>
        </div>

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
        <p className='dashboard-support'>{error}</p>
      </section>
    );
  }

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3'>
        <div>
          <p className='dashboard-eyebrow'>Activity</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Recent Transactions
          </h2>
        </div>
        <p>{`${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}</p>
      </div>
      {transactions.length === 0 ? (
        <p className='dashboard-support'>No recent transactions yet</p>
      ) : (
        <div className='grid gap-3 md:gap-4'>
          {transactions.map((transaction) => {
            const isIncoming = isIncomingTransaction(transaction.type);

            return (
              <article key={transaction.id} className='dashboard-subcard p-4 md:p-5'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='dashboard-eyebrow'>{transaction.type.replace('_', '')}</p>
                    <p className='dashboard-heading mt-2 truncate text-base md:text-lg'>
                      {formatTransactionLabel(transaction)}
                    </p>
                    <p className='dashboard-support mt-2 md:text-base'>
                      {formatAccountType(transaction.accountType)} •{' '}
                      {formatDate(transaction.transactionDate)}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-lg font-semibold md:text-2xl ${isIncoming ? 'dashboard-accent-value' : 'text-white'}`}>
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

export default RecentTransactions;
