'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, FileText, MessageSquare } from 'lucide-react';
import { fetchAdminHomes, fetchAdminMessages, fetchAdminStats } from '@/lib/admin-api';
import {
  formatDateTimeLong,
  formatMoney,
  homeStatusLabel,
  PLAN_LABELS,
} from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function AdminDashboardPage() {
  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });
  const homes = useQuery({
    queryKey: ['admin', 'homes', { limit: 5 }],
    queryFn: () => fetchAdminHomes({ limit: 5 }),
  });
  const messages = useQuery({
    queryKey: ['admin', 'messages', 'dashboard', { status: 'PENDING', limit: 5 }],
    queryFn: () => fetchAdminMessages({ status: 'PENDING', limit: 5 }),
  });

  if (stats.isLoading || homes.isLoading || messages.isLoading) return <PanelLoading />;
  if (stats.error || homes.error || messages.error || !stats.data || !homes.data || !messages.data) {
    return (
      <PanelError
        onRetry={() => {
          void stats.refetch();
          void homes.refetch();
          void messages.refetch();
        }}
      />
    );
  }

  const data = stats.data;
  const recentHomes = homes.data.homes;
  const pendingMessages = messages.data.messages;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Superadmin"
        title="Genel bakış"
        description="Tüm cenaze evleri, kartlar ve taziye mesajları tek ekranda."
        action={
          <Link href="/admin/cenaze-evleri" className={cn(buttonVariants({ variant: 'outline' }))}>
            <Building2 className="h-4 w-4" />
            Cenaze evleri
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Cenaze evi"
          value={`${data.homes.active}/${data.homes.total}`}
          hint={`${data.homes.suspended} askıda`}
        />
        <StatCard
          icon={FileText}
          label="Kart"
          value={`${data.cards.published}/${data.cards.total}`}
          hint={`${data.cards.unpublished} yayında değil`}
        />
        <StatCard
          icon={MessageSquare}
          label="Bekleyen taziye"
          value={String(data.messages.pending)}
          hint={`${data.messages.approved} onaylı`}
        />
        <StatCard
          icon={CreditCard}
          label="Demo MRR"
          value={formatMoney(data.demoMrrTry)}
          hint="Aylık aktif planlar"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-forest-deep">Son cenaze evleri</h2>
            <Link
              href="/admin/cenaze-evleri"
              className="text-xs font-semibold text-forest underline underline-offset-4"
            >
              Tümü
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {recentHomes.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Henüz cenaze evi yok"
                description="Kayıt olan cenaze evleri burada görünür."
              />
            ) : (
              recentHomes.map((home) => (
                <Link
                  key={home.id}
                  href={`/admin/cenaze-evleri/${home.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream/50 px-4 py-3 transition-colors hover:border-gold/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{home.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {home.phone ?? 'Telefon yok'} · {formatDateTimeLong(home.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">{PLAN_LABELS[home.plan]}</Badge>
                    <Badge variant={home.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {homeStatusLabel(home.status)}
                    </Badge>
                    <span className="text-xs text-muted">{home.cardsCount} kart</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-forest-deep">Bekleyen taziye mesajları</h2>
            <Link
              href="/admin/mesajlar"
              className="text-xs font-semibold text-forest underline underline-offset-4"
            >
              Tümü
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {pendingMessages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Bekleyen mesaj yok"
                description="Yeni taziye mesajları onay beklediğinde burada görünür."
              />
            ) : (
              pendingMessages.map((message) => (
                <Link
                  key={message.id}
                  href="/admin/mesajlar"
                  className="block rounded-xl border border-line bg-cream/50 px-4 py-3 transition-colors hover:border-gold/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{message.name}</p>
                    <span className="text-[11px] text-muted">
                      {formatDateTimeLong(message.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{message.message}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {message.home.name} · {message.card.deceasedName}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
