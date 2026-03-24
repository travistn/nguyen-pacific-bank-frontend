import AccountsList from '@/components/dashboard/accounts-list';
import BalanceSummary from '@/components/dashboard/balance-summary';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import RecentTransactions from '@/components/dashboard/recent-transactions';

const DashboardPage = () => {
  return (
    <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
      <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
        <DashboardHeader />
        <div className='dashboard-panel mt-6 flex-1 rounded-3xl p-5 space-y-5 md:mt-8 md:p-6 md:space-y-6 xl:p-7 xl:space-y-7'>
          <BalanceSummary />
          <AccountsList />
          <RecentTransactions />
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
