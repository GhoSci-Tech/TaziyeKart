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

export function googleCalendarUrl({
  title,
  date,
  time,
  location,
  details,
}: {
  title: string;
  date: string;
  time: string;
  location?: string;
  details?: string;
}): string {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const format = (value: Date) =>
    `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, '0')}${String(
      value.getDate(),
    ).padStart(2, '0')}T${String(value.getHours()).padStart(2, '0')}${String(
      value.getMinutes(),
    ).padStart(2, '0')}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${format(start)}/${format(end)}`,
  });
  if (location) params.set('location', location);
  if (details) params.set('details', details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
