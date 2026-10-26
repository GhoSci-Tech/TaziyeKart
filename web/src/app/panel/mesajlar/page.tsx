'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMessages, moderateMessage } from '@/lib/panel-api';
import type { CondolenceStatus } from '@/lib/api-types';
import { formatDateTimeLong, messageStatusLabel } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

const TABS: Array<{ label: string; value: CondolenceStatus }> = [
  { label: 'Onay bekleyen', value: 'PENDING' },
  { label: 'Yayında', value: 'APPROVED' },
  { label: 'Reddedilen', value: 'REJECTED' },
];

export default function MessagesPage() {
  const [status, setStatus] = useState<CondolenceStatus>('PENDING');
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'messages', status],
    queryFn: () => fetchMessages(status),
  });

  const moderate = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      moderateMessage(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      toast.success('Taziye mesajı güncellendi.');
    },
    onError: () => toast.error('Mesaj güncellenemedi.'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Taziye mesajları"
        description="Ziyaretçilerin bıraktığı mesajları onaylayın veya reddedin. Yalnızca onaylananlar public kartta görünür."
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
            <article
              key={message.id}
              className="rounded-2xl border border-line bg-paper p-5"
            >
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
                    href={`/panel/kartlar/${message.cardId}`}
                    className="text-xs font-semibold text-forest underline underline-offset-4"
                  >
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
