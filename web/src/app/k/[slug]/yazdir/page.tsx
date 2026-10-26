import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { ApiError } from '@/lib/api';
import { getPublicCard } from '@/lib/public-card';
import type { PublicCard } from '@/lib/api-types';
import { formatDate } from '@/lib/format';
import { PrintTrigger } from '@/components/public/print-trigger';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const card = await getPublicCard(slug);
    return {
      title: `Yazdır — ${card.deceasedName}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'Yazdır',
      robots: { index: false, follow: false },
    };
  }
}

export default async function PrintPage({ params }: PageProps) {
  const { slug } = await params;

  let card: PublicCard;
  try {
    card = await getPublicCard(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const publicUrl = `${siteUrl}/k/${card.slug}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 400,
    color: { dark: '#152B24', light: '#FCFAF5' },
  });
  const fullTitle = `${card.honorific ?? ''} ${card.deceasedName}`.replace(/\s+/g, ' ').trim();

  return (
    <main className="min-h-screen bg-cream px-4 py-8">
      <style>{`
        @media print {
          @page { size: A6; margin: 0; }
          html, body { background: #ffffff !important; }
          .print-sheet {
            width: 105mm !important;
            height: 148mm !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
          }
          .print-sheet:last-child { page-break-after: auto; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="print-hidden mx-auto max-w-4xl space-y-4 pb-6">
        <PrintTrigger backHref={`/k/${card.slug}`} />
        <p className="text-sm leading-relaxed text-muted">
          A6 · ön/arka · QR public karta gider. Tarayıcıda{' '}
          <strong>Yazdır → PDF olarak kaydet</strong> seçip matbaaya götürebilirsin.
        </p>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <article className="print-sheet flex min-h-[148mm] w-[105mm] flex-col justify-between rounded-[18px] border border-line bg-paper p-[8mm] shadow-card">
          <div>
            <div className="flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-[0.22em] text-gold">
              <span>Taziye</span>
              <span className="max-w-[58%] truncate text-right font-sans text-[8px] font-medium normal-case tracking-normal text-muted">
                {card.home.name}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted">
                {card.honorific}
              </p>
              <h1 className="mt-1.5 break-words font-serif text-[42px] leading-[0.95] text-forest-deep">
                {card.deceasedName}
              </h1>
            </div>

            <div className="my-5 h-px bg-gold/60" />

            <div className="space-y-4 text-[11px]">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                  Cenaze namazı
                </p>
                <p className="mt-1 font-semibold text-ink">{card.funeralPlace}</p>
                <p className="mt-1 text-muted">
                  {formatDate(card.funeralDate)} · {card.funeralTime}
                </p>
                {card.funeralAddress ? (
                  <p className="mt-1 text-muted">{card.funeralAddress}</p>
                ) : null}
              </div>

              {card.cemeteryName || card.burialTime ? (
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                    Defin
                  </p>
                  {card.cemeteryName ? (
                    <p className="mt-1 font-semibold text-ink">{card.cemeteryName}</p>
                  ) : null}
                  {card.burialTime ? (
                    <p className="mt-1 text-muted">{card.burialTime}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between gap-2 text-[8px] text-muted">
              <span>{card.home.phone ?? 'TaziyeKart'}</span>
              <span>Yol tarifi ve detaylar arka yüzde</span>
            </div>
          </div>
        </article>

        <article className="print-sheet flex min-h-[148mm] w-[105mm] flex-col justify-between rounded-[18px] border border-line bg-paper p-[8mm] shadow-card">
          <div>
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.22em] text-gold">
              <span>Taziye</span>
              <span className="font-sans text-[8px] font-medium normal-case tracking-normal text-muted">
                {card.home.name}
              </span>
            </div>

            <p className="mt-5 font-serif text-2xl leading-tight text-forest-deep">
              {fullTitle}
            </p>
            <div className="my-4 h-px bg-gold/60" />

            {card.condolenceAddress ? (
              <div className="text-[11px]">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                  Taziye
                </p>
                <p className="mt-1 font-semibold text-ink">{card.condolenceAddress}</p>
                {card.condolenceHours ? (
                  <p className="mt-1 text-muted">{card.condolenceHours}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] text-muted">
                Detaylar ve yol tarifi için QR kodu okutun.
              </p>
            )}

            {card.note ? (
              <p className="mt-3 text-[9px] leading-relaxed text-muted">{card.note}</p>
            ) : null}

            {card.donationUrl || card.donationIban ? (
              <p className="mt-2 break-all text-[8px] leading-relaxed text-muted">
                Bağış: {card.donationUrl ?? card.donationIban}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <img
              src={qrDataUrl}
              alt={`${fullTitle} taziye kartı QR kodu`}
              className="h-[34mm] w-[34mm]"
            />
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-muted">
              Yol tarifi için okutun
            </p>
            <p className="break-all text-center font-mono text-[7px] text-muted">{publicUrl}</p>
          </div>

          <div className="border-t border-line pt-3 text-[8px] text-muted">
            <div className="flex items-center justify-between gap-2">
              <span>{card.home.name}</span>
              <span>{card.home.phone ?? ''}</span>
            </div>
            <p className="mt-1 text-center">TaziyeKart</p>
          </div>
        </article>
      </div>
    </main>
  );
}
