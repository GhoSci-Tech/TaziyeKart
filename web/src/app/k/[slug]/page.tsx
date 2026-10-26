import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarPlus,
  Flower2,
  HeartHandshake,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
} from 'lucide-react';
import { ApiError } from '@/lib/api';
import { getPublicCard } from '@/lib/public-card';
import type { PublicCard } from '@/lib/api-types';
import { formatDate, formatDateTimeLong, googleCalendarUrl } from '@/lib/format';
import { PublicActions } from '@/components/public/public-actions';
import { CondolenceForm } from '@/components/public/condolence-form';
import { CopyButton } from '@/components/public/copy-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const card = await getPublicCard(slug);
    const title = `${card.honorific ?? ''} ${card.deceasedName} — Taziye`
      .replace(/\s+/g, ' ')
      .trim();
    const description = `${card.funeralPlace} · ${formatDate(card.funeralDate)}, ${card.funeralTime}${
      card.condolenceAddress ? ` · ${card.condolenceAddress}` : ''
    }`;

    return {
      title,
      description,
      robots: { index: false, follow: false },
      openGraph: { title, description, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    };
  } catch {
    return {
      title: 'Taziye kartı',
      robots: { index: false, follow: false },
    };
  }
}

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params;

  let card: PublicCard;
  try {
    card = await getPublicCard(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const fullTitle = `${card.honorific ?? ''} ${card.deceasedName}`.replace(/\s+/g, ' ').trim();
  const location = [card.funeralPlace, card.funeralAddress].filter(Boolean).join(', ');
  const mapHref =
    card.funeralMapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  const taziyeMapHref = card.condolenceAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        card.condolenceAddress,
      )}`
    : null;
  const calendarHref = googleCalendarUrl({
    title: `${fullTitle} — Cenaze namazı`,
    date: card.funeralDate,
    time: card.funeralTime,
    location,
    details: card.note ?? undefined,
  });

  return (
    <main className="min-h-screen bg-cream">
      <header className="print-hidden mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          TaziyeKart
        </Link>
        <span className="max-w-[50%] truncate text-xs text-muted">{card.home.name}</span>
      </header>

      <article className="public-card-print mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <div className="rounded-[32px] border border-line bg-paper p-7 shadow-card sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Taziye</p>
              <p className="mt-1 text-xs text-muted">{card.home.name}</p>
            </div>
            {card.home.phone ? (
              <a
                href={`tel:${card.home.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest"
              >
                <Phone className="h-3.5 w-3.5" />
                {card.home.phone}
              </a>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{card.honorific}</p>
            <h1 className="mt-2 break-words font-serif text-5xl leading-[1.02] text-forest-deep sm:text-6xl">
              {card.deceasedName}
            </h1>
          </div>

          <div className="my-8 h-px bg-gold/50" />

          <div className="grid gap-7 sm:grid-cols-2">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  Cenaze namazı
                </p>
                <p className="mt-1 font-semibold text-ink">{card.funeralPlace}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(card.funeralDate)} · {card.funeralTime}
                </p>
                {card.funeralAddress ? (
                  <p className="mt-1 text-sm text-muted">{card.funeralAddress}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Yol tarifi
                  </a>
                  <a
                    href={calendarHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Takvime ekle
                  </a>
                </div>
              </div>
            </div>

            {card.cemeteryName || card.burialTime ? (
              <div className="flex gap-3">
                <Flower2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Defin
                  </p>
                  {card.cemeteryName ? (
                    <p className="mt-1 font-semibold text-ink">{card.cemeteryName}</p>
                  ) : null}
                  {card.burialTime ? (
                    <p className="mt-1 text-sm text-muted">{card.burialTime}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {card.condolenceAddress ? (
              <div className="flex gap-3">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Taziye
                  </p>
                  <p className="mt-1 font-semibold text-ink">{card.condolenceAddress}</p>
                  {card.condolenceHours ? (
                    <p className="mt-1 text-sm text-muted">{card.condolenceHours}</p>
                  ) : null}
                  {taziyeMapHref ? (
                    <a
                      href={taziyeMapHref}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3')}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Yol tarifi
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {card.note ? (
            <p className="mt-7 rounded-2xl bg-cream/70 px-4 py-3 text-sm leading-relaxed text-muted">
              {card.note}
            </p>
          ) : null}

          {card.donationUrl || card.donationIban ? (
            <div className="mt-7 rounded-2xl border border-line bg-cream/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Bağış</p>
              {card.donationUrl ? (
                <a
                  href={card.donationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-forest underline underline-offset-4"
                >
                  Bağış sayfasını aç
                </a>
              ) : null}
              {card.donationIban ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm text-ink">{card.donationIban}</p>
                  <CopyButton value={card.donationIban} label="IBAN'ı kopyala" />
                </div>
              ) : null}
              <p className="mt-2 text-[11px] text-muted">
                Bağış bilgisi aile tarafından sağlanmıştır; doğruluğunu kontrol edin.
              </p>
            </div>
          ) : null}

          <div className="mt-8 print-hidden">
            <PublicActions title={fullTitle} publicPath={`/k/${card.slug}`} />
          </div>

          <p className="mt-4 text-[11px] text-muted print-hidden">
            Bu sayfa arama motorlarında görünmez. Link yalnızca sizin paylaştığınız kişilerce
            açılır.
          </p>
        </div>
      </article>

      <section className="print-hidden mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-3xl text-forest-deep">Taziye defteri</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Aile tarafından onaylanan mesajlar burada görünür.
          </p>

          {card.condolences.length > 0 ? (
            <div className="mt-5 space-y-3">
              {card.condolences.map((message) => (
                <div key={message.id} className="rounded-xl border border-line bg-cream/50 p-4">
                  <p className="font-semibold text-ink">{message.name}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {message.message}
                  </p>
                  <p className="mt-2 text-[11px] text-muted">
                    {formatDateTimeLong(message.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-cream/60 p-4 text-sm text-muted">
              İlk taziye mesajını siz bırakın.
            </p>
          )}

          <div className="mt-7 border-t border-line pt-7">
            <CondolenceForm slug={card.slug} />
          </div>
        </div>
      </section>

      <footer className="print-hidden mx-auto flex max-w-4xl flex-col gap-2 px-6 pb-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          {card.home.name}
          {card.home.phone ? ` · ${card.home.phone}` : ''}
        </span>
        <span>TaziyeKart · Bir link, herkes zamanında.</span>
      </footer>
    </main>
  );
}
