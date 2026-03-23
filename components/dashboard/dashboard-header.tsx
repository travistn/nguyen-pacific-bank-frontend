import LogoutButton from '../auth/logout-button';

const DashboardHeader = () => {
  return (
    <header className='flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
      <div className='space-y-1'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-[#7dd3c7]'>
          Nguyen Pacific Bank
        </p>
        <h1 className='text-2xl font-semibold tracking-light text-white md:text-3xl xl:text-4xl'>
          Welcome back, Travis
        </h1>
        <p className='max-w-2xl text-sm text-white/70 md:text-base'>
          Manage your accounts, review balances, and stay on top of recent activity.
        </p>
      </div>
      <div className='flex items-center gap-3 self-start md:self-auto'>
        <div className='rounded-2xl border border-white/10 bg-[#0d1720] px-4 py-2 text-sm text-white/70'>
          Dashboard
        </div>
        <LogoutButton />
      </div>
    </header>
  );
};

export default DashboardHeader;
