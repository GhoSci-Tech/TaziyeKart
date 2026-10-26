import { clientApi } from './api';
import type { FamilyCard, FamilyCondolence, FamilyEditData } from './api-types';
import type { CardFormValues } from './schemas';

function jsonRequest(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export async function fetchFamilyCard(token: string) {
  return clientApi<FamilyEditData>(`/edit/cards/${encodeURIComponent(token)}`);
}

export async function updateFamilyCard(token: string, payload: CardFormValues) {
  return clientApi<{ card: FamilyCard }>(
    `/edit/cards/${encodeURIComponent(token)}`,
    jsonRequest('PATCH', payload),
  );
}

export async function deleteFamilyCard(token: string) {
  await clientApi<null>(`/edit/cards/${encodeURIComponent(token)}`, { method: 'DELETE' });
}

export async function moderateFamilyCondolence(
  token: string,
  id: string,
  status: 'APPROVED' | 'REJECTED',
) {
  return clientApi<{ message: FamilyCondolence }>(
    `/edit/cards/${encodeURIComponent(token)}/condolences/${encodeURIComponent(id)}`,
    jsonRequest('PATCH', { status }),
  );
}
