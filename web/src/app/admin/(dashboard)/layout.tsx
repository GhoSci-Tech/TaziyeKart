import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/session';
import { AdminShell } from '@/components/admin/admin-shell';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
