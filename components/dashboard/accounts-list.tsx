'use client';

import { useEffect, useState } from 'react';

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
    return `**** ${lastFour}`;
  };

  const formatAccountType = (type: Account['type']) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <section className='dashboard-card p-5 md:p-6 xl:p-7'>
        <div className='mb-4'>
          <p className='dashboard-eyebrow'>Accounts</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Your Accounts
          </h2>
        </div>
        <div className='space-y-3'>
          {[1, 2].map((item) => (
            <div key={item} className='dashboard-subcard animate-pulse p-4 md:p-5'>
              <div className='dashboard-skeleton-strong mb-3 h-4 w-28 rounded' />
              <div className='dashboard-skeleton-soft mb-2 h-3 w-20 rounded' />
              <div className='dashboard-skeleton-strong h-6 w-32 rounded' />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='dashboard-card dashboard-status dashboard-status-error p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Accounts</p>
        <h2 className='dashboard-heading dashboard-section-title'>Accounts Unavailable</h2>
        <p className='dashboard-support'>{error}</p>
      </section>
    );
  }

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.type === b.type) return 0;
    if (a.type === 'CHECKING') return -1;
    if (b.type === 'CHECKING') return 1;
    return 0;
  });

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3'>
        <div>
          <p className='dashboard-eyebrow'>Accounts</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Your Accounts
          </h2>
        </div>
        <p className='dashboard-support md:text-base'>
          {`${accounts.length} account${accounts.length > 1 ? 's' : ''}`}
        </p>
      </div>
      <div className='grid gap-3 md:gap-4 xl:grid-cols-4'>
        {sortedAccounts.map((account) => (
          <article
            key={account.id}
            className='dashboard-subcard p-4 transition hover:bg-(--color-card) md:p-5 hover:cursor-pointer'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='dashboard-eyebrow'>{formatAccountType(account.type)}</p>
                <p className='dashboard-support mt-2 md:text-base'>
                  {maskAccountNumber(account.accountNumber)}
                </p>
              </div>
              <span className='dashboard-chip dashboard-chip-active dashboard-chip-label rounded-full px-3 py-1'>
                Active
              </span>
            </div>
            <div className='mt-6'>
              <p className='dashboard-support'>Available Balance</p>
              <p className='dashboard-heading mt-2 text-2xl md:text-3xl'>
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
