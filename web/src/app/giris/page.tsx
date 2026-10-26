'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { demoLoginRequest, loginRequest } from '@/lib/auth-api';
import { loginSchema, type LoginValues } from '@/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const login = useMutation({
    mutationFn: (values: LoginValues) => loginRequest(values.email, values.password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Giriş yapıldı.');
      router.replace('/panel');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.fields?.email) setError('email', { message: error.fields.email });
        if (error.fields?.password) setError('password', { message: error.fields.password });
      } else {
        setFormError('Giriş yapılamadı. Lütfen tekrar deneyin.');
      }
    },
  });

  const demo = useMutation({
    mutationFn: demoLoginRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Demo cenaze evi hesabıyla giriş yapıldı.');
      router.replace('/panel');
    },
    onError: () => toast.error('Demo giriş yapılamadı.'),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values);
  });

  return (
    <PageShell
      eyebrow="Cenaze evi"
      title="Giriş"
      description="Taziye kartlarınızı yönetmek için cenaze evi hesabınızla giriş yapın."
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
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@cenazeevi.com"
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-700">{errors.email.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-700">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Giriş yap
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        veya
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="gold"
        className="w-full"
        onClick={() => demo.mutate()}
        disabled={demo.isPending}
      >
        {demo.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Demo cenaze eviyle gir
      </Button>

      <p className="mt-4 text-xs text-muted">Demo hesap: demo@taziyekart.local / Demo123!</p>
      <p className="mt-6 text-sm text-muted">
        Hesabınız yok mu?{' '}
        <Link href="/kayit" className="font-semibold text-forest underline underline-offset-4">
          Cenaze evi kaydı
        </Link>
      </p>
    </PageShell>
  );
}
