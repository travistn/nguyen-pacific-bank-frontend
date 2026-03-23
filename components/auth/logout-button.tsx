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
      className='rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:cursor-pointer transition-colors duration-200 hover:bg-white/10 hover:text-white active:bg-white/20'>
      Logout
    </button>
  );
};

export default LogoutButton;
