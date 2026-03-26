import { Suspense } from 'react';

import LoginPageContent from './login-page-content';

const LoginPage = () => {
  return (
    <Suspense fallback={<div className='min-h-screen bg-(--color-page-bg)' />}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
