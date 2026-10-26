import type { CondolenceStatus, HomeStatus, Plan } from './api-types';

export const PLAN_LABELS: Record<Plan, string> = {
  TRIAL: 'Deneme',
  SINGLE: 'Tek Kart',
  MONTHLY: 'Cenaze Evi',
};

export const PLAN_PRICES: Record<Plan, string> = {
  TRIAL: '0 TL',
  SINGLE: '350 TL',
  MONTHLY: '1.500 TL/ay',
};

export function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} · ${time || '—'}`;
}

export function formatDateTimeLong(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function planLimitLabel(limit: number | null): string {
  return limit === null ? 'Sınırsız' : `${limit} kart`;
}

export function homeStatusLabel(status: HomeStatus): string {
  return status === 'ACTIVE' ? 'Aktif' : 'Askıda';
}

export function messageStatusLabel(status: CondolenceStatus): string {
  if (status === 'PENDING') return 'Onay bekliyor';
  if (status === 'APPROVED') return 'Yayında';
  return 'Reddedildi';
}
