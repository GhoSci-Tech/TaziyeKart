import { HeartHandshake, MapPin } from 'lucide-react';
import type { CardFormValues } from '@/lib/schemas';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

type CardPreviewProps = {
  values: CardFormValues;
  homeName?: string | null;
  className?: string;
};

export function CardPreview({ values, homeName, className }: CardPreviewProps) {
  const name = values.deceasedName.trim() || 'Merhumun adı';
  const place = values.funeralPlace.trim() || 'Cenaze namazı yeri';
  const date = values.funeralDate ? formatDate(values.funeralDate) : 'Tarih seçin';
  const time = values.funeralTime || 'Saat';
  const taziye = values.condolenceAddress.trim() || 'Taziye adresi';
  const hours = values.condolenceHours.trim();

  return (
    <article
      className={cn(
        'rounded-[28px] border border-line bg-paper p-7 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
        <span>Taziye</span>
        <span className="max-w-[60%] truncate text-right font-sans text-[10px] font-medium normal-case tracking-normal text-muted">
          {homeName || 'Cenaze evi'}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{values.honorific}</p>
        <h2 className="mt-2 break-words font-serif text-4xl leading-[1.05] text-forest-deep">
          {name}
        </h2>
      </div>

      <div className="my-6 h-px bg-gold/50" />

      <dl className="space-y-4 text-sm">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <dt className="font-semibold text-ink">Cenaze namazı</dt>
            <dd className="mt-0.5 text-muted">
              {place} · {date}, {time}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <dt className="font-semibold text-ink">Taziye</dt>
            <dd className="mt-0.5 text-muted">
              {taziye}
              {hours ? ` · ${hours}` : ''}
            </dd>
          </div>
        </div>
      </dl>

      {values.note.trim() ? (
        <p className="mt-5 rounded-xl bg-cream/70 px-3 py-2 text-xs leading-relaxed text-muted">
          {values.note}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[10px] text-muted">
        <span>{homeName || 'TaziyeKart'}</span>
        <span>Yol tarifi · Takvim · QR</span>
      </div>
    </article>
  );
}
