'use client';

import { useState, useEffect } from 'react';

import { apiFetch } from '@/lib/api/client';

type Account = {
  id: number;
  accountNumber: string;
  balance: number;
  type: 'CHECKING' | 'SAVINGS';
};

const AccountsList = () => {
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
        setError('Unable to load accounts');
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

  const maskAccountNumber = (accountNumber: string) => {
    const lastFour = accountNumber.slice(-4);
    return `•••• ${lastFour}`;
  };

  const formatAccountType = (type: Account['type']) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <section className='rounded-2xl bg-[#0f1a2b] p-5 shadow-sm md:p-6 xl:p-7'>
        <div className='mb-4'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-slate-400'>Accounts</p>
          <h2 className='mt-2 text-xl font-semibold text-white md:text-2xl'>Your accounts</h2>
        </div>
        <div className='space-y-3'>
          {[1, 2].map((item) => (
            <div
              key={item}
              className='animate-pulse rounded-2xl border border-slate-800 bg-[#122033] p-4 md:p-5'>
              <div className='mb-3 h-4 w-28 rounded bg-slate-700' />
              <div className='mb-2 h-3 w-20 rounded bg-slate-800' />
              <div className='h-6 w-32 rounded bg-slate-700' />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return <div className='rounded-2xl bg-[#0f1a2b] p-6 text-white shadow-lg'>{error}</div>;
  }

  return (
    <section className='rounded-2xl bg-[#0f1a2b] p-5 shadow-sm md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3'>
        <div>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-slate-400'>Accounts</p>
          <h2 className='mt-2 text-xl font-semibold text-white md:text-2xl'>Your Accounts</h2>
        </div>
        <p className='text-sm text-slate-400 md:text-base'>
          {`${accounts.length} account${accounts.length > 1 ? 's' : ''}`}
        </p>
      </div>
      <div className='grid gap-3 md:gap-4 xl:grid-cols-4'>
        {accounts?.map((account) => (
          <article
            key={account.id}
            className='rounded-2xl border border-slate-800 bg-[#122033] p-4 transition hover:border-slate-700 hover:bg-[#16263d] md:p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-medium uppercase tracking-[0.16em] text-slate-400'>
                  {formatAccountType(account.type)}
                </p>
                <p className='mt-2 text-sm text-slate-500 md:text-base'>
                  {maskAccountNumber(account.accountNumber)}
                </p>
              </div>
              <span className='rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300'>
                Active
              </span>
            </div>
            <div className='mt-6'>
              <p className='text-sm text-slate-400'>Available balance</p>
              <p className='mt-2 text-2xl font-semibold text-white md:text-3xl'>
                {formatMoney(account.balance)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AccountsList;
