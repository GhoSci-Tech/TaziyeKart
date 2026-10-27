'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Eye, EyeOff, FileText, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminCard, fetchAdminCards, updateAdminCard } from '@/lib/admin-api';
import type { AdminCard } from '@/lib/api-types';
import { formatDate } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

type PublishedFilter = 'true' | 'false' | undefined;

const FILTERS: Array<{ label: string; value: PublishedFilter }> = [
  { label: 'Tümü', value: undefined },
  { label: 'Yayında', value: 'true' },
  { label: 'Yayında değil', value: 'false' },
];

export default function AdminCardsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState<PublishedFilter>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<AdminCard | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'cards', { search, published }],
    queryFn: () =>
      fetchAdminCards({ search: search || undefined, published }),
  });

  const publish = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      updateAdminCard(id, { published: next }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Kart durumu güncellendi.');
    },
    onError: () => toast.error('Kart güncellenemedi.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Kart silindi.');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Kart silinemedi.'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Superadmin"
        title="Kartlar"
        description="Tüm cenaze evlerine ait kartları arayın, yayın durumunu değiştirin veya silin."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              placeholder="Merhum, slug veya cenaze evi"
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
          title="Kart bulunamadı"
          description="Arama veya filtreyi değiştirin; kartlar burada görünür."
        />
      ) : (
        <div className="space-y-2">
          {data.cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-paper p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{card.deceasedName}</p>
                <p className="mt-1 truncate text-xs text-muted">
                  <Link
                    href={`/admin/cenaze-evleri/${card.home.id}`}
                    className="font-semibold text-forest underline underline-offset-4"
                  >
                    {card.home.name}
                  </Link>{' '}
                  · {formatDate(card.funeralDate)} · {card.funeralTime}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={card.published ? 'success' : 'muted'}>
                  {card.published ? 'Yayında' : 'Yayında değil'}
                </Badge>
                {card.pendingMessages > 0 ? (
                  <Badge variant="warning">{card.pendingMessages} mesaj</Badge>
                ) : null}
                <Link
                  href={card.publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest underline underline-offset-4"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Aç
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => publish.mutate({ id: card.id, next: !card.published })}
                  disabled={publish.isPending}
                >
                  {card.published ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {card.published ? 'Yayından kaldır' : 'Yayınla'}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-700 text-white hover:bg-red-800"
                  onClick={() => setDeleteTarget(card)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Kartı sil"
        description={`${deleteTarget?.deceasedName ?? 'Kart'} ve tüm taziye mesajları kalıcı olarak silinecek.`}
        confirmLabel="Kartı sil"
        pending={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
