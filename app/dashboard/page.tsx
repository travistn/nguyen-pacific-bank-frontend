import DashboardHeader from '@/components/dashboard/dashboard-header';

const Dashboard = () => {
  return (
    <main className='min-h-screen bg-[#b9d3d4] px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10'>
      <section className='mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-4xl border border-white/30 bg-[#071018] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-4rem)] md:p-6 xl:p-8'>
        <DashboardHeader />
      </section>
      <div className='mt-6 flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 md:mt-8 md:p-6 xl:p-8'>
        <p className='text-sm text-white/70 md:text-base'></p>
      </div>
    </main>
  );
};

export default Dashboard;
