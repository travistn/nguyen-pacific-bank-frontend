'use client';

import { useState, useEffect } from 'react';

import { apiFetch } from '@/lib/api/client';

type Account = {
  id: number;
  accountNumber: string;
  balance: number;
  type: 'CHECKING' | 'SAVINGS';
};

const BalanceSummary = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await apiFetch('/api/accounts');

        setAccounts(data);
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
      <div className='rounded-2xl bg-[#0f1a2b] p-6 shadow-lg text-white'>Loading balance...</div>
    );
  }

  if (error) {
    return <div className='rounded-2xl bg-[#0f1a2b] p-6 text-white shadow-lg'>{error}</div>;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const checkingTotal = accounts
    .filter((acc) => acc.type === 'CHECKING')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const savingsTotal = accounts
    .filter((acc) => acc.type === 'SAVINGS')
    .reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className='rounded-2xl bg-[#0f1a2b] p-6 shadow-lg'>
      <h2 className='text-sm text-gray-400'>Total Balance</h2>
      <p className='mt-2 text-3xl font-bold text-white'>{formatMoney(totalBalance)}</p>
      <p className='mt-1 text-xs text-gray-400'>
        {accounts.length} account{accounts.length !== 1 && 's'}
      </p>
      <div className=' mt-6 grid grid-cols-2 gap-4'>
        <div>
          <p className='text-xs text-gray-400'>Checking</p>
          <p className='text-lg font-semibold text-white'>{formatMoney(checkingTotal)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-400'>Savings</p>
          <p className='text-lg font-semibold text-white'>{formatMoney(savingsTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
