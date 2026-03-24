'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type DashboardBackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

const DashboardBackButton = ({
  href = '/dashboard',
  label = 'Back to Dashboard',
  className = '',
}: DashboardBackButtonProps) => {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 dashboard-support rounded-xl border border-(--color-border) px-3 py-2 transition hover:bg-(--color-card) ${className}`}>
      <ArrowLeft size={18} strokeWidth={2} />
      {label}
    </Link>
  );
};

export default DashboardBackButton;
