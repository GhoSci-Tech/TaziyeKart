import { ImageResponse } from 'next/og';
import { getPublicCard } from '@/lib/public-card';
import type { PublicCard } from '@/lib/api-types';
import { formatDate } from '@/lib/format';

export const alt = 'Taziye kartı';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let card: PublicCard | null = null;

  try {
    card = await getPublicCard(slug);
  } catch {
    card = null;
  }

  const place = card
    ? `${card.funeralPlace} · ${formatDate(card.funeralDate)}, ${card.funeralTime}`
    : 'Bir link, herkes zamanında.';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F7F3EA',
          color: '#1B1B1B',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: '#B08D57',
            fontSize: 24,
            letterSpacing: '8px',
            textTransform: 'uppercase',
          }}
        >
          Taziye
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#6B6B6B', marginBottom: '12px' }}>
            {card?.honorific ?? ''}
          </div>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              color: '#152B24',
              fontWeight: 600,
            }}
          >
            {card?.deceasedName ?? 'TaziyeKart'}
          </div>
          <div
            style={{
              display: 'flex',
              height: '2px',
              width: '160px',
              backgroundColor: '#B08D57',
              margin: '32px 0',
            }}
          />
          <div style={{ fontSize: 32, color: '#1B1B1B' }}>{place}</div>
          {card?.condolenceAddress ? (
            <div style={{ fontSize: 26, color: '#6B6B6B', marginTop: '12px' }}>
              {card.condolenceAddress}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            color: '#6B6B6B',
          }}
        >
          <span>{card?.home.name ?? 'TaziyeKart'}</span>
          <span>taziyekart</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
