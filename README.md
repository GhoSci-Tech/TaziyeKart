# TaziyeKart

Cenaze evleri için beyaz etiket dijital taziye kartı. Aileye tek bir saygın link verir: cenaze namazı yeri/saati, defin, taziye adresi, yol tarifi, takvim, QR'lı yazdırılabilir kart ve onaylı taziye defteri.

**Aileler ödemez; cenaze evi öder.**

- Tek Kart: 350 TL (tek seferlik)
- Cenaze Evi: 1.500 TL/ay (sınırsız kart, kendi markası)

## Durum

Faz 0-1: dokümanlar, workspace iskeleti, Prisma şeması, seed, auth iskeleti ve placeholder sayfalar.

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

Gerçek üründe bu değerleri değiştir. Demo giriş butonları yalnızca `DEMO_MODE=true` iken çalışır.

## Komutlar

```powershell
npm run dev          # api :3002 + web :3000
npm run typecheck
npm run build
npm run test         # API testleri (Faz 2+)
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
  src/lib/           prisma, auth, errors, slug
  src/routes/        health, auth (Faz 2: panel/public/admin)
web/                 Next.js 15 App Router + Tailwind
  src/app/           sales, auth, panel, admin, public card (Faz 2+)
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

Bu bölüm Faz 7/10'da gerçek müdahalelerle doldurulacak. Şimdilik kayıt:

- B2B modeli (aile ücretsiz, cenaze evi öder) ürün sahibi tarafından seçildi.
- İsim “CenazeKart” yerine “TaziyeKart” olarak belirlendi.
- Süperadmin, tam auth ve taziye defteri kapsama alındı; 60 dakika sınırı kaldırıldı.
- Teknoloji hattı Next.js 15 + Express 4 + Prisma 6 + SQLite olarak sabitlendi.

## Lisans / not

Yarışma demosu. Gerçek ödeme alınmaz. Public kartlarda gerçek kişisel veri kullanılmamalıdır.
