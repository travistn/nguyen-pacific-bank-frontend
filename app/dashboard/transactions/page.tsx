import DashboardBackButton from '@/components/dashboard/dashboard-back-button';
import CreateTransactionForm from '@/components/forms/create-transaction-form';

const TransactionsPage = () => {
  return (
    <main className='min-h-screen bg-(--color-page-bg) px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
      <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-(--color-border) bg-(--color-shell) p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
        <div className='dashboard-panel flex-1 rounded-3xl p-5 md:p-6 xl:p-7'>
          <DashboardBackButton className='mb-4 md:mb-5' />
          <div className='mx-auto max-w-3xl'>
            <CreateTransactionForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default TransactionsPage;
