# TaziyeKart — 90 Saniyelik Pitch

> Süre sert: 90 saniye. Mikrofon kapanır. Teknolojiden bahsetmiyoruz. Ton: sakin, saygılı, acele etmeyen.

## Pitch metni (90 saniye)

### 0:00–0:15 · Problem

Bir yakınınızı kaybettiğinizde, acıdan önce organizasyon başlar. Cami nerede? Saat kaçta? Taziye çadırı nerede? Aile yüzlerce mesaja tek tek cevap verir; cenaze evi aynı soruyu kırk kez duyar.

### 0:15–0:35 · Çözüm

TaziyeKart, aileye tek bir saygın link verir. Cenaze evi panelden kartı oluşturur; aileye public link ve gizli düzenleme linki gider. Linkte cenaze namazı yeri ve saati, defin, taziye adresi, yol tarifi, takvim ve onaylı taziye defteri vardır. Aile acısını yaşar; organizasyon tek yerde kalır.

### 0:35–0:45 · Demo (10 saniye)

Ekranda örnek bir kart var. Tek tıkla yol tarifi; QR ile A6 yazdırma. Aile linki paylaşır; herkes aynı güncel bilgiyi görür.

### 0:45–1:05 · Kime, kaça

Hedefim tek şubeli yerel cenaze evleri; ayda 10-20 cenaze kaldıran işletmeler. Aileler her zaman ücretsiz. Cenaze evi ayda 1.500 TL, tek kart 350 TL. Bu, kart başına 75-150 TL.

### 1:05–1:20 · Neden bugün

WhatsApp’ta mesajlar kaybolur; kağıt notlar eskir. TaziyeKart’ta tek link güncel kalır; QR hep aynı sayfaya gider. Reklam yok, arama motorunda görünmez; aileye saygılı bir alan.

### 1:20–1:30 · Kapanış

TaziyeKart: bir link, herkes zamanında. Demo için buradayım.

## Demo hazırlığı

Amaç: jüri **sıfır veriyle** girsin; senin pitch kartın ayrı dursun.

1. **Jüri hesabı boş kalsın.** `demo@taziyekart.local` hesabındaki panelde kart olmasın.
2. **Pitch kartını ayrı aç.** `/kayit` üzerinden ikinci bir cenaze evi hesabı oluştur (örn. `pitch@example.com`, ad: “Örnek Cenaze Evi”). Bu hesapta örnek bir kart oluştur.
3. Public linki ayrı bir sekmede aç. Pitch sırasında ekranı bu sekmeye al.
4. İstersen A6 kartı önceden yazdır; 10 saniyelik demoda elde tut. Jüri fiziksel kartı görsün.
5. Demo sırasında **kart oluşturma**; sadece public kartı göster:
   - İsim ve cenaze saati
   - “Yol tarifi” butonu
   - “Yazdır / QR” ve A6 kart
6. Jüri sessiz testine geçince **hiç konuşma**. `demo@taziyekart.local` ile boş panele girmesini izle.

> Alternatif: pitch kartını demo hesabında oluşturup pitch sonrası silmek risklidir; jüri sessiz testi anında kart görürse “sıfır veri” izlenimi bozulur. Ayrı hesap daha güvenli.

## Teslim tonu ve yasaklar

- Teknoloji adı yok: Next.js, Prisma, SQLite, JWT, OG, SaaS, AI, API.
- “Aile ücretsiz, cenaze evi öder” cümlesi net duyulsun.
- Fiyatı yuvarlama; 1.500 TL/ay ve 350 TL tek kart.
- Aile acısı üzerinden şaka, abartı veya baskı yok.
- 90 saniyeyi aşarsan özellik listesini kes; fiyatı ve hedef kitleyi asla kesme.
- Son cümleden sonra dur; “bir şey daha ekleyeyim” deme.

## Olası sorular ve kısa cevaplar

**“Bu ürünü kime, kaça satarsın?”**
Tek şubeli yerel cenaze evlerine ayda 1.500 TL. Tek kart 350 TL. Aileler her zaman ücretsiz. Bir cenaze evi ayda 10-20 cenaze kaldırıyorsa kart başına 75-150 TL’ye gelir; bir yeni müşteri veya tavsiye kendini amorti eder.

**“Aile gerçekten ücretsiz mi?”**
Evet. Gelir modeli cenaze evi aboneliği. Aile hesap açmaz, ödeme yapmaz; sadece kendine verilen linki paylaşır.

**“WhatsApp’tan farkı ne?”**
WhatsApp’ta mesaj kaybolur, herkes farklı kopyayı görür. Burada tek güncel link var: yol tarifi, takvim, QR ve onaylı taziye defteri aynı yerde.

**“Veriler güvende mi?”**
Public kartlar arama motorlarında listelenmez; link yalnızca paylaşılan kişilerce açılır. Reklam ve analitik yok. Aile kartı kaldırabilir veya silebilir.

**“Neden 1.500 TL?”**
Ayda 10-20 cenaze için kart başına 75-150 TL. Bir yanlış organizasyon veya kaçırılan cenaze, bu bedelin çok üstünde. Ayrıca aileye “biz sizin için düşündük” dedirtiyor.

**“Ajana hangi noktada müdahale ettin?”**
Fikri ve iş modelini ben kurdum: aile ücretsiz, cenaze evi öder. Ajanın jenerik CRM/randevu önerilerini reddettim; taziye defterini aile onayına çevirdim; plan limiti ve auth hatalarını testlerle düzelttim; satış sayfasındaki teknoloji dilini attım.

**“Neden siz?”**
Çünkü ürünün odağı cenaze evi: aileye ücretsiz, işletmeye marka ve operasyon kolaylığı. Kağıt/WhatsApp’tan QR’lı, güncel ve saygın bir sayfaya geçiş.

## S1 prova kontrolü

- [ ] Kronometreyle 90 saniye; iki tur üst üste.
- [ ] İlk 15 saniyede problem anlaşıldı.
- [ ] “Aile ücretsiz, cenaze evi öder” cümlesi geçti.
- [ ] 1.500 TL/ay ve 350 TL tek kart söylendi.
- [ ] 10 saniyelik demo çalıştı; teknoloji adı geçmedi.
- [ ] Son cümle: “TaziyeKart: bir link, herkes zamanında.”
- [ ] Sessiz testte konuşmadın.

## İlgili dosyalar

- Sessiz test: [`SESSIZ_TEST.md`](SESSIZ_TEST.md)
- Rubrik: [`KABUL.md`](KABUL.md)
- Ürün planı: [`PLAN.md`](PLAN.md)
