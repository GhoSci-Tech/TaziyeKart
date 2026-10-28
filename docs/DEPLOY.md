# TaziyeKart — Deploy

> Bu proje Next.js web + Express API + SQLite'tır. GitHub Pages/Surge gibi statik hostlarda çalışmaz; API ve kalıcı SQLite dosyası gerekir. Yarışma/jüri demosu için local çalıştırma yeterlidir.

## 1. Local (jüri için önerilen)

```powershell
npm install
npm run db:setup
npm run dev
```

- Web: `http://localhost:3000`
- API health: `http://localhost:3000/api/health` (Next rewrite üzerinden)
- Demo giriş: `/giris` → **Demo cenaze eviyle gir**
- Admin: `/admin/giris` → **Demo admin olarak gir**

Durdurmak için `Ctrl+C`. Veriyi sıfırlamak için `npm run db:reset` (yıkıcıdır).

## 2. Tek sunucuda production build

Node.js 20+ ve npm gerekir. SQLite tek dosyadır; sunucuda kalıcı disk yeterlidir.

```bash
git clone https://github.com/GhoSci-Tech/TaziyeKart.git
cd TaziyeKart

# Build ve seed için dev bağımlılıkları da kur
npm ci --include=dev

cp api/.env.example api/.env
cp web/.env.local.example web/.env.local
# Değerleri düzenle; aşağıdaki env matrisine bak

npm run build
npm run db:setup
npm start
```

`npm start`, API'yi `:3002`, web'i `:3000` üzerinde başlatır. Dışarıya yalnızca `:3000` açılmalı; `:3002` internal kalmalı.

### Env matrisi

`api/.env`:

```dotenv
DATABASE_URL="file:/var/lib/taziyekart/taziyekart.db"
PORT=3002
NODE_ENV=production
WEB_ORIGIN="https://taziyekart.example.com"
JWT_SECRET="en-az-32-karakter-rastgele-bir-deger"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="guclu-bir-admin-parolasi"
ADMIN_NAME="Süper Admin"
DEMO_MODE=false
DEMO_EMAIL="demo@example.com"
DEMO_PASSWORD="guclu-bir-demo-parolasi"
```

`web/.env.local`:

```dotenv
API_URL=http://127.0.0.1:3002
NEXT_PUBLIC_SITE_URL=https://taziyekart.example.com
```

- `API_URL` build sırasında Next rewrite hedefi olarak okunur; değiştirince `npm run build` tekrar çalışmalı.
- `NEXT_PUBLIC_SITE_URL` public link, OG ve QR için kullanılır; sonda `/` olmamalı.
- `WEB_ORIGIN` API'nin origin guard'ıdır; web'in public URL'siyle birebir aynı olmalı.
- `DEMO_MODE=false` tek tık demo girişini kapatır. Seed'deki demo kullanıcı silinmiyorsa `DEMO_PASSWORD` mutlaka güçlü olmalı; normal `/giris` bu kullanıcıyla açılabilir.
- `NODE_ENV=production` cookie'yi `Secure` yapar; site HTTPS olmalıdır.

### Nginx + HTTPS (önerilen)

```nginx
server {
    listen 443 ssl http2;
    server_name taziyekart.example.com;

    ssl_certificate     /etc/letsencrypt/live/taziyekart.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/taziyekart.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

- Sadece Nginx'i dışarı aç; `3000` ve `3002` portlarını firewall ile kapat.
- `/var/lib/taziyekart` dizinini yalnızca servis kullanıcısı okuyabilsin.
- `api/.env` ve `web/.env.local` dosyalarını repo'ya ekleme; izinlerini `600` yap.

### systemd (opsiyonel)

```ini
[Unit]
Description=TaziyeKart
After=network.target

[Service]
Type=simple
User=taziyekart
WorkingDirectory=/opt/TaziyeKart
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`systemctl enable --now taziyekart` sonrası log: `journalctl -u taziyekart -f`.

### SQLite backup

```bash
sqlite3 /var/lib/taziyekart/taziyekart.db ".backup '/var/backups/taziyekart-$(date +%F-%H%M).db'"
```

Backup'ı mümkünse günde bir cron'a ekle; backup dosyalarını da yedekle. `dev.db` veya `test.db` dosyalarını commit etme.

## 3. Vercel (web) + Render (API) — opsiyonel

SQLite kalıcı disk istediği için Render'da **persistent disk** gerekir. Render'ın ücretsiz web servisinde kalıcı disk yoktur; demo dışında kullanma.

1. Render'da `api` klasörünü root seçen bir Web Service oluştur.
   - Build: `npm ci --include=dev && npm run db:generate && npm run build`
   - Start: `npm start`
   - Disk: örn. `/var/data` mount et.
   - `DATABASE_URL=file:/var/data/taziyekart.db`
   - `WEB_ORIGIN=https://<vercel-domain>`
   - `NODE_ENV=production`, `DEMO_MODE=false`, güçlü `JWT_SECRET` ve parolalar.
   - İlk deploy sonrası Shell'de: `npm run db:setup`
2. Vercel'de `web` klasörünü root seç.
   - `API_URL=https://<render-api-domain>`
   - `NEXT_PUBLIC_SITE_URL=https://<vercel-domain>`
   - Build sırasında `API_URL` kullanılacağı için env'i deploy'dan önce ekle.
3. Kontrol: `/api/health` Vercel üzerinden 200; giriş cookie'si first-party; `/k/<slug>` public; `/admin/denetim` audit.

Render tek instance kalmalı; SQLite çoklu instance ile kilitlenir. Persistent disk ücretlidir ve backup'ı ayrıca planlamalısın.

## 4. Deploy sonrası smoke test

1. `/`, `/giris`, `/kayit`, `/admin/giris` açılıyor.
2. Demo/admin giriş; panel ve admin dashboard.
3. Yeni kart → public link → taziye mesajı → panelde onay → public güncelleme.
4. A6 yazdır/QR; aile düzenleme linki; 404.
5. `/api/health` 200; güvenlik başlıkları; `robots.txt`; `noindex`.
6. Başka origin'den POST reddediliyor; audit kaydı oluşuyor.
7. Sunucu restart sonrası kart duruyor (SQLite kalıcı).
8. Production'da `DEMO_MODE=false`; gerçek kişisel veri yok.

## 5. Public production öncesi

- `npm audit --omit=dev` uyarıları için major upgrade planla: Prisma 7, Next 16, zod 4. Upgrade sonrası test/build/E2E tekrar çalışmalı.
- Gerçek ödeme, e-posta/SMS, print-on-demand ve harita API'si kapsam dışı; eklenirse ayrı tasarım gerekir.
- Rate limit in-memory'dir; çok instance/Redis gerekirse ayrıca sertleştir.
- Admin için 2FA, merkezi log, uptime/alert ve düzenli backup ekle.
- HSTS'yi Nginx'te ayarla; uygulama güvenlik başlıkları zaten `web/next.config.ts` içinde.
- Denetim kayıtlarını ve SQLite backup'larını erişim kontrollü tut.
