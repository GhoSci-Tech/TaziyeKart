'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, MessageSquare, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteAdminMessage,
  fetchAdminMessages,
  moderateAdminMessage,
} from '@/lib/admin-api';
import type { AdminMessage, CondolenceStatus } from '@/lib/api-types';
import { formatDateTimeLong, messageStatusLabel } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

const TABS: Array<{ label: string; value: CondolenceStatus }> = [
  { label: 'Onay bekleyen', value: 'PENDING' },
  { label: 'Yayında', value: 'APPROVED' },
  { label: 'Reddedilen', value: 'REJECTED' },
];

export default function AdminMessagesPage() {
  const [status, setStatus] = useState<CondolenceStatus>('PENDING');
  const [deleteTarget, setDeleteTarget] = useState<AdminMessage | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'messages', status],
    queryFn: () => fetchAdminMessages({ status }),
  });

  const moderate = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      moderateAdminMessage(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Taziye mesajı güncellendi.');
    },
    onError: () => toast.error('Mesaj güncellenemedi.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Taziye mesajı silindi.');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Mesaj silinemedi.'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Superadmin"
        title="Taziye mesajları"
        description="Tüm cenaze evlerine gelen taziye mesajlarını onaylayın, reddedin veya silin."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
              status === tab.value
                ? 'bg-forest text-cream'
                : 'border border-line bg-paper text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PanelLoading />
      ) : error || !data ? (
        <PanelError onRetry={refetch} />
      ) : data.messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Bu durumda mesaj yok"
          description="Yeni taziye mesajları geldiğinde burada görünür."
        />
      ) : (
        <div className="space-y-3">
          {data.messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{message.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTimeLong(message.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                  <Link
                    href={`/admin/cenaze-evleri/${message.home.id}`}
                    className="text-xs font-semibold text-forest underline underline-offset-4"
                  >
                    {message.home.name}
                  </Link>
                  <Link
                    href={`/k/${message.card.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest underline underline-offset-4"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {message.card.deceasedName}
                  </Link>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {message.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {message.status !== 'APPROVED' ? (
                  <Button
                    size="sm"
                    onClick={() => moderate.mutate({ id: message.id, next: 'APPROVED' })}
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
                    onClick={() => moderate.mutate({ id: message.id, next: 'REJECTED' })}
                    disabled={moderate.isPending}
                  >
                    <X className="h-4 w-4" />
                    Reddet
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(message)}
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Mesajı sil"
        description={`${deleteTarget?.name ?? 'Ziyaretçi'} tarafından bırakılan taziye mesajı kalıcı olarak silinecek.`}
        confirmLabel="Mesajı sil"
        pending={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
