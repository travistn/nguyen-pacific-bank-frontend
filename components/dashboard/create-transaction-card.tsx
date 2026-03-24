import Link from 'next/link';

const CreateTransactionCard = () => {
  return (
    <section className='dashboard-card p-5 md:p-6 xl:p-7'>
      <div className='mb-4 flex items-end justify-between gap-3 md:mb-5'>
        <div>
          <p className='dashboard-eyebrow'>Transactions</p>
          <h2 className='dashboard-heading dashboard-section-title mt-2 md:text-2xl'>Move Money</h2>
        </div>
        <p className='dashboard-support md:text-base'>Deposit or withdraw funds</p>
      </div>
      <div className='dashboard-accent-divider mb-4 h-px w-20 rounded-full md:mb-5' />
      <div className='dashboard-subcard flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5'>
        <div>
          <p className='dashboard-heading'>Create a new transaction</p>
          <p className='dashboard-support mt-2'>
            Open the transaction form to deposit or withdraw from one of your accounts.
          </p>
        </div>
        <Link
          href='/dashboard/transactions'
          className='dashboard-heading inline-flex items-center justify-center rounded-xl bg-(--color-accent-primary) px-4 py-3 text-(--color-shell) transition hover:opacity-90'>
          Create Transaction
        </Link>
      </div>
    </section>
  );
};

export default CreateTransactionCard;
