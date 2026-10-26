import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih seçin.')
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Geçerli bir tarih girin.');

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'Bağlantı çok uzun.')
  .refine(
    (value) => value === '' || /^https?:\/\/\S+$/i.test(value),
    'http:// veya https:// ile başlayan bir bağlantı girin.',
  );

const optionalIban = z
  .string()
  .trim()
  .max(34, 'IBAN çok uzun.')
  .refine(
    (value) => value === '' || /^TR\d{24}$/.test(value.replace(/\s+/g, '').toUpperCase()),
    'IBAN TR ile başlamalı ve 24 rakam içermeli.',
  );

const optionalTime = z
  .string()
  .trim()
  .refine((value) => value === '' || timeRegex.test(value), 'Saat SS:DD biçiminde olmalı.');

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin.'),
  password: z.string().min(1, 'Şifre gerekli.'),
});

export const registerSchema = z.object({
  homeName: z.string().trim().min(2, 'Cenaze evi adı en az 2 karakter olmalı.'),
  contactName: z.string().trim().min(2, 'Yetkili adı en az 2 karakter olmalı.'),
  email: z.string().trim().email('Geçerli bir e-posta girin.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
  phone: z.string().trim().max(30, 'Telefon çok uzun.'),
});

export const brandSchema = z.object({
  name: z.string().trim().min(2, 'Cenaze evi adı en az 2 karakter olmalı.'),
  phone: z.string().trim().max(30, 'Telefon çok uzun.'),
});

export const cardFormSchema = z.object({
  deceasedName: z.string().trim().min(1, 'Merhumun adı gerekli.').max(120, 'Ad çok uzun.'),
  honorific: z.enum(['Merhum', 'Merhume']),
  funeralPlace: z.string().trim().min(1, 'Cenaze namazı yeri gerekli.').max(160, 'Yer adı çok uzun.'),
  funeralAddress: z.string().trim().max(240, 'Adres çok uzun.'),
  funeralMapUrl: optionalUrl,
  funeralDate: dateString,
  funeralTime: z.string().regex(timeRegex, 'Saat SS:DD biçiminde olmalı.'),
  cemeteryName: z.string().trim().max(160, 'Mezarlık adı çok uzun.'),
  burialTime: optionalTime,
  condolenceAddress: z.string().trim().max(240, 'Taziye adresi çok uzun.'),
  condolenceHours: z.string().trim().max(80, 'Taziye saatleri çok uzun.'),
  donationUrl: optionalUrl,
  donationIban: optionalIban,
  note: z.string().trim().max(500, 'Not çok uzun.'),
  published: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type BrandValues = z.infer<typeof brandSchema>;
export type CardFormValues = z.infer<typeof cardFormSchema>;
