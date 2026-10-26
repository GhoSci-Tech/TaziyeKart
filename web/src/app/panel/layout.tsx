import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/session';
import { PanelShell } from '@/components/panel/panel-shell';

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PanelShell>{children}</PanelShell>
    </SessionProvider>
  );
}
