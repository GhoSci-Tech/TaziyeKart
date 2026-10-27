'use client';

import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { fetchAdminAudit } from '@/lib/admin-api';
import type { AdminAudit, HomeStatus, Plan } from '@/lib/api-types';
import {
  formatDateTimeLong,
  homeStatusLabel,
  PLAN_LABELS,
} from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

const ACTION_LABELS: Record<string, string> = {
  ADMIN_LOGIN: 'Admin girişi',
  HOME_UPDATE: 'Cenaze evi güncellendi',
  CARD_PUBLISH: 'Kart yayınlandı',
  CARD_UNPUBLISH: 'Kart yayından kaldırıldı',
  CARD_DELETE: 'Kart silindi',
  MESSAGE_APPROVE: 'Taziye onaylandı',
  MESSAGE_REJECT: 'Taziye reddedildi',
  MESSAGE_DELETE: 'Taziye silindi',
};

const ENTITY_LABELS: Record<string, string> = {
  auth: 'Oturum',
  funeral_home: 'Cenaze evi',
  card: 'Kart',
  condolence: 'Taziye',
};

function metaSummary(log: AdminAudit): string {
  const meta = log.meta;
  if (!meta) return '—';

  const parts: string[] = [];
  if (typeof meta.email === 'string') parts.push(meta.email);
  if (typeof meta.plan === 'string') {
    parts.push(`Plan: ${PLAN_LABELS[meta.plan as Plan] ?? meta.plan}`);
  }
  if (typeof meta.status === 'string') {
    parts.push(`Durum: ${homeStatusLabel(meta.status as HomeStatus)}`);
  }
  if (typeof meta.deceasedName === 'string') parts.push(meta.deceasedName);
  if (typeof meta.cardName === 'string') parts.push(meta.cardName);
  if (typeof meta.homeName === 'string') parts.push(meta.homeName);
  if (typeof meta.name === 'string') parts.push(meta.name);
  if (meta.demo === true) parts.push('Demo');

  return parts.join(' · ') || '—';
}

export default function AdminAuditPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => fetchAdminAudit(150),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Superadmin"
        title="Denetim"
        description="Admin girişleri ve yönetim işlemlerinin değiştirilemez kaydı. Parola ve token kaydedilmez."
      />

      {isLoading ? (
        <PanelLoading />
      ) : error || !data ? (
        <PanelError onRetry={refetch} />
      ) : data.logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Henüz işlem yok"
          description="Admin girişi ve yönetim işlemleri burada listelenir."
        />
      ) : (
        <div className="space-y-2">
          {data.logs.map((log) => (
            <article
              key={log.id}
              className="rounded-xl border border-line bg-paper p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <Badge variant="muted">
                      {ENTITY_LABELS[log.entity] ?? log.entity}
                    </Badge>
                  </div>
                  <p className="mt-1 break-all text-xs text-muted">
                    {metaSummary(log)}
                    {log.entityId ? ` · ${log.entityId}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-ink">
                    {log.actor?.name ?? 'Sistem'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatDateTimeLong(log.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
