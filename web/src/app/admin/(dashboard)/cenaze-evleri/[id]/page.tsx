'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileText,
  MessageSquare,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminHome, updateAdminHome } from '@/lib/admin-api';
import type { AdminHome, AdminHomeDetail, HomeStatus, Plan } from '@/lib/api-types';
import {
  formatDate,
  formatDateTimeLong,
  homeStatusLabel,
  PLAN_LABELS,
} from '@/lib/format';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';

function HomeSettings({ home }: { home: AdminHome }) {
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState<Plan>(home.plan);
  const [status, setStatus] = useState<HomeStatus>(home.status);

  const mutation = useMutation({
    mutationFn: () => updateAdminHome(home.id, { plan, status }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['admin', 'home', home.id],
        (old: AdminHomeDetail | undefined) =>
          old ? { ...old, home: data.home } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'homes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Cenaze evi güncellendi.');
    },
    onError: () => toast.error('Cenaze evi güncellenemedi.'),
  });

  return (
    <section className="rounded-2xl border border-line bg-paper p-6">
      <h2 className="font-serif text-2xl text-forest-deep">Plan ve durum</h2>
      <p className="mt-1 text-sm text-muted">
        Plan değişikliği anında uygulanır. Askıya alınan hesap yeni kart oluşturamaz.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="admin-plan">Plan</Label>
          <Select
            id="admin-plan"
            value={plan}
            onChange={(event) => setPlan(event.target.value as Plan)}
          >
            <option value="TRIAL">Deneme</option>
            <option value="SINGLE">Tek Kart</option>
            <option value="MONTHLY">Cenaze Evi</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="admin-status">Durum</Label>
          <Select
            id="admin-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as HomeStatus)}
          >
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Askıda</option>
          </Select>
        </div>
      </div>
      <Button className="mt-5" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </section>
  );
}

export default function AdminHomeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'home', id],
    queryFn: () => fetchAdminHome(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <PanelLoading />;
  if (error || !data) return <PanelError onRetry={refetch} />;

  const { home, users, cards, messageCounts } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cenaze evi"
        title={home.name}
        description={`${home.phone ?? 'Telefon yok'} · Kayıt: ${formatDateTimeLong(
          home.createdAt,
        )}`}
        action={
          <Link
            href="/admin/cenaze-evleri"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <ArrowLeft className="h-4 w-4" />
            Cenaze evleri
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="gold">{PLAN_LABELS[home.plan]}</Badge>
        <Badge variant={home.status === 'ACTIVE' ? 'success' : 'danger'}>
          {homeStatusLabel(home.status)}
        </Badge>
        <span className="text-xs text-muted">{home.cardsCount} kart</span>
        <span className="text-xs text-muted">{home.usersCount} kullanıcı</span>
        <span className="text-xs text-muted">{home.pendingMessages} bekleyen mesaj</span>
      </div>

      <HomeSettings home={home} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <FileText className="h-5 w-5 text-gold" />
          <p className="mt-3 text-3xl font-semibold tabular-nums text-forest-deep">
            {home.cardsCount}
          </p>
          <p className="text-xs text-muted">Kart</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <Users className="h-5 w-5 text-gold" />
          <p className="mt-3 text-3xl font-semibold tabular-nums text-forest-deep">
            {home.usersCount}
          </p>
          <p className="text-xs text-muted">Kullanıcı</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <MessageSquare className="h-5 w-5 text-gold" />
          <p className="mt-3 text-3xl font-semibold tabular-nums text-forest-deep">
            {messageCounts.pending}
          </p>
          <p className="text-xs text-muted">Bekleyen taziye</p>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-paper p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-2xl text-forest-deep">Kullanıcılar</h2>
        </div>
        {users.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Bu cenaze evine bağlı kullanıcı yok.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-cream/40 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'SUPERADMIN' ? 'danger' : 'muted'}>
                    {user.role === 'SUPERADMIN' ? 'Superadmin' : 'Cenaze evi'}
                  </Badge>
                  <span className="text-[11px] text-muted">
                    {formatDateTimeLong(user.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-paper p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-forest-deep">Kartlar</h2>
            <p className="mt-1 text-sm text-muted">Bu cenaze evine ait tüm taziye kartları.</p>
          </div>
          <Link
            href="/admin/kartlar"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Tüm kartlar
          </Link>
        </div>
        {cards.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Henüz kart yok"
            description="Cenaze evi panelden kart oluşturduğunda burada görünür."
          />
        ) : (
          <div className="mt-4 space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream/40 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{card.deceasedName}</p>
                  <p className="text-xs text-muted">
                    {formatDate(card.funeralDate)} · {card.funeralTime}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-xs font-semibold text-forest underline underline-offset-4"
                  >
                    <ExternalLink className="mr-1 inline h-3 w-3" />
                    Aç
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-paper p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-forest-deep">Taziye mesajları</h2>
            <p className="mt-1 text-sm text-muted">
              {messageCounts.pending} bekleyen · {messageCounts.approved} onaylı ·{' '}
              {messageCounts.rejected} reddedilen
            </p>
          </div>
          <Link
            href="/admin/mesajlar"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <MessageSquare className="h-4 w-4" />
            Mesajlar
          </Link>
        </div>
      </section>
    </div>
  );
}
