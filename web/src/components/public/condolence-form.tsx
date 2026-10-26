'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { sendCondolence } from '@/lib/public-api';
import { condolenceFormSchema, type CondolenceFormValues } from '@/lib/schemas';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function CondolenceForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CondolenceFormValues>({
    resolver: zodResolver(condolenceFormSchema),
    defaultValues: { name: '', message: '', website: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: CondolenceFormValues) =>
      sendCondolence(slug, {
        name: values.name,
        message: values.message,
        website: values.website,
      }),
    onSuccess: () => {
      setSent(true);
      setFormError(null);
      reset();
      toast.success('Mesajınız aile onayına gönderildi.');
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.fields?.name) setError('name', { message: error.fields.name });
        if (error.fields?.message) setError('message', { message: error.fields.message });
      } else {
        setFormError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setSent(false);
    mutation.mutate(values);
  });

  return (
    <div>
      <h3 className="font-serif text-2xl text-forest-deep">Taziye mesajı bırak</h3>
      <p className="mt-1 text-sm text-muted">
        Mesajınız aile onayından sonra bu sayfada görünür.
      </p>

      {sent ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Mesajınız aile onayına gönderildi. Teşekkür ederiz.
        </p>
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {formError}
        </p>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="condolence-website">Website</Label>
          <Input
            id="condolence-website"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </div>

        <div>
          <Label htmlFor="condolence-name">Adınız</Label>
          <Input id="condolence-name" placeholder="Örn. Mehmet K." {...register('name')} />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="condolence-message">Mesajınız</Label>
          <Textarea
            id="condolence-message"
            placeholder="Başsağlığı dilerim..."
            {...register('message')}
          />
          {errors.message ? (
            <p className="mt-1 text-xs text-red-700">{errors.message.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={mutation.isPending} variant="gold">
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Mesaj bırak
        </Button>
      </form>
    </div>
  );
}
