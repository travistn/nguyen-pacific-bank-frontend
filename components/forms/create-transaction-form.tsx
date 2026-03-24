'use client';

import { apiFetch } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';

type Account = {
  id: number;
  accountNumber: string;
  balance: number;
  type: 'CHECKING' | 'SAVINGS';
};

type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

const CreateTransactionForm = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await apiFetch('/api/accounts');

        setAccounts(data);

        if (data.length > 0) {
          const defaultAccount =
            data.find((account: Account) => account.type === 'CHECKING') ?? data[0];

          setAccountNumber(defaultAccount.accountNumber);
        }
      } catch (error) {
        console.log(error);
        setErrorMessage('Unable to load accounts');
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

  const formatAccountType = (accountType: Account['type']) => {
    return accountType.charAt(0) + accountType.slice(1).toLowerCase();
  };

  const maskAccountNumber = (selectedAccountNumber: string) => {
    const lastFour = selectedAccountNumber.slice(-4);
    return `**** ${lastFour}`;
  };

  const selectedAccount = accounts.find((account) => account.accountNumber === accountNumber);
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.type === b.type) return 0;
    if (a.type === 'CHECKING') return -1;
    if (b.type === 'CHECKING') return 1;
    return 0;
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accountNumber) {
      setErrorMessage('Please select an account');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          accountNumber,
          amount: Number(amount),
          type,
          description: description.trim(),
        }),
      });

      alert(
        type === 'DEPOSIT' ? 'Deposit completed successfully' : 'Withdrawal completed successfully',
      );

      router.push('/dashboard');
    } catch (error) {
      console.log(error);
      setErrorMessage('Unable to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className='dashboard-card dashboard-status p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Transactions</p>
        <h2 className='dashboard-heading dashboard-section-title'>Loading Accounts</h2>
        <p className='dashboard-support'>{`We're pulling in your available accounts.`}</p>
      </section>
    );
  }

  if (!loading && accounts.length === 0) {
    return (
      <section className='dashboard-card dashboard-status p-5 md:p-6 xl:p-7'>
        <p className='dashboard-eyebrow'>Transactions</p>
        <h2 className='dashboard-heading dashboard-section-title'>No Accounts Available</h2>
        <p className='dashboard-support'>Create an account before making a transaction.</p>
      </section>
    );
  }

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
        <div>
          <p className='dashboard-eyebrow'>Transactions</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Create Transaction
          </h2>
        </div>
        <p className='dashboard-support md:text-base'>Deposit or withdraw funds</p>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      {errorMessage && (
        <div className='dashboard-subcard mb-4 border-[color-mix(in_srgb,var(--color-accent-secondary)_28%,var(--color-border))] p-4 md:p-5'>
          <p className='dashboard-eyebrow'>Error</p>
          <p className='dashboard-heading mt-2'>{errorMessage}</p>
        </div>
      )}
      {selectedAccount && (
        <article className='dashboard-subcard mb-4 p-4 md:mb-5 md:p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='dashboard-eyebrow'>{formatAccountType(selectedAccount.type)}</p>
              <p className='dashboard-support mt-2 md:text-base'>
                {maskAccountNumber(selectedAccount.accountNumber)}
              </p>
            </div>
            <span className='dashboard-chip dashboard-chip-active dashboard-chip-label rounded-full px-3 py-1'>
              Selected
            </span>
          </div>
          <div className='mt-6'>
            <p className='dashboard-support'>Available Balance</p>
            <p className='dashboard-heading mt-2 text-2xl md:text-3xl'>
              {formatMoney(selectedAccount.balance)}
            </p>
          </div>
        </article>
      )}
      <form onSubmit={handleSubmit} className='grid gap-3 md:gap-4'>
        <div className='dashboard-subcard p-4 md:p-5'>
          <label htmlFor='account' className='dashboard-eyebrow block'>
            Account
          </label>
          <select
            id='account'
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={submitting}
            className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition focus:border-(--color-accent-secondary)'>
            {sortedAccounts.map((account) => (
              <option key={account.id} value={account.accountNumber}>
                {formatAccountType(account.type)} • {maskAccountNumber(account.accountNumber)}
              </option>
            ))}
          </select>
        </div>
        <div className='grid gap-3 md:grid-cols-2 md:gap-4'>
          <div className='dashboard-subcard p-4 md:p-5'>
            <label htmlFor='type' className='dashboard-eyebrow block'>
              Transaction Type
            </label>
            <select
              id='type'
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
              disabled={submitting}
              className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition focus:border-(--color-accent-secondary)'>
              <option value='DEPOSIT'>Deposit</option>
              <option value='WITHDRAWAL'>Withdrawal</option>
            </select>
          </div>
          <div className='dashboard-subcard p-4 md:p-5'>
            <label htmlFor='amount' className='dashboard-eyebrow block'>
              Amount
            </label>
            <input
              id='amount'
              type='number'
              min='0.01'
              step='0.01'
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={submitting}
              placeholder='0.00'
              className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition placeholder:text-(--color-text-muted) focus:border-(--color-accent-secondary)'
            />
          </div>
        </div>
        <div className='dashboard-subcard p-4 md:p-5'>
          <label htmlFor='description' className='dashboard-eyebrow block'>
            Description
          </label>
          <input
            id='description'
            type='text'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={submitting}
            placeholder='Optional description'
            className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition placeholder:text-(--color-text-muted) focus:border-(--color-accent-secondary)'
          />
        </div>
        <button
          type='submit'
          disabled={submitting}
          className='dashboard-heading rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90 disabled:opacity-60 hover:cursor-pointer'>
          {submitting ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </form>
    </section>
  );
};

export default CreateTransactionForm;
