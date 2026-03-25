'use client';

type TransactionFilters = {
  type: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  accountType: 'ALL' | 'CHECKING' | 'SAVINGS';
};

type TransactionHistoryFiltersProps = {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
};

const DEFAULT_FILTERS: TransactionFilters = {
  type: 'ALL',
  accountType: 'ALL',
};

const TransactionHistoryFilters = ({ filters, onChange }: TransactionHistoryFiltersProps) => {
  const isDefault = filters.type === 'ALL' && filters.accountType === 'ALL';

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-end'>
      <select
        id='transaction-type-filter'
        value={filters.type}
        onChange={(e) =>
          onChange({
            ...filters,
            type: e.target.value as TransactionFilters['type'],
          })
        }
        className='dashboard-subcard rounded-xl px-4 py-3 text-sm text-white outline-none md:min-w-44 md:text-base hover:cursor-pointer'>
        <option value='ALL' className='bg-[#252b2f] text-white'>
          All Types
        </option>
        <option value='DEPOSIT' className='bg-[#252b2f] text-white'>
          Deposit
        </option>
        <option value='WITHDRAWAL' className='bg-[#252b2f] text-white'>
          Withdrawal
        </option>
        <option value='TRANSFER' className='bg-[#252b2f] text-white'>
          Transfer
        </option>
      </select>
      <select
        id='transaction-account-filter'
        value={filters.accountType}
        onChange={(e) =>
          onChange({
            ...filters,
            accountType: e.target.value as TransactionFilters['accountType'],
          })
        }
        className='dashboard-subcard rounded-xl px-4 py-3 text-sm text-white outline-none md:min-w-44 md:text-base hover:cursor-pointer'>
        <option value='ALL' className='bg-[#252b2f] text-white'>
          All Accounts
        </option>
        <option value='CHECKING' className='bg-[#252b2f] text-white'>
          Checking
        </option>
        <option value='SAVINGS' className='bg-[#252b2f] text-white'>
          Savings
        </option>
      </select>
      <button
        type='button'
        onClick={handleReset}
        disabled={isDefault}
        className='dashboard-heading inline-flex items-center justify-center rounded-xl border border-(--color-border) px-4 py-3 text-sm transition hover:bg-white/5 md:text-base hover:cursor-pointer'>
        Reset
      </button>
    </div>
  );
};

export type { TransactionFilters };
export default TransactionHistoryFilters;
