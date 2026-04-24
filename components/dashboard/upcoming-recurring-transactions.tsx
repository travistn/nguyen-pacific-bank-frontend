'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  createRecurringTransaction,
  getUpcomingRecurringTransactions,
  RECURRING_TRANSACTIONS_UPDATED_EVENT,
  type UpcomingRecurringTransaction,
} from '@/lib/api/recurring-transactions';
import { ApiError, apiFetch } from '@/lib/api/client';
import { getEffectiveUpcomingRunDate } from '@/lib/transactions/recurring-display';

type Account = {
  id: number;
  accountNumber: string;
  type: 'CHECKING' | 'SAVINGS';
};

const UpcomingRecurringTransactions = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<UpcomingRecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const formatAccountType = (accountType: Account['type']) =>
    accountType.charAt(0) + accountType.slice(1).toLowerCase();

  const maskAccountNumber = (accountNumber: string) => `**** ${accountNumber.slice(-4)}`;

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.type === b.type) return 0;
    if (a.type === 'CHECKING') return -1;
    if (b.type === 'CHECKING') return 1;
    return 0;
  });

  const resetForm = () => {
    setSelectedAccountId(sortedAccounts[0] ? String(sortedAccounts[0].id) : '');
    setDescription('');
    setAmount('');
    setFormError('');
  };

  const getCurrentDayOfMonth = () => Math.min(new Date().getDate(), 28);

  const loadData = async () => {
    try {
      const [accountsData, recurringData] = await Promise.all([
        apiFetch('/api/accounts'),
        getUpcomingRecurringTransactions(),
      ]);

      const nextAccounts = Array.isArray(accountsData) ? (accountsData as Account[]) : [];
      const nextTransactions = Array.isArray(recurringData)
        ? (recurringData as UpcomingRecurringTransaction[])
        : [];

      setAccounts(nextAccounts);
      setTransactions(nextTransactions);
      setError('');

      setSelectedAccountId((currentSelectedAccountId) => {
        if (currentSelectedAccountId) {
          const stillExists = nextAccounts.some(
            (account) => String(account.id) === currentSelectedAccountId,
          );

          if (stillExists) {
            return currentSelectedAccountId;
          }
        }

        const defaultAccount =
          nextAccounts.find((account) => account.type === 'CHECKING') ?? nextAccounts[0];

        return defaultAccount ? String(defaultAccount.id) : '';
      });
    } catch (error) {
      console.log(error);
      setError('Unable to load upcoming recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleRecurringTransactionsUpdated = () => {
      setLoading(true);
      loadData();
    };

    window.addEventListener(
      RECURRING_TRANSACTIONS_UPDATED_EVENT,
      handleRecurringTransactionsUpdated,
    );

    return () => {
      window.removeEventListener(
        RECURRING_TRANSACTIONS_UPDATED_EVENT,
        handleRecurringTransactionsUpdated,
      );
    };
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const getTransactionName = (transaction: UpcomingRecurringTransaction) =>
    transaction.name || transaction.label || transaction.description || 'Recurring transaction';

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

  const sortedTransactions = [...transactions].sort((a, b) => {
    const leftDate = getEffectiveUpcomingRunDate(a)?.getTime() ?? Number.NEGATIVE_INFINITY;
    const rightDate = getEffectiveUpcomingRunDate(b)?.getTime() ?? Number.NEGATIVE_INFINITY;

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return String(a.id ?? '').localeCompare(String(b.id ?? ''), undefined, { numeric: true });
  });

  const handleOpenForm = () => {
    setSuccessMessage('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setSuccessMessage('');
    setIsFormOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);
    const parsedAccountId = Number(selectedAccountId);
    const parsedDayOfMonth = getCurrentDayOfMonth();

    if (!selectedAccountId || Number.isNaN(parsedAccountId)) {
      setFormError('Please select an account.');
      return;
    }

    if (!trimmedDescription) {
      setFormError('Please enter a description.');
      return;
    }

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter an amount greater than 0.');
      return;
    }

    setSubmitting(true);

    try {
      await createRecurringTransaction({
        accountId: parsedAccountId,
        description: trimmedDescription,
        amount: parsedAmount,
        dayOfMonth: parsedDayOfMonth,
      });

      await loadData();
      window.dispatchEvent(new Event(RECURRING_TRANSACTIONS_UPDATED_EVENT));
      router.refresh();
      resetForm();
      setIsFormOpen(false);
      setSuccessMessage('Recurring transaction created successfully.');
    } catch (error) {
      console.log(error);

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        setFormError(
          'We could not create that recurring transaction. Please check the details and try again.',
        );
      } else {
        setFormError(
          'Something went wrong while creating the recurring transaction. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className='dashboard-card p-5 md:p-6 xl:p-7'>
        <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
          <div>
            <p className='dashboard-eyebrow'>Recurring</p>
            <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
              Upcoming Charges
            </h2>
          </div>
          <div className='h-11 w-full max-w-[16rem] rounded-xl border border-(--color-border) bg-(--color-overlay) opacity-70' />
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
        <h2 className='dashboard-heading dashboard-section-title'>Upcoming Charges Unavailable</h2>
        <p className='dashboard-support mt-2'>{error}</p>
      </section>
    );
  }

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='dashboard-eyebrow'>Recurring</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Upcoming Charges
          </h2>
        </div>
        <button
          type='button'
          onClick={isFormOpen ? handleCloseForm : handleOpenForm}
          disabled={loading || submitting || accounts.length === 0}
          className='dashboard-heading inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'>
          {isFormOpen ? 'Cancel' : 'Create Recurring Transaction'}
        </button>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      {successMessage && (
        <div className='dashboard-subcard mb-4 border-[color-mix(in_srgb,var(--color-accent-primary)_32%,var(--color-border))] p-4 md:p-5'>
          <p className='dashboard-eyebrow'>Success</p>
          <p className='dashboard-heading mt-2'>{successMessage}</p>
        </div>
      )}
      {accounts.length === 0 && !error && (
        <div className='dashboard-subcard mb-4 p-4 md:p-5'>
          <p className='dashboard-eyebrow'>Recurring</p>
          <p className='dashboard-support mt-2'>
            Create an account before setting up a recurring transaction.
          </p>
        </div>
      )}
      {isFormOpen && accounts.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className='dashboard-subcard mb-4 grid gap-3 p-4 md:mb-5 md:gap-4 md:p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='dashboard-heading text-base md:text-lg'>Create recurring transaction</p>
              <p className='dashboard-support mt-2'>
                Schedule a repeating charge for one of your accounts.
              </p>
            </div>
            <span className='dashboard-chip dashboard-chip-active dashboard-chip-label rounded-full px-3 py-1'>
              New
            </span>
          </div>
          {formError && (
            <div className='rounded-xl border border-[color-mix(in_srgb,var(--color-accent-secondary)_28%,var(--color-border))] bg-(--color-shell) px-4 py-3'>
              <p className='dashboard-eyebrow'>Error</p>
              <p className='dashboard-heading mt-2'>{formError}</p>
            </div>
          )}
          <div>
            <label htmlFor='recurring-account' className='dashboard-eyebrow block'>
              Account
            </label>
            <select
              id='recurring-account'
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              disabled={submitting}
              className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition focus:border-(--color-accent-secondary)'>
              <option value=''>Select an account</option>
              {sortedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {`${formatAccountType(account.type)} - ${maskAccountNumber(account.accountNumber)}`}
                </option>
              ))}
            </select>
          </div>
          <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-4'>
            <div>
              <label htmlFor='recurring-description' className='dashboard-eyebrow block'>
                Description
              </label>
              <input
                id='recurring-description'
                type='text'
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
                placeholder='Netflix'
                className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition placeholder:text-(--color-text-muted) focus:border-(--color-accent-secondary)'
              />
            </div>
            <div>
              <label htmlFor='recurring-amount' className='dashboard-eyebrow block'>
                Amount
              </label>
              <input
                id='recurring-amount'
                type='number'
                min='0.01'
                step='0.01'
                inputMode='decimal'
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={submitting}
                placeholder='0.00'
                className='dashboard-heading mt-3 w-full rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 outline-none transition placeholder:text-(--color-text-muted) focus:border-(--color-accent-secondary)'
              />
            </div>
          </div>
          <div className='flex flex-col gap-3 md:flex-row md:justify-end'>
            <button
              type='button'
              onClick={handleCloseForm}
              disabled={submitting}
              className='dashboard-heading rounded-xl border border-(--color-border) bg-(--color-shell) px-4 py-3 text-(--color-text-primary) transition hover:cursor-pointer hover:border-(--color-accent-secondary) disabled:cursor-not-allowed disabled:opacity-60'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='dashboard-heading rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'>
              {submitting ? 'Creating...' : 'Save Recurring Transaction'}
            </button>
          </div>
        </form>
      )}
      {sortedTransactions.length === 0 ? (
        <p className='dashboard-support'>No upcoming recurring transactions</p>
      ) : (
        <div className='grid gap-3 md:gap-4'>
          {sortedTransactions.map((transaction, index) => {
            const amount = Math.abs(Number(transaction.amount ?? 0));
            const effectiveNextRunDate = getEffectiveUpcomingRunDate(transaction);

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
                      Next charge:{' '}
                      {effectiveNextRunDate
                        ? formatNextRunDate(effectiveNextRunDate.toISOString())
                        : 'Date unavailable'}
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
