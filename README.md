# TaziyeKart

Cenaze evleri için beyaz etiket dijital taziye kartı. Aileye tek bir saygın link verir: cenaze namazı yeri/saati, defin, taziye adresi, yol tarifi, takvim, QR'lı yazdırılabilir kart ve onaylı taziye defteri.

**Aileler ödemez; cenaze evi öder.**

- Tek Kart: 350 TL (tek seferlik)
- Cenaze Evi: 1.500 TL/ay (sınırsız kart, kendi markası)

## Durum

Faz 0-5: dokümanlar, workspace iskeleti, Prisma şeması, seed, gerçek auth, panel/public/edit API'leri, zod doğrulama, plan limitleri, 15 API testi, cenaze evi panel UI, public taziye kartı (OG/WhatsApp, yol tarifi, takvim, taziye defteri, aile düzenleme) ve A6 QR'lı yazdırma. Satış sayfası Faz 6'da.

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

## Siteyi açma

Geliştirme modu:

1. PowerShell aç ve proje klasörüne gir:
   ```powershell
   cd "C:\Users\ENES\Desktop\Çalışma\AI Kursu Ödevler\proje_yarışma_satılabilir"
   ```
2. Başlat:
   ```powershell
   npm run dev
   ```
3. Tarayıcıda **http://localhost:3000** aç.
4. Giriş ekranında **“Demo cenaze eviyle gir”** butonunu kullan veya `demo@taziyekart.local / Demo123!` ile giriş yap.
5. Durdurmak için terminalde `Ctrl+C`.

İlk kurulumda `npm install` ve `npm run db:setup` bir kez çalışır; `npm run dev` zaten `db:setup` adımını içerir.

Production preview (isteğe bağlı):

```powershell
npm run build
npm start
```

### Public kartı deneme

1. Panelde bir taziye kartı oluştur.
2. Kart detayındaki **Public link** satırında **Aç**'a bas.
3. Public URL: `http://localhost:3000/k/<slug>`
4. Aile düzenleme linki: `http://localhost:3000/duzenle/<token>` (yalnızca aileyle paylaş).
5. Public sayfada taziye mesajı bırak → panelde **Taziye Mesajları → Onayla** → public sayfayı yenile.

Public sayfada yol tarifi, Google Takvim, WhatsApp paylaşımı, link kopyalama, yazdırma ve taziye defteri vardır. A6 QR baskı hazır: public kartta **Yazdır / QR** → A6 ön/arka → **Yazdır → PDF olarak kaydet**.

## Demo hesaplar

`api/.env` içindeki değerler:

| Rol | E-posta | Şifre |
|---|---|---|
| Superadmin | `admin@taziyekart.local` | `Admin123!` |
| Cenaze evi | `demo@taziyekart.local` | `Demo123!` |

Gerçek üründe bu değerleri değiştir. Demo giriş API'si yalnızca `DEMO_MODE=true` iken çalışır; giriş formu ve panel hazır.

## Komutlar

```powershell
npm run dev          # api :3002 + web :3000
npm run typecheck
npm run build
npm start            # build sonrası production preview (api + web)
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
  src/app/           sales, auth, panel, public card + family edit + A6 print (Faz 4-5), admin
  src/components/    UI, panel, public card/actions/condolence/print
  src/lib/           api, session, schemas, panel/public/family API, format
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
- Faz 3 panel UI Chrome + Playwright ile uçtan uca test edildi: demo giriş, kart oluşturma, public/edit linkleri, kart düzenleme, taziye mesajı gönderme/onaylama, marka, plan ve silme.
- QA sırasında plan sayfasındaki “Mevcut plan” metni iki yerde geçtiği için test locator'ı çakıştı; ürün değil, test düzeltildi. “Önerilen” rozet kontrastı, IBAN placeholder'ı ve toast konumu UI incelemesinde iyileştirildi.
- Faz 4 public kart + OG + taziye defteri + aile düzenleme Chrome/Playwright ile uçtan uca test edildi: public kart 200, OG image 200 image/png, taziye formu → panel onayı, aile güncellemesi, aile silme ve public 404.
- Public kart sunucu-rendered; `generateMetadata`/`opengraph-image`; `robots.ts` + `noindex`. Aile düzenleme oturum istemez, gizli token ile çalışır.
- C2 kalıcılık ayrıca test edildi: kart oluşturuldu, dev sunucusu kapatılıp yeniden açıldı, kart public API'de duruyordu; ardından silindi.
- Faz 5 A6 ön/arka yazdırma + QR Chrome/Playwright ile test edildi: yazdır sayfası 200, QR data URL üretildi, 2 A6 sheet göründü; public/panel/aile yazdırma linkleri bağlandı. QR, `NEXT_PUBLIC_SITE_URL` üzerinden public karta gider.

## Lisans / not

Yarışma demosu. Gerçek ödeme alınmaz. Public kartlarda gerçek kişisel veri kullanılmamalıdır.
