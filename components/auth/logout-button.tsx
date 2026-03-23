'use client';

import { useRouter } from 'next/navigation';

import { logout } from '@/lib/api/auth';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();

      router.push('/');
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      type='button'
      onClick={handleLogout}
      className='rounded-xl border border-white/15 px-4 py-2 text-sm'>
      Logout
    </button>
  );
};

export default LogoutButton;
