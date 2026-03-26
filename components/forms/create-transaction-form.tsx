'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiFetch } from '@/lib/api/client';

type Account = {
  id: number;
  accountNumber: string;
  balance: number;
  type: 'CHECKING' | 'SAVINGS';
};

type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

const CreateTransactionForm = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
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
          const defaultSourceAccount =
            data.find((account: Account) => account.type === 'CHECKING') ?? data[0];

          setAccountNumber(defaultSourceAccount.accountNumber);

          const defaultDestinationAccount = data.find(
            (account: Account) => account.accountNumber !== defaultSourceAccount.accountNumber,
          );

          if (defaultDestinationAccount) {
            setDestinationAccountNumber(defaultDestinationAccount.accountNumber);
          }
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

  useEffect(() => {
    if (type !== 'TRANSFER') return;

    if (!destinationAccountNumber || destinationAccountNumber === accountNumber) {
      const firstAvailableDestination = accounts.find(
        (account) => account.accountNumber !== accountNumber,
      );

      setDestinationAccountNumber(firstAvailableDestination?.accountNumber ?? '');
    }
  }, [type, accountNumber, destinationAccountNumber, accounts]);

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (a.type === b.type) return 0;
      if (a.type === 'CHECKING') return -1;
      return 1;
    });
  }, [accounts]);

  const selectedAccount = accounts.find((account) => account.accountNumber === accountNumber);

  const destinationAccount = accounts.find(
    (account) => account.accountNumber === destinationAccountNumber,
  );

  const destinationAccounts = sortedAccounts.filter(
    (account) => account.accountNumber !== accountNumber,
  );

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const parsedAmount = Number(amount);

    if (!accountNumber) {
      setErrorMessage(
        type === 'TRANSFER' ? 'Please select a from account' : 'Please select an account',
      );
      return;
    }

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      return;
    }

    if (
      (type === 'WITHDRAWAL' || type === 'TRANSFER') &&
      selectedAccount &&
      parsedAmount > selectedAccount.balance
    ) {
      setErrorMessage('Insufficient funds');
      return;
    }

    if (type === 'TRANSFER') {
      if (!destinationAccountNumber) {
        setErrorMessage('Please select a to account');
        return;
      }

      if (accountNumber === destinationAccountNumber) {
        setErrorMessage('From and to accounts must be different');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (type === 'TRANSFER') {
        await apiFetch('/api/transactions/transfer', {
          method: 'POST',
          body: JSON.stringify({
            fromAccountNumber: accountNumber,
            toAccountNumber: destinationAccountNumber,
            amount: parsedAmount,
          }),
        });
      } else {
        await apiFetch('/api/transactions', {
          method: 'POST',
          body: JSON.stringify({
            accountNumber,
            amount: parsedAmount,
            type,
            description: description.trim(),
          }),
        });
      }

      setDescription('');
      setAmount('');

      alert(
        type === 'TRANSFER'
          ? 'Transfer completed successfully'
          : type === 'DEPOSIT'
            ? 'Deposit completed successfully'
            : 'Withdrawal completed successfully',
      );

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.log(error);
      setErrorMessage(
        type === 'TRANSFER' ? 'Unable to complete transfer' : 'Unable to create transaction',
      );
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
        <p className='dashboard-support md:text-base'>Deposit, withdraw, or transfer funds</p>
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
              <p className='dashboard-eyebrow'>
                {type === 'TRANSFER' ? 'From Account' : formatAccountType(selectedAccount.type)}
              </p>
              <p className='dashboard-support mt-2 md:text-base'>
                {formatAccountType(selectedAccount.type)} •{' '}
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
      {type === 'TRANSFER' && destinationAccount && (
        <article className='dashboard-subcard mb-4 p-4 md:mb-5 md:p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='dashboard-eyebrow'>To Account</p>
              <p className='dashboard-support mt-2 md:text-base'>
                {formatAccountType(destinationAccount.type)} •{' '}
                {maskAccountNumber(destinationAccount.accountNumber)}
              </p>
            </div>
            <span className='dashboard-chip dashboard-chip-active dashboard-chip-label rounded-full px-3 py-1'>
              Destination
            </span>
          </div>
          <div className='mt-6'>
            <p className='dashboard-support'>Current Balance</p>
            <p className='dashboard-heading mt-2 text-2xl md:text-3xl'>
              {formatMoney(destinationAccount.balance)}
            </p>
          </div>
        </article>
      )}
      <form onSubmit={handleSubmit} className='grid gap-3 md:gap-4'>
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
              <option value='TRANSFER'>Transfer</option>
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
          <label htmlFor='account' className='dashboard-eyebrow block'>
            {type === 'TRANSFER' ? 'From Account' : 'Account'}
          </label>
          <select
            id='account'
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            disabled={submitting}
            className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition focus:border-(--color-accent-secondary)'>
            {sortedAccounts.map((account) => (
              <option key={account.id} value={account.accountNumber}>
                {formatAccountType(account.type)} • {maskAccountNumber(account.accountNumber)}
              </option>
            ))}
          </select>
        </div>
        {type !== 'TRANSFER' && (
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
        )}
        {type === 'TRANSFER' && (
          <div className='dashboard-subcard p-4 md:p-5'>
            <label htmlFor='destinationAccount' className='dashboard-eyebrow block'>
              To Account
            </label>
            <select
              id='destinationAccount'
              value={destinationAccountNumber}
              onChange={(event) => setDestinationAccountNumber(event.target.value)}
              disabled={submitting || destinationAccounts.length === 0}
              className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition focus:border-(--color-accent-secondary)'>
              {destinationAccounts.length === 0 ? (
                <option value=''>No destination accounts available</option>
              ) : (
                destinationAccounts.map((account) => (
                  <option key={account.id} value={account.accountNumber}>
                    {formatAccountType(account.type)} • {maskAccountNumber(account.accountNumber)}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
        <button
          type='submit'
          disabled={submitting}
          className='dashboard-heading rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:cursor-pointer hover:opacity-90 disabled:opacity-60'>
          {submitting
            ? type === 'TRANSFER'
              ? 'Submitting Transfer...'
              : 'Submitting...'
            : type === 'TRANSFER'
              ? 'Transfer Funds'
              : 'Submit Transaction'}
        </button>
      </form>
    </section>
  );
};

export default CreateTransactionForm;
