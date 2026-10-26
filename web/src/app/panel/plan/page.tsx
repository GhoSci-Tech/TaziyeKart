'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { checkoutDemo, fetchOverview } from '@/lib/panel-api';
import { PLAN_LABELS, planLimitLabel } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const PLANS = [
  {
    plan: 'SINGLE' as const,
    title: 'Tek Kart',
    cta: "Tek Kart'a geç",
    price: '350 TL',
    note: 'tek seferlik',
    recommended: false,
    features: [
      '1 taziye kartı',
      'Public + gizli düzenleme linki',
      'Taziye defteri',
      'A6 QR baskı (Faz 5)',
    ],
  },
  {
    plan: 'MONTHLY' as const,
    title: 'Cenaze Evi',
    cta: "Cenaze Evi'ne geç",
    price: '1.500 TL/ay',
    note: 'sınırsız kart',
    recommended: true,
    features: [
      'Sınırsız taziye kartı',
      'Kendi adınız ve telefonunuz',
      'Taziye defteri moderasyonu',
      'Öncelikli destek',
    ],
  },
];

export default function PlanPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'overview'],
    queryFn: fetchOverview,
  });

  const checkout = useMutation({
    mutationFn: (plan: 'SINGLE' | 'MONTHLY') => checkoutDemo(plan),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(response.message);
    },
    onError: () => toast.error('Demo ödeme tamamlanamadı.'),
  });

  if (isLoading) return <PanelLoading />;
  if (error || !data) return <PanelError onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Plan"
        description="Demo checkout ile planı değiştirin; gerçek tahsilat yapılmaz."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Mevcut plan</p>
          <p className="mt-2 font-serif text-2xl text-forest-deep">
            {PLAN_LABELS[data.home.plan]}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.home.status === 'ACTIVE' ? 'Aktif hesap' : 'Askıda hesap'}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Kullanım</p>
          <p className="mt-2 font-serif text-2xl text-forest-deep">{data.usage.cards} kart</p>
          <p className="mt-1 text-xs text-muted">Limit: {planLimitLabel(data.usage.limit)}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((item) => {
          const current = data.home.plan === item.plan;
          return (
            <div
              key={item.plan}
              className={cn(
                'relative rounded-2xl border p-6',
                item.recommended
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line bg-paper',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  className={cn(
                    'font-serif text-2xl',
                    item.recommended ? 'text-cream' : 'text-forest-deep',
                  )}
                >
                  {item.title}
                </h2>
                {item.recommended ? (
                  <Badge variant="gold" className="bg-gold text-forest-deep">
                    Önerilen
                  </Badge>
                ) : null}
              </div>
              <p
                className={cn(
                  'mt-3 text-3xl font-semibold tabular-nums',
                  item.recommended ? 'text-cream' : 'text-ink',
                )}
              >
                {item.price}
              </p>
              <p className={cn('mt-1 text-xs', item.recommended ? 'text-cream/70' : 'text-muted')}>
                {item.note}
              </p>
              <ul
                className={cn(
                  'mt-5 space-y-2 text-sm',
                  item.recommended ? 'text-cream/80' : 'text-muted',
                )}
              >
                {item.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0',
                        item.recommended ? 'text-gold' : 'text-forest',
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={item.recommended ? 'gold' : 'outline'}
                disabled={current || checkout.isPending}
                onClick={() => checkout.mutate(item.plan)}
              >
                {current ? 'Mevcut plan' : checkout.isPending ? 'İşleniyor...' : item.cta}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Demo ödeme: kart bilgisi istenmez, gerçek tahsilat yapılmaz. Plan değişikliği anında
        uygulanır.
      </p>
    </div>
  );
}
