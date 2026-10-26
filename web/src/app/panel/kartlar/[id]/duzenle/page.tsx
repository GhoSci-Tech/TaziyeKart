'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { fetchCard } from '@/lib/panel-api';
import { CardForm, toCardFormValues } from '@/components/panel/card-form';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { buttonVariants } from '@/components/ui/button';
import { useSession } from '@/lib/session';
import { cn } from '@/lib/cn';

export default function EditCardPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useSession();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'card', id],
    queryFn: () => fetchCard(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <PanelLoading />;
  if (error || !data) return <PanelError onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Kartı düzenle"
        description={`${data.card.deceasedName} için taziye kartı bilgileri.`}
        action={
          <Link
            href={`/panel/kartlar/${id}`}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <ArrowLeft className="h-4 w-4" />
            Karta dön
          </Link>
        }
      />
      <CardForm
        mode="edit"
        cardId={id}
        initialValues={toCardFormValues(data.card)}
        homeName={user?.funeralHome?.name ?? ''}
      />
    </div>
  );
}
