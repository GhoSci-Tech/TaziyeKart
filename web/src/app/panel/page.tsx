'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { fetchOverview } from '@/lib/panel-api';
import { formatDate, PLAN_LABELS, planLimitLabel } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

export default function PanelDashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'overview'],
    queryFn: fetchOverview,
  });

  if (isLoading) return <PanelLoading />;
  if (error || !data) return <PanelError onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel"
        title="Genel bakış"
        description="Taziye kartlarınızı ve bekleyen mesajları buradan yönetin."
        action={
          <Link
            href="/panel/kartlar/yeni"
            className={cn(buttonVariants({ variant: 'gold' }))}
          >
            <Plus className="h-4 w-4" />
            Yeni taziye kartı
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Toplam kart"
          value={String(data.usage.cards)}
          hint={`Plan: ${PLAN_LABELS[data.home.plan]}`}
        />
        <StatCard
          icon={Sparkles}
          label="Plan limiti"
          value={planLimitLabel(data.usage.limit)}
          hint={
            data.usage.limit === null
              ? 'Sınırsız kart'
              : `${data.usage.cards} / ${data.usage.limit} kullanıldı`
          }
        />
        <StatCard
          icon={MessageSquare}
          label="Bekleyen taziye"
          value={String(data.usage.messagesPending)}
          hint="Onay bekleyen mesajlar"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-forest-deep">Son taziye kartları</h2>
            <Link
              href="/panel/kartlar"
              className="text-xs font-semibold text-forest underline underline-offset-4"
            >
              Tümünü gör
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {data.recentCards.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Henüz taziye kartı yok"
                description="İlk kartı oluşturarak başlayın; panel boş veriyle de anlamlı kalsın."
                action={
                  <Link
                    href="/panel/kartlar/yeni"
                    className={cn(buttonVariants({ variant: 'default' }))}
                  >
                    <Plus className="h-4 w-4" />
                    Kart oluştur
                  </Link>
                }
              />
            ) : (
              data.recentCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/panel/kartlar/${card.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream/50 px-4 py-3 transition-colors hover:border-gold/60"
                >
                  <div>
                    <p className="font-semibold text-ink">{card.deceasedName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(card.funeralDate)} · {card.funeralTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={card.published ? 'success' : 'muted'}>
                      {card.published ? 'Yayında' : 'Yayında değil'}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-forest p-6 text-cream">
            <MessageSquare className="h-5 w-5 text-gold" />
            <h2 className="mt-4 font-serif text-2xl">Taziye mesajları</h2>
            <p className="mt-2 text-sm text-cream/75">
              {data.usage.messagesPending > 0
                ? `${data.usage.messagesPending} mesaj onay bekliyor.`
                : 'Onay bekleyen mesaj yok.'}
            </p>
            <Link
              href="/panel/mesajlar"
              className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'mt-5')}
            >
              Mesajları aç
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Plan</p>
            <p className="mt-2 font-serif text-2xl text-forest-deep">
              {PLAN_LABELS[data.home.plan]}
            </p>
            <p className="mt-1 text-xs text-muted">
              {data.home.status === 'ACTIVE' ? 'Aktif hesap' : 'Askıda hesap'}
            </p>
            <Link
              href="/panel/plan"
              className="mt-4 inline-flex text-xs font-semibold text-forest underline underline-offset-4"
            >
              Planı yönet
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
