'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import {
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/lib/session';
import { PLAN_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/panel', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/panel/kartlar', label: 'Kartlar', icon: FileText },
  { href: '/panel/mesajlar', label: 'Taziye Mesajları', icon: MessageSquare },
  { href: '/panel/marka', label: 'Marka', icon: Building2 },
  { href: '/panel/plan', label: 'Plan', icon: CreditCard },
] as const;

export function PanelShell({ children }: { children: ReactNode }) {
  const { user, isLoading, error, refetch, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || error) return;
    if (!user) {
      router.replace('/giris');
    } else if (user.role !== 'FUNERAL_HOME') {
      router.replace('/admin');
    }
  }, [isLoading, error, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-gold/40" />
          <p className="mt-4 text-sm text-muted">Panel yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-7 text-center shadow-card">
          <h1 className="font-serif text-3xl text-forest-deep">Panele ulaşılamadı</h1>
          <p className="mt-3 text-sm text-muted">
            Sunucuya bağlanırken bir sorun oluştu. Tekrar deneyin.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Tekrar dene
            </Button>
            <Button variant="outline" onClick={() => void logout()}>
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'FUNERAL_HOME') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Yönlendiriliyor...</p>
      </div>
    );
  }

  const homeName = user.funeralHome?.name ?? user.name;
  const plan = user.funeralHome?.plan ?? 'TRIAL';
  const isActive = (href: string) => pathname === href || (href !== '/panel' && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/panel"
              className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              TaziyeKart
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <p className="hidden truncate text-sm text-muted sm:block">{homeName}</p>
            <Badge variant="gold" className="hidden sm:inline-flex">
              {PLAN_LABELS[plan]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[160px] truncate text-sm text-muted md:block">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold',
                  isActive(item.href) ? 'bg-forest text-cream' : 'bg-paper text-muted',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-forest text-cream shadow-sm'
                      : 'text-muted hover:bg-paper hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4">
              <div className="rounded-xl border border-line bg-paper p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Plan</p>
                <p className="mt-2 font-serif text-xl text-forest-deep">{PLAN_LABELS[plan]}</p>
                <Link
                  href="/panel/plan"
                  className="mt-3 inline-flex text-xs font-semibold text-forest underline underline-offset-4"
                >
                  Planı yönet
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
