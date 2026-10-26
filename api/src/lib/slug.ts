import { randomBytes } from 'node:crypto';

const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

export function slugify(input: string): string {
  const mapped = input
    .toLocaleLowerCase('tr-TR')
    .split('')
    .map((char) => TURKISH_MAP[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const slug = mapped
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-$/g, '');

  return slug || 'taziye';
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function makeCardSlug(deceasedName: string): string {
  return `${slugify(deceasedName)}-${randomBytes(3).toString('hex')}`;
}
