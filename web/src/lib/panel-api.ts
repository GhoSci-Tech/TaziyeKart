import { clientApi } from './api';
import type {
  CheckoutResponse,
  CondolenceStatus,
  PanelCard,
  PanelHome,
  PanelMessage,
  PanelOverview,
} from './api-types';
import type { CardFormValues } from './schemas';

function jsonRequest(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export async function fetchOverview() {
  return clientApi<PanelOverview>('/panel/overview');
}

export async function fetchHome() {
  return clientApi<{ home: PanelHome }>('/panel/home');
}

export async function updateHome(payload: { name?: string; phone?: string }) {
  return clientApi<{ home: PanelHome }>('/panel/home', jsonRequest('PATCH', payload));
}

export async function fetchCards(params: { search?: string; published?: 'true' | 'false' }) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.published) searchParams.set('published', params.published);
  const query = searchParams.toString();
  return clientApi<{ cards: PanelCard[] }>(`/panel/cards${query ? `?${query}` : ''}`);
}

export async function fetchCard(id: string) {
  return clientApi<{ card: PanelCard }>(`/panel/cards/${id}`);
}

export async function createCard(payload: CardFormValues) {
  return clientApi<{ card: PanelCard }>('/panel/cards', jsonRequest('POST', payload));
}

export async function updateCard(id: string, payload: Partial<CardFormValues>) {
  return clientApi<{ card: PanelCard }>(`/panel/cards/${id}`, jsonRequest('PATCH', payload));
}

export async function deleteCard(id: string) {
  await clientApi<null>(`/panel/cards/${id}`, { method: 'DELETE' });
}

export async function fetchMessages(status?: CondolenceStatus) {
  const query = status ? `?status=${status}` : '';
  return clientApi<{ messages: PanelMessage[] }>(`/panel/messages${query}`);
}

export async function moderateMessage(id: string, status: 'APPROVED' | 'REJECTED') {
  return clientApi<{ message: PanelMessage }>(
    `/panel/messages/${id}`,
    jsonRequest('PATCH', { status }),
  );
}

export async function checkoutDemo(plan: 'SINGLE' | 'MONTHLY') {
  return clientApi<CheckoutResponse>('/panel/checkout', jsonRequest('POST', { plan }));
}
