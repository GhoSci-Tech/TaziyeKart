'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronRight, Search } from 'lucide-react';
import { fetchAdminHomes } from '@/lib/admin-api';
import type { HomeStatus, Plan } from '@/lib/api-types';
import { formatDateTimeLong, homeStatusLabel, PLAN_LABELS } from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type PlanFilter = '' | Plan;
type StatusFilter = '' | HomeStatus;

export default function AdminHomesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<PlanFilter>('');
  const [status, setStatus] = useState<StatusFilter>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'homes', { search, plan, status }],
    queryFn: () =>
      fetchAdminHomes({
        search: search || undefined,
        plan: plan || undefined,
        status: status || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Superadmin"
        title="Cenaze evleri"
        description="Tüm cenaze evlerini, planlarını ve kullanım durumlarını yönetin."
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
              placeholder="Cenaze evi adı veya telefon"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Ara
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Select
            value={plan}
            onChange={(event) => setPlan(event.target.value as PlanFilter)}
            className="w-40"
          >
            <option value="">Tüm planlar</option>
            <option value="TRIAL">Deneme</option>
            <option value="SINGLE">Tek Kart</option>
            <option value="MONTHLY">Cenaze Evi</option>
          </Select>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="w-40"
          >
            <option value="">Tüm durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Askıda</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <PanelLoading />
      ) : error || !data ? (
        <PanelError onRetry={refetch} />
      ) : data.homes.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Cenaze evi bulunamadı"
          description="Arama veya filtreyi değiştirin; kayıt olan cenaze evleri burada görünür."
        />
      ) : (
        <div className="space-y-2">
          {data.homes.map((home) => (
            <Link
              key={home.id}
              href={`/admin/cenaze-evleri/${home.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-paper p-4 transition-colors hover:border-gold/60"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{home.name}</p>
                <p className="mt-1 truncate text-xs text-muted">
                  {home.phone ?? 'Telefon yok'} · {formatDateTimeLong(home.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{PLAN_LABELS[home.plan]}</Badge>
                <Badge variant={home.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {homeStatusLabel(home.status)}
                </Badge>
                <span className="text-xs text-muted">{home.cardsCount} kart</span>
                <span className="text-xs text-muted">{home.usersCount} kullanıcı</span>
                {home.pendingMessages > 0 ? (
                  <Badge variant="warning">{home.pendingMessages} mesaj</Badge>
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
