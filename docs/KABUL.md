# TaziyeKart — Kabul Checklist (22 madde)

> Honest status of the competition rubric. Update this file as phases land. A checked box means it was verified in the running product, not just planned.

## A · Ürün fikri ve problem netliği — 20 puan

- [ ] **U1 (6 p)** Tek cümlede anlaşılan gerçek bir problem var; ürün o problemi çözmek için var.
  - Plan: "Bir yakınını kaybettiğinde aile yüzlerce kez aynı adresi/saati anlatır; TaziyeKart tek saygın linkte toplar." Sales page hero + pitch.
- [ ] **U2 (6 p)** Çözüm problemi gerçekten çözüyor; kullanıcı işini daha az adımda yapıyor.
  - Plan: cenaze evi tek form doldurur; aile tek link paylaşır; ziyaretçi tek tıkla yol tarifi alır. WhatsApp'ta onlarca mesaj yerine bir link.
- [ ] **U3 (4 p)** Hedef kitle somut ve dar.
  - Plan: tek şubeli yerel cenaze evleri; "herkes" değil. Aile son kullanıcı, ödeyen cenaze evi.
- [ ] **U4 (4 p)** "Bugün neden bu ürün" sorusuna bir cümlelik cevap var.
  - Plan: her cenazede tekrar eden telefon/WhatsApp kaosu; mevcut alternatif kağıt/WhatsApp; fark tek güncel link + QR + marka.

## B · Çalışan ürün — sessiz testte ölçülür — 25 puan

- [x] **C1 (10 p)** En az bir akış uçtan uca çalışıyor: girdi → işlem → kalıcı sonuç, arayüzden API'ye kadar.
  - Faz 4 E2E: panel → kart oluştur → public kart → taziye mesajı → onay → public güncelleme.
- [x] **C2 (6 p)** Veri gerçekten kalıcı; yenile, sunucuyu kapat-aç → veri yerinde.
  - Restart testi: kart oluşturuldu, dev sunucusu kapatılıp yeniden açıldı, kart aynı SQLite dosyasında durdu.
- [x] **C3 (4 p)** Sıfır veriyle ilk kullanım anlamlı; boş ekran ilk adıma yönlendiriyor.
  - Panel boş durumu ve demo home kartı yok; dashboard'daki CTA ilk karta yönlendiriyor.
- [x] **C4 (5 p)** Hatalı/boş/saçma girdi ürünü çökertmiyor; anlaşılır uyarı çıkıyor.
  - zod + alan bazlı Türkçe hata; API testlerinde boş/geçersiz tarih-saat/URL/IBAN doğrulandı; formlar alan hatalarını gösteriyor.

## C · Teknik kalite — 20 puan

- [x] **T1 (6 p)** Backend ve frontend ayrı projeler; kökte tek komutla ikisi birlikte kalkıyor.
  - `api/` + `web/` npm workspaces; `npm run dev` → :3002 + :3000; defalarca doğrulandı.
- [x] **T2 (4 p)** API'de girdi doğrulama ve tutarlı hata biçimi var; arayüz hatayı kullanıcıya çeviriyor.
  - zod her API sınırında; `{ error: { code, message, fields? } }`; formlar alan hatalarını gösteriyor.
- [x] **T3 (4 p)** README'de teknoloji seçimleri gerekçeli.
  - README'de Next.js (OG/WhatsApp), Express 4, Prisma 6 + SQLite, JWT cookie, Next rewrite, A6 print ve kuruş kararları gerekçeli.
- [x] **T4 (3 p)** Sırlar koda gömülmemiş; `.env` + `.env.example` + doğru `.gitignore`.
  - `JWT_SECRET`, `ADMIN_*`, `DEMO_*` `.env`'de; `.env.example` güncel; `.env`, `.env.local`, DB ve `node_modules` ignore.
- [x] **T5 (3 p)** Kod okunabilir bölünmüş; 800 satırlık dosya yok.
  - API `lib/routes`, web `app/components/lib`; en büyük form dosyası ~340 satır, tek sorumluluk.

## D · Pazarlama — odak noktası — 20 puan

- [ ] **P1 (6 p)** Satış sayfası akışı: tek cümle değer → problem → çözüm → 3 fayda → net CTA.
  - Plan: hero, problem, 3 adım, faydalar, CTA. Faz 6.
- [ ] **P2 (6 p)** Fiyatlandırma tablosu: en az 2 paket, net fiyat, içerik, biri önerilen.
  - Plan: Tek Kart 350 TL / Cenaze Evi 1.500 TL/ay (önerilen); "Aileler için ücretsiz" bandı. Faz 6.
- [ ] **P3 (4 p)** Güven unsuru: en az 3 gerçek itiraza SSS + ekran görüntüsü/demo.
  - Plan: "Aile gerçekten ücretsiz mi?", "WhatsApp'tan farkı?", "Veriler nerede?", "Ödeme?"; gerçek panel/public ekran görüntüsü. Faz 6-7.
- [ ] **P4 (4 p)** Metin müşteri dilinde; fayda yazıyor, özellik/jargon değil.
  - Plan: "Her cenazede aynı 40 telefonu bitirin", "Aile acısını yaşasın"; teknoloji yok. Faz 6.

## E · Pitch — 90 saniye — 10 puan

- [ ] **S1 (5 p)** 90 saniyede problem, çözüm, hedef kitle, fiyat; süre aşılmıyor.
  - Plan: 0-15 problem, 15-35 iki link/akış, 35-55 ürün+10 sn demo, 55-75 kime/kaça, 75-90 kapanış. Faz 7.
- [ ] **S2 (5 p)** Sessiz test: jüri yardımsız kullanıyor; nereye basacağını anlıyor.
  - Plan: tek tık demo giriş, boş durum CTA, açık etiketler, hata mesajları. Faz 7.

## F · Süreç kanıtı — 5 puan

- [x] **K1 (2 p)** `docs/PLAN.md` (YAPMAYACAKLARIM dahil) ve `AGENTS.md` var.
  - İkisi de Faz 0'da oluşturuldu ve fazlarla birlikte güncel tutuldu.
- [x] **K2 (1 p)** En az 5 anlamlı commit.
  - Faz 0-4 boyunca docs, scaffold, API, test, panel, public kart ve aile düzenleme commit'leri; 9+ anlamlı commit.
- [x] **K3 (2 p)** README: çalıştırma komutları + "ajanı nasıl sürdüm" bölümü.
  - README'de siteyi açma, public kart denemesi, komutlar ve gerçek ajan müdahaleleri (B2B modeli, isim, auth/plan hataları, panel/public QA) var.

## Manual silent test (Faz 7 ve sonrası)

1. `npm run dev`; `http://localhost:3000` açılır.
2. "Demo panele gir" → panel boş durumu görünür.
3. "Yeni taziye kartı" → isim/yer/tarih/saat gir → kaydet.
4. Başarı ekranındaki public linki kopyala → yeni sekmede aç.
5. Public sayfada yol tarifi, takvim, WhatsApp, yazdır butonlarını dene.
6. Sayfayı yenile → kart duruyor.
7. Edit linkini aç → saati değiştir → kaydet → public sayfayı yenile → güncel.
8. Boş isim, geçersiz tarih, bozuk URL, çok uzun not dene → anlaşılır hata.
9. Public sayfada taziye mesajı bırak → "onaya gönderildi" → panelde onayla → public sayfada görünür.
10. Superadmin demo girişi → cenaze evini, kartı, mesajı gör → planı değiştir.
11. API'yi kapat-aç → kart hâlâ duruyor.
12. Karta "Yazdır / QR" → A6 ön/arka ve QR görünür. (Faz 5 E2E doğrulandı.)

## Notlar

- C3 için varsayılan DB'de kart seed edilmez. Demo home ve kullanıcı seed edilir; panel boş durumla açılır.
- Demo verilerinde gerçek kişi adı kullanılmaz.
- Gerçek ödeme, e-posta/SMS, print-on-demand ve harita API'si kapsam dışı; README'de production roadmap olarak durur.
