'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { apiFetch, isUnauthorizedError } from '@/lib/api/client';

const ProtectPage = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        await apiFetch('/api/accounts');

        if (isMounted) {
          setIsChecking(false);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isUnauthorizedError(error)) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        setIsChecking(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isChecking) {
    return <div className='min-h-screen bg-(--color-page-bg)' />;
  }

  return <>{children}</>;
};

export default ProtectPage;
