'use client';

import { useSearchParams } from 'next/navigation';

import LoginForm from '@/components/forms/login-form';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';

  return (
    <main className='min-h-screen bg-[#b9d3d4] px-4 py-6 md:px-6 md:py-10 xl:px-8 xl:py-14'>
      <section className='mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-4xl border border-white/30 bg-[#071018] shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-175 md:grid-cols-2 xl:min-h-190'>
        <div className='relative flex flex-col justify-between overflow-hidden px-6 py-8 md:px-8 md:py-10 xl:px-12 xl:py-12'>
          <div className='absolute inset-0 opacity-90'>
            <div className='absolute -left-12 top-0 h-48 w-48 rounded-full bg-[#9ff4d3]/10 blur-3xl md:h-64 md:w-64' />
            <div className='absolute right-0 top-24 h-40 w-40 rounded-full bg-[#96dded]/10 blur-3xl md:h-52 md:w-52' />
            <div className='absolute bottom-10 left-[-15%] h-px w-[80%] rotate-25 bg-linear-to-r from-transparent via-[#96dded] to-transparent opacity-40' />
            <div className='absolute bottom-24 left-[-10%] h-px w-[90%] rotate-25 bg-linear-to-r from-transparent via-[#9ff4d3] to-transparent opacity-30' />
            <div className='absolute bottom-40 left-[-5%] h-px w-[95%] rotate-25 bg-linear-to-r from-transparent via-[#96dded] to-transparent opacity-20' />
          </div>
          <div className='relative z-10'>
            <p className='text-sm font-medium uppercase tracking-[0.25em] text-white/60 md:text-base'>
              Nguyen Pacific Bank
            </p>
            <div className='mt-10 md:mt-14 xl:mt-16'>
              <h1 className='max-w-md text-4xl font-semibold leading-tight text-white md:text-5xl xl:text-6xl'>
                Manage Your
                <span className='block'>Financial Future</span>
              </h1>
              <p className='mt-4 max-w-md text-sm leading-6 text-white/70 md:text-base md:leading-7 xl:text-lg'>
                A secure and modern banking experience for tracking balances, accounts, and
                transactions with clarity.
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center bg-[#0b141d] px-4 py-6 md:px-8 md:py-10 xl:px-12 xl:py-12'>
          <div className='mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md md:p-7 xl:p-8'>
            <div className='mb-6 md:mb-8'>
              <p className='text-sm font-medium text-[#9ff4d3] md:text-base'>Welcome back</p>
              <h2 className='mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl xl:text-4xl'>
                Sign in to your account
              </h2>
            </div>
            {registered && (
              <div className='mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 md:text-base'>
                Account created successfully. Please sign in.
              </div>
            )}
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
