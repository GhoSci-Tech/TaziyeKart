import { clientApi } from './api';
import type {
  AdminCard,
  AdminHome,
  AdminHomeDetail,
  AdminMessage,
  AdminStats,
  CondolenceStatus,
  HomeStatus,
  Plan,
} from './api-types';

function jsonRequest(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

function withQuery(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const serialized = query.toString();
  return `${path}${serialized ? `?${serialized}` : ''}`;
}

export async function fetchAdminStats() {
  return clientApi<AdminStats>('/admin/stats');
}

export async function fetchAdminHomes(params: {
  search?: string;
  plan?: Plan;
  status?: HomeStatus;
  limit?: number;
} = {}) {
  return clientApi<{ homes: AdminHome[] }>(
    withQuery('/admin/homes', {
      search: params.search,
      plan: params.plan,
      status: params.status,
      limit: params.limit,
    }),
  );
}

export async function fetchAdminHome(id: string) {
  return clientApi<AdminHomeDetail>(`/admin/homes/${encodeURIComponent(id)}`);
}

export async function updateAdminHome(
  id: string,
  payload: { plan?: Plan; status?: HomeStatus },
) {
  return clientApi<{ home: AdminHome }>(
    `/admin/homes/${encodeURIComponent(id)}`,
    jsonRequest('PATCH', payload),
  );
}

export async function fetchAdminCards(params: {
  search?: string;
  homeId?: string;
  published?: 'true' | 'false';
  limit?: number;
} = {}) {
  return clientApi<{ cards: AdminCard[] }>(
    withQuery('/admin/cards', {
      search: params.search,
      homeId: params.homeId,
      published: params.published,
      limit: params.limit,
    }),
  );
}

export async function updateAdminCard(id: string, payload: { published: boolean }) {
  return clientApi<{ card: AdminCard }>(
    `/admin/cards/${encodeURIComponent(id)}`,
    jsonRequest('PATCH', payload),
  );
}

export async function deleteAdminCard(id: string) {
  await clientApi<null>(`/admin/cards/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchAdminMessages(params: {
  status?: CondolenceStatus;
  homeId?: string;
  cardId?: string;
  limit?: number;
} = {}) {
  return clientApi<{ messages: AdminMessage[] }>(
    withQuery('/admin/messages', {
      status: params.status,
      homeId: params.homeId,
      cardId: params.cardId,
      limit: params.limit,
    }),
  );
}

export async function moderateAdminMessage(
  id: string,
  status: 'APPROVED' | 'REJECTED',
) {
  return clientApi<{ message: AdminMessage }>(
    `/admin/messages/${encodeURIComponent(id)}`,
    jsonRequest('PATCH', { status }),
  );
}

export async function deleteAdminMessage(id: string) {
  await clientApi<null>(`/admin/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
