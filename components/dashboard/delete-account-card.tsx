'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { deleteCurrentUser } from '@/lib/api/user';
import { isUnauthorizedError } from '@/lib/api/client';

const DeleteAccountCard = () => {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Permanently delete your Nguyen Pacific Bank account? This will remove your account and related banking data. This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setIsDeleting(true);

    try {
      await deleteCurrentUser();

      router.replace('/login');
      router.refresh();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace('/login');
        router.refresh();
        return;
      }

      console.log(error);
      setError('Unable to delete your account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='dashboard-eyebrow text-red-200'>Account</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>
            Delete Account
          </h2>
          <p className='dashboard-support mt-2 max-w-2xl'>
            Permanently delete your account and related banking data.
          </p>
          {error && (
            <p className='mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:text-base'>
              {error}
            </p>
          )}
        </div>
        <button
          type='button'
          onClick={handleDelete}
          disabled={isDeleting}
          className='inline-flex w-full items-center justify-center rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 transition hover:cursor-pointer hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:text-base'>
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </section>
  );
};

export default DeleteAccountCard;
