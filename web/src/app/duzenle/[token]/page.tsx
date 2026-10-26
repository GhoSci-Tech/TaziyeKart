'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, ExternalLink, Printer, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import {
  deleteFamilyCard,
  fetchFamilyCard,
  moderateFamilyCondolence,
} from '@/lib/family-api';
import { CardForm, toCardFormValues } from '@/components/panel/card-form';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { ShareLinks } from '@/components/panel/share-links';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDateTimeLong, messageStatusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function FamilyEditPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['family', 'card', token],
    queryFn: () => fetchFamilyCard(token),
    enabled: Boolean(token),
  });

  const moderate = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      moderateFamilyCondolence(token, id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'card', token] });
      toast.success('Taziye mesajı güncellendi.');
    },
    onError: () => toast.error('Mesaj güncellenemedi.'),
  });

  const remove = useMutation({
    mutationFn: () => deleteFamilyCard(token),
    onSuccess: () => {
      toast.success('Kart silindi.');
      router.replace('/');
    },
    onError: () => toast.error('Kart silinemedi.'),
  });

  if (isLoading) return <PanelLoading />;

  if (error instanceof ApiError && error.status === 404) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Aile</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-forest-deep">
            Bu düzenleme bağlantısı geçersiz.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Link yanlış olabilir veya kart silinmiş olabilir.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}>
            Ana sayfa
          </Link>
        </div>
      </main>
    );
  }

  if (error || !data) return <PanelError onRetry={refetch} />;

  const { card, condolences } = data;
  const pendingCount = condolences.filter((message) => message.status === 'PENDING').length;

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-line bg-cream/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              TaziyeKart
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <p className="hidden truncate text-sm text-muted sm:block">Aile düzenleme</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-xs text-muted md:block">
              {card.home.name}
            </span>
            <Link
              href={`/k/${card.slug}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public kart
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        <PageHeader
          eyebrow="Aile"
          title="Taziye kartını düzenle"
          description="Bilgileri güncelleyebilir, taziye mesajlarını onaylayabilir veya kartı silebilirsiniz."
        />

        <CardForm
          mode="edit"
          editToken={token}
          initialValues={toCardFormValues(card)}
          homeName={card.home.name}
          cancelHref={`/k/${card.slug}`}
          cancelLabel="Karta dön"
        />

        <section className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-forest-deep">Taziye mesajları</h2>
              <p className="mt-1 text-sm text-muted">
                Onaylanan mesajlar public kartta görünür.
              </p>
            </div>
            <Badge variant={pendingCount > 0 ? 'warning' : 'muted'}>
              {pendingCount > 0 ? `${pendingCount} onay bekliyor` : 'Bekleyen yok'}
            </Badge>
          </div>

          {condolences.length === 0 ? (
            <p className="mt-5 rounded-xl bg-cream/60 p-4 text-sm text-muted">
              Henüz taziye mesajı yok.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {condolences.map((message) => (
                <article
                  key={message.id}
                  className="rounded-xl border border-line bg-cream/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{message.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatDateTimeLong(message.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        message.status === 'APPROVED'
                          ? 'success'
                          : message.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {messageStatusLabel(message.status)}
                    </Badge>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {message.message}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.status !== 'APPROVED' ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          moderate.mutate({ id: message.id, next: 'APPROVED' })
                        }
                        disabled={moderate.isPending}
                      >
                        <Check className="h-4 w-4" />
                        Onayla
                      </Button>
                    ) : null}
                    {message.status !== 'REJECTED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          moderate.mutate({ id: message.id, next: 'REJECTED' })
                        }
                        disabled={moderate.isPending}
                      >
                        <X className="h-4 w-4" />
                        Reddet
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-forest-deep">Linkler</h2>
              <p className="mt-1 text-sm text-muted">
                Public linki dilediğiniz gibi paylaşın; düzenleme linkini yalnızca siz kullanın.
              </p>
            </div>
            <Link
              href={`/k/${card.slug}/yazdir`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Printer className="h-3.5 w-3.5" />
              Yazdır / QR
            </Link>
          </div>
          <div className="mt-4">
            <ShareLinks
              publicPath={`/k/${card.slug}`}
              editPath={`/duzenle/${token}`}
              title={`${card.honorific ?? ''} ${card.deceasedName}`.trim()}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-red-900">Kartı sil</h2>
              <p className="mt-1 text-sm text-red-800/80">
                Kart ve tüm taziye mesajları kalıcı olarak silinir.
              </p>
            </div>
            <Button
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Kartı sil
            </Button>
          </div>
        </section>

        <footer className="flex flex-col gap-2 pb-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>TaziyeKart · Aile düzenleme</span>
          <span>Bu sayfa arama motorlarında görünmez.</span>
        </footer>
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
    </main>
  );
}
