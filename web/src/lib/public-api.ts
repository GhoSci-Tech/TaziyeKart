import { clientApi } from './api';

export async function sendCondolence(
  slug: string,
  payload: { name: string; message: string; website?: string },
) {
  return clientApi<{ message: string; status: 'PENDING' }>(
    `/public/cards/${encodeURIComponent(slug)}/condolences`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
}
