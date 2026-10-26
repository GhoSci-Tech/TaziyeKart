'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { fetchHome, updateHome } from '@/lib/panel-api';
import { brandSchema, type BrandValues } from '@/lib/schemas';
import { ApiError } from '@/lib/api';
import type { PanelHome } from '@/lib/api-types';
import { PageHeader, PanelError, PanelLoading } from '@/components/panel/panel-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function BrandForm({ home }: { home: PanelHome }) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: home.name,
      phone: home.phone ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: BrandValues) =>
      updateHome({
        name: values.name,
        phone: values.phone.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['panel', 'home'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      toast.success('Marka bilgileri güncellendi.');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.fields?.name) setError('name', { message: error.fields.name });
        if (error.fields?.phone) setError('phone', { message: error.fields.phone });
      } else {
        setFormError('Marka bilgileri kaydedilemedi.');
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    mutation.mutate(values);
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="max-w-2xl space-y-5 rounded-2xl border border-line bg-paper p-6"
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {formError}
        </div>
      ) : null}

      <div>
        <Label htmlFor="name">Cenaze evi adı</Label>
        <Input id="name" {...register('name')} />
        {errors.name ? <p className="mt-1 text-xs text-red-700">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" placeholder="0212 000 00 00" {...register('phone')} />
        {errors.phone ? <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p> : null}
      </div>

      <div className="rounded-xl bg-cream/60 p-4 text-sm leading-relaxed text-muted">
        Bu ad ve telefon, her taziye kartının altında görünür. Aileye doğrudan telefon numarası
        vermek yerine cenaze evinizin iletişimini paylaşmış olursunuz.
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Kaydet
      </Button>
    </form>
  );
}

export default function BrandPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['panel', 'home'],
    queryFn: fetchHome,
  });

  if (isLoading) return <PanelLoading />;
  if (error || !data) return <PanelError onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Marka"
        description="Bu bilgiler her taziye kartının altında görünür."
      />
      <BrandForm home={data.home} />
    </div>
  );
}
