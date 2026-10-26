'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MessageSquare,
  Pencil,
  Printer,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteCard, fetchCard, updateCard } from '@/lib/panel-api';
import { toCardFormValues } from '@/components/panel/card-form';
import { ShareLinks } from '@/components/panel/share-links';
import { CardPreview } from '@/components/panel/card-preview';
import { PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useSession } from '@/lib/session';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{value}</dd>
    </div>
  );
}

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const cardQuery = useQuery({
    queryKey: ['panel', 'card', id],
    queryFn: () => fetchCard(id),
    enabled: Boolean(id),
  });

  const publish = useMutation({
    mutationFn: (published: boolean) => updateCard(id, { published }),
    onSuccess: (data) => {
      queryClient.setQueryData(['panel', 'card', id], data);
      queryClient.invalidateQueries({ queryKey: ['panel', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      toast.success(data.card.published ? 'Kart yayınlandı.' : 'Kart yayından kaldırıldı.');
    },
    onError: () => toast.error('Kart güncellenemedi.'),
  });

  const remove = useMutation({
    mutationFn: () => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      toast.success('Kart silindi.');
      router.replace('/panel/kartlar');
    },
    onError: () => toast.error('Kart silinemedi.'),
  });

  if (cardQuery.isLoading) return <PanelLoading />;
  if (cardQuery.error || !cardQuery.data) {
    return <PanelError onRetry={cardQuery.refetch} />;
  }

  const card = cardQuery.data.card;
  const values = toCardFormValues(card);
  const homeName = user?.funeralHome?.name;

  return (
    <div className="space-y-6">
      <Link
        href="/panel/kartlar"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Kartlar
      </Link>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={card.published ? 'success' : 'muted'}>
                {card.published ? 'Yayında' : 'Yayında değil'}
              </Badge>
              <Badge variant="gold">{card.honorific ?? 'Taziye'}</Badge>
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-forest-deep">
              {card.deceasedName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {card.funeralPlace} · {formatDate(card.funeralDate)} · {card.funeralTime}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/panel/kartlar/${card.id}/duzenle`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <Pencil className="h-4 w-4" />
              Düzenle
            </Link>
            <Button
              variant="outline"
              onClick={() => publish.mutate(!card.published)}
              disabled={publish.isPending}
            >
              {card.published ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {card.published ? 'Yayından kaldır' : 'Yayınla'}
            </Button>
            <Link
              href={`/k/${card.slug}/yazdir`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <Printer className="h-4 w-4" />
              Yazdır / QR
            </Link>
            <Button
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CardPreview values={values} homeName={homeName} />
          <ShareLinks
            publicPath={card.publicPath}
            editPath={card.editPath}
            title={`${card.honorific ?? ''} ${card.deceasedName}`.trim()}
          />
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-serif text-2xl text-forest-deep">Kart bilgileri</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Cenaze namazı"
                value={`${card.funeralPlace} · ${formatDate(card.funeralDate)} · ${card.funeralTime}`}
              />
              <InfoRow
                label="Defin"
                value={
                  [card.cemeteryName, card.burialTime].filter(Boolean).join(' · ') || '—'
                }
              />
              <InfoRow label="Taziye adresi" value={card.condolenceAddress ?? '—'} />
              <InfoRow label="Taziye saatleri" value={card.condolenceHours ?? '—'} />
              <InfoRow
                label="Bağış"
                value={card.donationUrl ?? card.donationIban ?? '—'}
              />
              <InfoRow
                label="Harita"
                value={card.funeralMapUrl ? 'Harita linki eklendi' : '—'}
              />
            </dl>
            {card.note ? (
              <p className="mt-4 rounded-xl bg-cream/60 px-3 py-2 text-sm leading-relaxed text-muted">
                {card.note}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-paper p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-forest-deep">Taziye mesajları</h2>
                <p className="mt-1 text-sm text-muted">
                  {card.pendingMessages > 0
                    ? `${card.pendingMessages} mesaj onay bekliyor.`
                    : 'Onay bekleyen mesaj yok.'}
                </p>
              </div>
              <Link
                href="/panel/mesajlar"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <MessageSquare className="h-4 w-4" />
                Mesajları aç
              </Link>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Kartı sil"
        description="Bu işlem geri alınamaz. Kart ve tüm taziye mesajları silinecek."
        confirmLabel="Kartı sil"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
