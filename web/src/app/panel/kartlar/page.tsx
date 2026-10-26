'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, FileText, Plus, Search } from 'lucide-react';
import { fetchCards } from '@/lib/panel-api';
import { formatDate } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

type PublishedFilter = 'true' | 'false' | undefined;

const FILTERS: Array<{ label: string; value: PublishedFilter }> = [
  { label: 'Tümü', value: undefined },
  { label: 'Yayında', value: 'true' },
  { label: 'Yayında değil', value: 'false' },
];

export default function CardsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState<PublishedFilter>(undefined);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'cards', { search, published }],
    queryFn: () => fetchCards({ search: search || undefined, published }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Kartlar"
        description="Taziye kartlarını arayın, filtreleyin ve yönetin."
        action={
          <Link href="/panel/kartlar/yeni" className={cn(buttonVariants({ variant: 'gold' }))}>
            <Plus className="h-4 w-4" />
            Yeni kart
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchInput.trim());
          }}
          className="flex w-full max-w-md gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Merhum, yer veya slug ara"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Ara
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setPublished(filter.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                published === filter.value
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-paper text-muted hover:text-ink',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <PanelLoading />
      ) : error || !data ? (
        <PanelError onRetry={refetch} />
      ) : data.cards.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || published ? 'Sonuç bulunamadı' : 'Henüz taziye kartı yok'}
          description={
            search || published
              ? 'Arama veya filtreyi değiştirip tekrar deneyin.'
              : 'İlk kartı oluşturarak başlayın.'
          }
          action={
            !search && !published ? (
              <Link
                href="/panel/kartlar/yeni"
                className={cn(buttonVariants({ variant: 'default' }))}
              >
                <Plus className="h-4 w-4" />
                Kart oluştur
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {data.cards.map((card) => (
            <Link
              key={card.id}
              href={`/panel/kartlar/${card.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-paper p-4 transition-colors hover:border-gold/60"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{card.deceasedName}</p>
                <p className="mt-1 truncate text-xs text-muted">
                  {card.funeralPlace} · {formatDate(card.funeralDate)} · {card.funeralTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={card.published ? 'success' : 'muted'}>
                  {card.published ? 'Yayında' : 'Yayında değil'}
                </Badge>
                {card.pendingMessages > 0 ? (
                  <Badge variant="warning">{card.pendingMessages} mesaj</Badge>
                ) : null}
                <ChevronRight className="h-4 w-4 text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
