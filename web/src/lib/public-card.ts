import { cache } from 'react';
import { serverApi } from './api';
import type { PublicCard } from './api-types';

export const getPublicCard = cache(async (slug: string) => {
  const data = await serverApi<{ card: PublicCard }>(
    `/public/cards/${encodeURIComponent(slug)}`,
  );
  return data.card;
});
