import LogoutButton from '../auth/logout-button';

const DashboardHeader = () => {
  return (
    <header className='dashboard-panel flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center md:justify-between md:p-6 xl:p-7'>
      <div className='space-y-2'>
        <p className='dashboard-eyebrow text-(--color-accent-primary)'>Nguyen Pacific Bank</p>
        <h1 className='dashboard-heading text-(--color-text-primary) text-2xl tracking-light md:text-3xl xl:text-4xl'>
          Welcome back, Travis
        </h1>
        <p className='max-w-2xl text-sm text-[rgba(252,252,252,0.82)] md:text-base'>
          Manage your accounts, review balances, and stay on top of recent activity.
        </p>
      </div>
      <div className='flex items-center gap-3 self-start md:self-auto'>
        <div className='dashboard-chip dashboard-support rounded-2xl px-4 py-2'>Dashboard</div>
        <LogoutButton />
      </div>
    </header>
  );
};

export default DashboardHeader;
