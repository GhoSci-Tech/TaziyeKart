'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { registerRequest } from '@/lib/auth-api';
import { registerSchema, type RegisterValues } from '@/lib/schemas';

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      homeName: '',
      contactName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const signup = useMutation({
    mutationFn: (values: RegisterValues) =>
      registerRequest({
        ...values,
        phone: values.phone.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Cenaze evi hesabınız oluşturuldu.');
      router.replace('/panel');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.fields) {
          for (const [key, message] of Object.entries(error.fields)) {
            if (
              key === 'homeName' ||
              key === 'contactName' ||
              key === 'email' ||
              key === 'password' ||
              key === 'phone'
            ) {
              setError(key, { message });
            }
          }
        }
      } else {
        setFormError('Kayıt tamamlanamadı. Lütfen tekrar deneyin.');
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    signup.mutate(values);
  });

  return (
    <PageShell
      eyebrow="Cenaze evi"
      title="Kayıt"
      description="Cenaze eviniz için panel açın. Deneme planıyla 1 kart oluşturabilirsiniz; aileler her zaman ücretsizdir."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <Label htmlFor="homeName">Cenaze evi adı</Label>
          <Input id="homeName" placeholder="Örn. Örnek Cenaze Evi" {...register('homeName')} />
          {errors.homeName ? (
            <p className="mt-1 text-xs text-red-700">{errors.homeName.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contactName">Yetkili adı</Label>
          <Input id="contactName" placeholder="Ad soyad" {...register('contactName')} />
          {errors.contactName ? (
            <p className="mt-1 text-xs text-red-700">{errors.contactName.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@cenazeevi.com"
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="phone">Telefon (opsiyonel)</Label>
            <Input id="phone" placeholder="0212 000 00 00" {...register('phone')} />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="En az 8 karakter"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-700">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={signup.isPending}>
          {signup.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Hesap oluştur
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Hesabınız var mı?{' '}
        <Link href="/giris" className="font-semibold text-forest underline underline-offset-4">
          Giriş yapın
        </Link>
      </p>
    </PageShell>
  );
}
