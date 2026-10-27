# TaziyeKart — Sessiz Test

> Jüri 60 saniye boyunca ürünü kullanır; sen konuşmazsın. Amaç: hiç görmediği bir ürüne ilk kez bakan biri gibi sıfır veriyle açmak, yanlış şeyler yazmak, sayfayı yenilemek.

## Ön koşul

- `npm run dev` çalışıyor; `http://localhost:3000` açık.
- **Demo hesabı boş:** `demo@taziyekart.local` / `Demo123!` panelinde kart yok.
- Pitch kartı ayrı bir hesapta (`pitch@...`) duruyor; jüri hesabını kirletmiyor.
- `api/.env` demo modu açık (`DEMO_MODE=true`).

## Jürinin 60 saniyelik akışı

1. **Satış sayfası** → “Demo panele gir”.
2. **Panel boş durumu** → “Henüz taziye kartı yok” ve “Kart oluştur” CTA’sı görünür.
3. **Yeni taziye kartı** → yalnızca zorunlu alanlarla dene:
   - Ad soyad
   - Cenaze namazı yeri
   - Tarih / saat
   - Kaydet
4. **Kart detayı** → public link ve gizli aile düzenleme linki.
5. **Public linki aç** → yol tarifi, takvim, WhatsApp, yazdır/QR.
6. **Sayfayı yenile** → kart hâlâ orada.
7. **Taziye mesajı bırak** → “aile onayına gönderildi”.
8. **Panel → Taziye Mesajları → Onayla** → public sayfayı yenile → mesaj görünür.
9. **Yazdır / QR** → A6 ön/arka ve QR görünür.
10. **Aile düzenleme linki** → saati değiştir → kaydet → public sayfa güncellenir.

## Hatalı/boş girdi kontrolü

Jüri bilerek yanlış şeyler yazabilir. Beklenen:

- Boş ad veya boş cenaze yeri → alan altında Türkçe uyarı; kayıt oluşmaz.
- Geçersiz tarih/saat → alan uyarısı.
- Geçersiz URL → “http:// veya https:// ile başlayan bir bağlantı girin.”
- Geçersiz IBAN → “TR ile başlamalı ve 24 rakam içermeli.”
- Çok uzun not → “Not çok uzun.”
- API hatası → kullanıcıya anlaşılır mesaj; ürün çökmez.

## Doğrulanan akışlar

Bu akışlar Chrome + Playwright ve API testleriyle doğrulandı:

- Demo giriş → boş dashboard → kart oluşturma → public link → sayfa yenileme.
- Public taziye formu → panelde onay → public sayfada mesaj.
- Aile düzenleme → public güncelleme → aile silme → public 404.
- A6 yazdırma → 2 sayfa → QR data URL → PDF.
- Satış sayfası → 2 ürün görseli → 6 SSS → 4 demo CTA → demo panel.
- C2 kalıcılık: kart oluşturuldu, sunucu kapatılıp açıldı, kart durdu.
- API testleri: `18` test; auth, plan limiti, public serializasyon, moderasyon, validation, superadmin rol/tenant.
- Admin: demo admin girişi → dashboard → cenaze evleri → detay → plan/askıya alma; kartlar ve mesajlar.
- Şifre göster/gizle: giriş, kayıt ve admin girişinde password → text → password.

## S2 kontrolü

- [x] Jüri sıfır veriyle açtığında boş durum anlamlı.
- [x] Demo CTA tek tıkla panele gidiyor.
- [x] Kart oluşturma uçtan uca çalışıyor.
- [x] Public link, yol tarifi, takvim, WhatsApp ve yazdır/QR çalışıyor.
- [x] Taziye mesajı aile onayından sonra görünüyor.
- [x] Hatalı/boş girdi çökmüyor; alan uyarısı gösteriyor.
- [x] Sayfa yenileme ve sunucu kapat-aç veriyi koruyor.
- [x] Sessiz test sırasında anlatım gerekmiyor.

## Bilinen sınırlar (dürüst not)

- **Superadmin paneli** hazır: `/admin/giris` üzerinden demo admin veya seed edilen admin hesabıyla girilir.
- Gerçek ödeme, e-posta/SMS, print-on-demand ve harita API’si kapsam dışı.
- Public kartlar arama motorunda görünmez; link yalnızca paylaşılan kişilerce açılır.
- Demo verisinde gerçek kişi adı kullanılmaz.

## Demo hesabını temiz tutma

Pitch kartını demo hesabında oluşturduysan pitch sonrası sil. Jüriden önce:

```powershell
# istersen tamamen temiz başlangıç
npm run db:reset
```

`db:reset` demo home’u yeniden oluşturur ve kartları siler; pitch kartını da siler. Pitch kartını ayrı hesapta tutuyorsan reset gerekmez.
