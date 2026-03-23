import { ReactNode } from 'react';

import ProtectPage from '@/components/auth/protect-page';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashBoardLayout = ({ children }: DashboardLayoutProps) => {
  return <ProtectPage>{children}</ProtectPage>;
};

export default DashBoardLayout;
