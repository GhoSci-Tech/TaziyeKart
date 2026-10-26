import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          TaziyeKart
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          <ArrowLeft className="h-4 w-4" />
          Ana sayfa
        </Link>
      </header>

      <section className="paper-grain mx-auto w-full max-w-4xl px-6 pb-20 pt-10">
        <div className="rounded-3xl border border-line bg-paper p-8 shadow-card md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-forest-deep md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </section>
    </main>
  );
}
