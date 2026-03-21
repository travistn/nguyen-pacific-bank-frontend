'use client';

import { useState } from 'react';
import Link from 'next/link';

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5 md:space-y-6 xl:space-y-7'>
      {error && (
        <div className='rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:text-base'>
          {error}
        </div>
      )}
      <div className='grid gap-5 md:grid-cols-2 md:gap-4 xl:gap-5'>
        <div className='space-y-2'>
          <label
            htmlFor='firstName'
            className='block text-sm font-medium text-white/85 md:text-base'>
            First name
          </label>
          <input
            id='firstName'
            type='text'
            autoComplete='given-name'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder='Enter first name'
            className='w-full rounded-2xl border border-white/10 bg-[#111418] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#96dded] focus:ring-4 focus:ring-[#96dded]/15 md:text-base'
            required
          />
        </div>
        <div className='space-y-2'>
          <label
            htmlFor='lastName'
            className='block text-sm font-medium text-white/85 md:text-base'>
            Last name
          </label>
          <input
            id='lastName'
            type='text'
            autoComplete='family-name'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder='Enter last name'
            className='w-full rounded-2xl border border-white/10 bg-[#111418] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#96dded] focus:ring-4 focus:ring-[#96dded]/15 md:text-base'
            required
          />
        </div>
      </div>
      <div className='space-y-2'>
        <label htmlFor='email' className='block text-sm font-medium text-white/85 md:text-base'>
          Email
        </label>
        <input
          id='email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email'
          className='w-full rounded-2xl border border-white/10 bg-[#111418] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#96dded] focus:ring-4 focus:ring-[#96dded]/15 md:text-base'
          required
        />
      </div>
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-4'>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-white/85 md:text-base'>
            Password
          </label>
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            className='text-sm font-medium text-[#96dded] transition hover:cursor-pointer hover:text-[#9ff4d3]'>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id='password'
          type={showPassword ? 'text' : 'password'}
          autoComplete='new-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Create a password'
          className='w-full rounded-2xl border border-white/10 bg-[#111418] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#9ff4d3] focus:ring-4 focus:ring-[#9ff4d3]/15 md:text-base'
          required
        />
      </div>
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-4'>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-white/85 md:text-base'>
            Confirm password
          </label>
          <button
            type='button'
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className='text-sm font-medium text-[#96dded] transition hover:cursor-pointer hover:text-[#9ff4d3]'>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id='confirmPassword'
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete='new-password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm your password'
          className='w-full rounded-2xl border border-white/10 bg-[#111418] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#9ff4d3] focus:ring-4 focus:ring-[#9ff4d3]/15 md:text-base'
          required
        />
      </div>
      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full rounded-full bg-[#9ff4d3] px-5 py-3 text-sm font-semibold text-[#071018] transition hover:cursor-pointer hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 md:py-3.5 md:text-base'>
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
      <p className='text-center text-sm text-white/60 md:text-base'>
        Already have an account?{' '}
        <Link href='/login' className='font-semibold text-white underline underline-offset-4'>
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
