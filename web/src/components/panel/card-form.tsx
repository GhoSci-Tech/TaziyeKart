'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { createCard, updateCard } from '@/lib/panel-api';
import { updateFamilyCard } from '@/lib/family-api';
import { cardFormSchema, type CardFormValues } from '@/lib/schemas';
import type { FamilyCard, PanelCard } from '@/lib/api-types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CardPreview } from '@/components/panel/card-preview';
import { cn } from '@/lib/cn';

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export const emptyCardValues: CardFormValues = {
  deceasedName: '',
  honorific: 'Merhum',
  funeralPlace: '',
  funeralAddress: '',
  funeralMapUrl: '',
  funeralDate: todayString(),
  funeralTime: '12:00',
  cemeteryName: '',
  burialTime: '',
  condolenceAddress: '',
  condolenceHours: '',
  donationUrl: '',
  donationIban: '',
  note: '',
  published: true,
};

const CARD_FIELDS = new Set<keyof CardFormValues>(
  Object.keys(emptyCardValues) as (keyof CardFormValues)[],
);

function isCardField(value: string): value is keyof CardFormValues {
  return CARD_FIELDS.has(value as keyof CardFormValues);
}

type CardFormSource = Pick<
  PanelCard,
  | 'deceasedName'
  | 'honorific'
  | 'funeralPlace'
  | 'funeralAddress'
  | 'funeralMapUrl'
  | 'funeralDate'
  | 'funeralTime'
  | 'cemeteryName'
  | 'burialTime'
  | 'condolenceAddress'
  | 'condolenceHours'
  | 'donationUrl'
  | 'donationIban'
  | 'note'
  | 'published'
>;

export function toCardFormValues(card: CardFormSource): CardFormValues {
  return {
    ...emptyCardValues,
    deceasedName: card.deceasedName,
    honorific: card.honorific === 'Merhume' ? 'Merhume' : 'Merhum',
    funeralPlace: card.funeralPlace,
    funeralAddress: card.funeralAddress ?? '',
    funeralMapUrl: card.funeralMapUrl ?? '',
    funeralDate: card.funeralDate,
    funeralTime: card.funeralTime,
    cemeteryName: card.cemeteryName ?? '',
    burialTime: card.burialTime ?? '',
    condolenceAddress: card.condolenceAddress ?? '',
    condolenceHours: card.condolenceHours ?? '',
    donationUrl: card.donationUrl ?? '',
    donationIban: card.donationIban ?? '',
    note: card.note ?? '',
    published: card.published,
  };
}

type CardFormProps = {
  mode: 'create' | 'edit';
  cardId?: string;
  editToken?: string;
  initialValues?: CardFormValues;
  homeName?: string;
  cancelHref?: string;
  cancelLabel?: string;
};

export function CardForm({
  mode,
  cardId,
  editToken,
  initialValues,
  homeName,
  cancelHref,
  cancelLabel,
}: CardFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<'PLAN_LIMIT' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: initialValues ?? emptyCardValues,
  });

  const values = watch();

  type CardMutationResult = { card: PanelCard } | { card: FamilyCard };

  const mutation = useMutation({
    mutationFn: async (payload: CardFormValues): Promise<CardMutationResult> => {
      if (editToken) return updateFamilyCard(editToken, payload);
      if (mode === 'edit' && cardId) return updateCard(cardId, payload);
      return createCard(payload);
    },
    onSuccess: (data) => {
      if (editToken) {
        queryClient.invalidateQueries({ queryKey: ['family', 'card', editToken] });
        toast.success('Kart güncellendi.');
        return;
      }

      const panelData = data as { card: PanelCard };
      queryClient.setQueryData(['panel', 'card', panelData.card.id], panelData);
      queryClient.invalidateQueries({ queryKey: ['panel', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['panel', 'overview'] });
      toast.success(mode === 'edit' ? 'Kart güncellendi.' : 'Taziye kartı oluşturuldu.');
      router.push(`/panel/kartlar/${panelData.card.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.code === 'PLAN_LIMIT') setErrorCode('PLAN_LIMIT');
        if (error.fields) {
          for (const [key, message] of Object.entries(error.fields)) {
            if (isCardField(key)) setError(key, { message });
          }
        }
      } else {
        setFormError('Kart kaydedilemedi. Lütfen tekrar deneyin.');
      }
    },
  });

  const onSubmit = handleSubmit((payload) => {
    setFormError(null);
    setErrorCode(null);
    mutation.mutate(payload);
  });

  const backHref = cancelHref ?? '/panel/kartlar';
  const backLabel = cancelLabel ?? 'Kartlara dön';

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <p>{formError}</p>
            {errorCode === 'PLAN_LIMIT' ? (
              <Link href="/panel/plan" className="mt-2 inline-block font-semibold underline">
                Planı yükselt
              </Link>
            ) : null}
          </div>
        ) : null}

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl text-forest-deep">Merhum</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]">
            <div>
              <Label htmlFor="honorific">Hitap</Label>
              <Select id="honorific" {...register('honorific')}>
                <option value="Merhum">Merhum</option>
                <option value="Merhume">Merhume</option>
              </Select>
              {errors.honorific ? (
                <p className="mt-1 text-xs text-red-700">{errors.honorific.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="deceasedName">Ad soyad</Label>
              <Input
                id="deceasedName"
                placeholder="Örn. Ahmet Yılmaz"
                {...register('deceasedName')}
              />
              {errors.deceasedName ? (
                <p className="mt-1 text-xs text-red-700">{errors.deceasedName.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl text-forest-deep">Cenaze</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="funeralPlace">Cenaze namazı yeri</Label>
              <Input
                id="funeralPlace"
                placeholder="Örn. Merkez Camii"
                {...register('funeralPlace')}
              />
              {errors.funeralPlace ? (
                <p className="mt-1 text-xs text-red-700">{errors.funeralPlace.message}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="funeralAddress">Adres (opsiyonel)</Label>
              <Input
                id="funeralAddress"
                placeholder="Mahalle, sokak, no"
                {...register('funeralAddress')}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="funeralMapUrl">Harita linki (opsiyonel)</Label>
              <Input
                id="funeralMapUrl"
                placeholder="https://maps.google.com/..."
                {...register('funeralMapUrl')}
              />
              {errors.funeralMapUrl ? (
                <p className="mt-1 text-xs text-red-700">{errors.funeralMapUrl.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="funeralDate">Tarih</Label>
              <Input id="funeralDate" type="date" {...register('funeralDate')} />
              {errors.funeralDate ? (
                <p className="mt-1 text-xs text-red-700">{errors.funeralDate.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="funeralTime">Saat</Label>
              <Input id="funeralTime" type="time" {...register('funeralTime')} />
              {errors.funeralTime ? (
                <p className="mt-1 text-xs text-red-700">{errors.funeralTime.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="cemeteryName">Mezarlık (opsiyonel)</Label>
              <Input id="cemeteryName" placeholder="Örn. Şehir Mezarlığı" {...register('cemeteryName')} />
            </div>
            <div>
              <Label htmlFor="burialTime">Defin saati (opsiyonel)</Label>
              <Input id="burialTime" type="time" {...register('burialTime')} />
              {errors.burialTime ? (
                <p className="mt-1 text-xs text-red-700">{errors.burialTime.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl text-forest-deep">Taziye</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="condolenceAddress">Taziye adresi (opsiyonel)</Label>
              <Input
                id="condolenceAddress"
                placeholder="Örn. Cumhuriyet Mah. Taziye Çadırı"
                {...register('condolenceAddress')}
              />
            </div>
            <div>
              <Label htmlFor="condolenceHours">Taziye saatleri (opsiyonel)</Label>
              <Input id="condolenceHours" placeholder="Örn. 12:00-22:00" {...register('condolenceHours')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note">Not (opsiyonel)</Label>
              <Textarea
                id="note"
                placeholder="Örn. Çiçek yerine bağış rica ederiz."
                {...register('note')}
              />
              {errors.note ? <p className="mt-1 text-xs text-red-700">{errors.note.message}</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl text-forest-deep">Bağış</h2>
          <p className="mt-1 text-xs text-muted">İkisinden biri yeterli; boş bırakabilirsiniz.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="donationUrl">Bağış linki (opsiyonel)</Label>
              <Input
                id="donationUrl"
                placeholder="https://..."
                {...register('donationUrl')}
              />
              {errors.donationUrl ? (
                <p className="mt-1 text-xs text-red-700">{errors.donationUrl.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="donationIban">IBAN (opsiyonel)</Label>
              <Input
                id="donationIban"
                placeholder="TR00 0000 0000 0000 0000"
                {...register('donationIban')}
              />
              {errors.donationIban ? (
                <p className="mt-1 text-xs text-red-700">{errors.donationIban.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl text-forest-deep">Yayın</h2>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              {...register('published')}
              className="mt-1 h-4 w-4 rounded border-line text-forest focus:ring-gold"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Kart yayında olsun</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Kapatırsan public link 404 döner; dilediğinde tekrar açabilirsin.
              </span>
            </span>
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className={cn(buttonVariants({ variant: 'outline' }))}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === 'edit' ? 'Değişiklikleri kaydet' : 'Kartı oluştur'}
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <CardPreview values={values} homeName={homeName} />
        <p className="mt-3 text-center text-xs text-muted">
          Canlı önizleme · Public kartın temel görünümü
        </p>
      </aside>
    </form>
  );
}
