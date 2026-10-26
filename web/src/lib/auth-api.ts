import { clientApi } from './api';
import type { SessionUser } from './api-types';

export type RegisterPayload = {
  homeName: string;
  contactName: string;
  email: string;
  password: string;
  phone?: string;
};

function jsonRequest(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function loginRequest(email: string, password: string) {
  return clientApi<{ user: SessionUser }>('/auth/login', jsonRequest({ email, password }));
}

export async function registerRequest(payload: RegisterPayload) {
  return clientApi<{ user: SessionUser }>('/auth/register', jsonRequest(payload));
}

export async function demoLoginRequest() {
  return clientApi<{ user: SessionUser }>('/auth/demo-home', { method: 'POST' });
}

export async function logoutRequest() {
  await clientApi<null>('/auth/logout', { method: 'POST' });
}
