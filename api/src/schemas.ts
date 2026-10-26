import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Geçerli bir e-posta girin.')
  .max(160, 'E-posta çok uzun.')
  .transform((value) => value.toLowerCase());

const optionalString = (max: number, message = 'Bu alan çok uzun.') =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(max, message).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().url('Geçerli bir bağlantı girin.').max(500, 'Bağlantı çok uzun.').optional(),
);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-AA-GG biçiminde olmalı.')
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Geçerli bir tarih girin.');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeString = z.string().trim().regex(timeRegex, 'Saat SS:DD biçiminde olmalı.');

const optionalTime = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().regex(timeRegex, 'Saat SS:DD biçiminde olmalı.').optional(),
);

const optionalIban = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, '').toUpperCase())
    .refine((value) => /^TR\d{24}$/.test(value), 'IBAN TR ile başlamalı ve 24 rakam içermeli.')
    .optional(),
);

const honorific = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .enum(['Merhum', 'Merhume'], {
      errorMap: () => ({ message: 'Merhum veya Merhume seçin.' }),
    })
    .optional(),
);

export const registerSchema = z.object({
  homeName: z
    .string()
    .trim()
    .min(2, 'Cenaze evi adı en az 2 karakter olmalı.')
    .max(160, 'Cenaze evi adı çok uzun.'),
  contactName: z
    .string()
    .trim()
    .min(2, 'Yetkili adı en az 2 karakter olmalı.')
    .max(120, 'Yetkili adı çok uzun.'),
  email: emailSchema,
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(100, 'Şifre çok uzun.'),
  phone: z.string().trim().max(30, 'Telefon çok uzun.').optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gerekli.').max(100, 'Şifre çok uzun.'),
});

export const homeUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Cenaze evi adı en az 2 karakter olmalı.')
    .max(160, 'Cenaze evi adı çok uzun.')
    .optional(),
  phone: z.string().trim().max(30, 'Telefon çok uzun.').optional(),
});

export const cardCreateSchema = z.object({
  deceasedName: z.string().trim().min(1, 'Merhumun adı gerekli.').max(120, 'Ad çok uzun.'),
  honorific,
  funeralPlace: z.string().trim().min(1, 'Cenaze namazı yeri gerekli.').max(160, 'Yer adı çok uzun.'),
  funeralAddress: optionalString(240, 'Adres çok uzun.'),
  funeralMapUrl: optionalUrl,
  funeralDate: dateString,
  funeralTime: timeString,
  cemeteryName: optionalString(160, 'Mezarlık adı çok uzun.'),
  burialTime: optionalTime,
  condolenceAddress: optionalString(240, 'Taziye adresi çok uzun.'),
  condolenceHours: optionalString(80, 'Taziye saatleri çok uzun.'),
  donationUrl: optionalUrl,
  donationIban: optionalIban,
  note: optionalString(500, 'Not çok uzun.'),
  published: z.boolean().optional(),
});

export const cardUpdateSchema = cardCreateSchema.partial();

export const condolenceCreateSchema = z.object({
  name: z.string().trim().min(1, 'Adınız gerekli.').max(80, 'Ad çok uzun.'),
  message: z
    .string()
    .trim()
    .min(1, 'Mesaj gerekli.')
    .max(500, 'Mesaj en fazla 500 karakter olabilir.'),
  website: z.string().max(200).optional(),
});

export const moderationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Geçerli bir durum seçin.' }),
  }),
});

export const checkoutSchema = z.object({
  plan: z.enum(['SINGLE', 'MONTHLY'], {
    errorMap: () => ({ message: 'Geçerli bir paket seçin.' }),
  }),
});

export const adminHomeUpdateSchema = z.object({
  plan: z.enum(['TRIAL', 'SINGLE', 'MONTHLY']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

export const adminCardUpdateSchema = z.object({
  published: z.boolean(),
});
