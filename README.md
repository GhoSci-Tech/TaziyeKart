# TaziyeKart

Cenaze evleri için beyaz etiket dijital taziye kartı. Aileye tek bir saygın link verir: cenaze namazı yeri/saati, defin, taziye adresi, yol tarifi, takvim, QR'lı yazdırılabilir kart ve onaylı taziye defteri.

**Aileler ödemez; cenaze evi öder.**

- Tek Kart: 350 TL (tek seferlik)
- Cenaze Evi: 1.500 TL/ay (sınırsız kart, kendi markası)

## Durum

Faz 0-2: dokümanlar, workspace iskeleti, Prisma şeması, seed, gerçek auth (register/login/logout/me/demo), panel/public/edit API'leri, zod doğrulama, plan limitleri ve 15 test. Panel/public UI Faz 3-4'te.

## Hızlı başlangıç

```powershell
npm install
npm run db:setup
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3002/api/health
- Proxy: http://localhost:3000/api/health

> `npm run dev` her başlangıçta `db:setup` çalıştırır. Seed idempotenttir; admin ve demo cenaze evini oluşturur, kart oluşturmaz.

## Demo hesaplar

`api/.env` içindeki değerler:

| Rol | E-posta | Şifre |
|---|---|---|
| Superadmin | `admin@taziyekart.local` | `Admin123!` |
| Cenaze evi | `demo@taziyekart.local` | `Demo123!` |

Gerçek üründe bu değerleri değiştir. Demo giriş API'si yalnızca `DEMO_MODE=true` iken çalışır; giriş formu Faz 3'te bağlanacak.

## Komutlar

```powershell
npm run dev          # api :3002 + web :3000
npm run typecheck
npm run build
npm run test         # API testleri (15 test; test DB'sini sıfırlar ve seed eder)
npm run db:generate
npm run db:setup
npm run db:seed
npm run db:reset     # yıkıcı: SQLite'ı sıfırlar ve yeniden seed eder
```

## Yapı

```text
api/                 Express 4 + Prisma 6 + SQLite + zod
  prisma/schema.prisma
  prisma/seed.ts
  src/app.ts         test edilebilir Express app
  src/index.ts       :3002 listener
  src/lib/           prisma, auth, errors, slug, serializers, plans, rateLimit
  src/routes/        health, auth, panel, public, edit (admin Faz 8)
web/                 Next.js 15 App Router + Tailwind
  src/app/           sales, auth, panel, admin, public card (UI Faz 3+)
  src/components/    UI
  src/lib/           cn, api helpers
docs/                PLAN, API, KABUL, DESIGN
```

## Dokümanlar

- [`docs/PLAN.md`](docs/PLAN.md) — ürün, roller, akışlar, şema, fazlar, kapsam dışı
- [`docs/API.md`](docs/API.md) — endpoint sözleşmeleri
- [`docs/KABUL.md`](docs/KABUL.md) — 22 maddelik rubrik kontrol listesi
- [`docs/DESIGN.md`](docs/DESIGN.md) — palet, tipografi, sayfa yönleri

## Teknoloji gerekçeleri

- **Next.js 15 App Router:** public kartın sunucu-rendered olması ve `generateMetadata`/OG image ile WhatsApp önizlemesinde merhumun adı ve saatin görünmesi için.
- **Express 4 + zod:** en yaygın, en çok örneği olan API hattı; doğrulama ve hata zarfı hızlı kurulur.
- **Prisma 6 + SQLite:** Docker/sunucu yok; tek dosya, gerçek kalıcı veri.
- **JWT HTTP-only cookie:** ayrı auth servisi yok; roller ve tenant izolasyonu API'de.
- **Next.js rewrite `/api` → Express:** cookie first-party kalır, CORS gerekmez.
- **A6 browser print:** gerçek ödeme/print-on-demand olmadan matbaaya götürülebilir PDF.
- **Para kuruş (Int):** kayan nokta hatası yok.

## Kapsam dışı

Gerçek ödeme, e-posta/SMS, print-on-demand, harita API'si, mobil uygulama, çoklu dil, fotoğraf yükleme, analytics, AI özellikleri. Ayrıntı: `docs/PLAN.md` → YAPMAYACAKLARIM.

## Ajanı nasıl sürdüm

Bu bölüm Faz 7/10'da son haline gelecek. Şimdilik kayıt:

- B2B modeli (aile ücretsiz, cenaze evi öder) ürün sahibi tarafından seçildi.
- İsim “CenazeKart” yerine “TaziyeKart” olarak belirlendi.
- Süperadmin, tam auth ve taziye defteri kapsama alındı; 60 dakika sınırı kaldırıldı.
- Teknoloji hattı Next.js 15 + Express 4 + Prisma 6 + SQLite olarak sabitlendi.
- Faz 2'de testler iki kritik hatayı yakaladı: panel router'da önce `requireAuth` eksikti; plan limit helper'ı `MONTHLY: null` değerini `?? 0` ile 0'a çeviriyordu. İkisi de testlerle düzeltildi.
- Auth/panel/public/edit sözleşmeleri `docs/API.md` ile hizalandı; test DB'si her koşuda reset + seed ediliyor.

## Lisans / not

Yarışma demosu. Gerçek ödeme alınmaz. Public kartlarda gerçek kişisel veri kullanılmamalıdır.
