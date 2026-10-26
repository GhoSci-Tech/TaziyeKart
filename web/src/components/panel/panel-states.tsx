import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow = 'Panel', title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-forest-deep">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PanelLoading() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-paper" />
      <div className="h-24 animate-pulse rounded-2xl bg-paper" />
      <div className="h-40 animate-pulse rounded-2xl bg-paper" />
    </div>
  );
}

export function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-8 text-center">
      <h2 className="font-serif text-2xl text-forest-deep">Veriler yüklenemedi</h2>
      <p className="mt-2 text-sm text-muted">Bağlantıyı kontrol edip tekrar deneyin.</p>
      <Button className="mt-5" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Tekrar dene
      </Button>
    </div>
  );
}
