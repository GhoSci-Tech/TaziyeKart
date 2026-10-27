import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarPlus,
  Check,
  EyeOff,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { DemoButton } from '@/components/marketing/demo-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'TaziyeKart — Cenaze evleri için dijital taziye kartı',
  description:
    'Aileye tek bir saygın link: cenaze namazı yeri/saati, defin, taziye adresi, yol tarifi, takvim, QR’lı yazdırılabilir kart ve onaylı taziye defteri. Aileler ücretsiz; cenaze evi ayda 1.500 TL.',
  openGraph: {
    title: 'TaziyeKart — Cenaze evleri için dijital taziye kartı',
    description:
      'Aileye tek bir saygın link. Aileler ücretsiz; cenaze evleri için panel, taziye defteri ve A6 QR baskı.',
    type: 'website',
    images: [
      {
        url: '/ekran-public.png',
        width: 896,
        height: 941,
        alt: 'TaziyeKart örnek public kart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaziyeKart — Cenaze evleri için dijital taziye kartı',
    description:
      'Aileye tek bir saygın link. Aileler ücretsiz; cenaze evleri için panel, taziye defteri ve A6 QR baskı.',
    images: ['/ekran-public.png'],
  },
};

const BENEFITS = [
  {
    icon: Phone,
    title: 'Telefon trafiği biter',
    text: 'Aynı adresi, aynı saati onlarca kez anlatmayın. Aileye tek güncel link verin; herkes kendi yolunu bulsun.',
  },
  {
    icon: HeartHandshake,
    title: 'Markanız her kartta',
    text: 'Kendi cenaze evi adınız ve telefonunuz her kartta görünür. Aileye güven veren, profesyonel bir hizmet sunun.',
  },
  {
    icon: ShieldCheck,
    title: 'Her cenazede aynı saygın deneyim',
    text: 'Reklamsız, sade, aile odaklı bir sayfa. Yaşlı akrabalar için büyük butonlar; aile için güvenli bir alan.',
  },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'WhatsApp önizlemesi',
    text: 'Link paylaşıldığında merhumun adı ve cenaze saati görünür. Aile linki gönderirken açıklama yazmak zorunda kalmaz.',
  },
  {
    icon: MapPin,
    title: 'Yol tarifi + takvim',
    text: 'Cami, taziye çadırı ve mezarlık için tek tıkla yol tarifi; cenaze namazı için Google Takvim’e ekleme.',
  },
  {
    icon: MessageSquare,
    title: 'Onaylı taziye defteri',
    text: 'Ziyaretçiler başsağlığı bırakır; mesajlar aile onayından sonra yayınlanır. Sade, saygın bir dijital taziye defteri.',
  },
  {
    icon: QrCode,
    title: 'A6 QR’lı baskı',
    text: 'Ön/arka A6 kartı PDF olarak kaydedin; matbaaya götürün. QR kodu her zaman güncel public karta gider.',
  },
  {
    icon: ShieldCheck,
    title: 'Gizli aile linki',
    text: 'Aile hesap açmadan kartı düzenler, mesajları onaylar. Düzenleme linki yalnızca aileyle paylaşılır.',
  },
  {
    icon: EyeOff,
    title: 'Reklamsız ve görünmez',
    text: 'Public kartlar arama motorlarında listelenmez; reklam, analitik veya veri satışı yoktur.',
  },
];

const PLANS: Array<{
  name: string;
  price: string;
  suffix: string;
  description: string;
  features: string[];
  recommended?: boolean;
  demo?: boolean;
  cta: string;
  href?: string;
}> = [
  {
    name: 'Tek Kart',
    price: '350 TL',
    suffix: 'tek seferlik',
    description: 'Tek bir cenaze için hızlı ve profesyonel bir taziye kartı.',
    features: [
      '1 taziye kartı',
      'Public + gizli aile düzenleme linki',
      'Taziye defteri ve moderasyon',
      'A6 QR’lı yazdırma',
    ],
    cta: 'Cenaze evi kaydı',
    href: '/kayit',
  },
  {
    name: 'Cenaze Evi',
    price: '1.500 TL',
    suffix: '/ay',
    description: 'Sınırsız kartla her cenazede aynı kaliteli hizmeti sunun.',
    features: [
      'Sınırsız taziye kartı',
      'Kendi adınız ve telefonunuz',
      'Taziye defteri moderasyonu',
      'A6 QR’lı yazdırma',
      'Panel ve öncelikli destek',
    ],
    recommended: true,
    demo: true,
    cta: 'Demo panele gir',
  },
];

const FAQ = [
  {
    question: 'Aileler gerçekten ücretsiz mi?',
    answer:
      'Evet. Gelir modeli cenaze evleri için aylık paket. Aile hesap açmaz, ödeme yapmaz; yalnızca kendine verilen linki paylaşır.',
  },
  {
    question: 'WhatsApp’tan farkı ne?',
    answer:
      'WhatsApp’ta mesajlar kaybolur ve herkes farklı bir kopyayı görür. TaziyeKart’ta tek bir güncel link vardır: yol tarifi, takvim, QR ve onaylı taziye defteri aynı yerde durur.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer:
      'Public kartlar arama motorlarında listelenmez; link yalnızca sizin paylaştığınız kişilerce açılır. Reklam ve analitik yoktur. Aile istediği zaman kartı yayından kaldırabilir veya silebilir.',
  },
  {
    question: 'Kartı nasıl yazdırırım?',
    answer:
      'Public kartta “Yazdır / QR” bağlantısına basın. A6 ön/arka görünümü açılır; tarayıcıda “Yazdır → PDF olarak kaydet” seçip matbaaya götürebilirsiniz.',
  },
  {
    question: 'Kaç kart ve kaç kullanıcı?',
    answer:
      'Tek Kart paketi 1 kart içerir. Cenaze Evi paketi sınırsız kart sunar. İlk sürüm tek kullanıcı içindir; ekip hesapları yol haritasında.',
  },
  {
    question: 'İptal edebilir miyim?',
    answer:
      'Aylık paket istediğiniz zaman iptal edilebilir. Bu yarışma demosunda gerçek ödeme alınmaz; plan değişiklikleri demo checkout ile yapılır.',
  },
];

const STEPS = [
  ['01', 'Kartı oluştur', 'Cenaze evi panelinden merhumun bilgilerini ve cenaze ayrıntılarını girin.'],
  ['02', 'Linki ver', 'Public linki aileye iletin; gizli düzenleme linki ailede kalsın.'],
  ['03', 'Herkes zamanında gelsin', 'Yol tarifi, takvim, QR ve onaylı taziye defteri tek sayfada.'],
];

function MarketingSampleCard() {
  return (
    <article className="relative rounded-[30px] border border-line bg-paper p-8 shadow-card">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        <span>Taziye</span>
        <span className="normal-case tracking-normal text-muted">Örnek kart</span>
      </div>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Merhum</p>
        <h2 className="mt-2 font-serif text-5xl leading-none text-forest-deep">Ahmet Yılmaz</h2>
      </div>
      <div className="my-7 h-px bg-gold/50" />
      <dl className="space-y-5 text-sm">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <dt className="font-semibold text-ink">Cenaze namazı</dt>
            <dd className="mt-1 text-muted">Merkez Camii · 1 Kasım 2026, 14:30</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <dt className="font-semibold text-ink">Taziye</dt>
            <dd className="mt-1 text-muted">Cumhuriyet Mah. Taziye Çadırı · 12:00–22:00</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Printer className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <dt className="font-semibold text-ink">Yazdırılabilir kart</dt>
            <dd className="mt-1 text-muted">QR ile herkes zamanında gelsin</dd>
          </div>
        </div>
      </dl>
      <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-cream px-4 py-3">
        <span className="text-xs text-muted">Yol tarifi · Takvim · WhatsApp</span>
        <ShieldCheck className="h-4 w-4 text-forest" />
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          TaziyeKart
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted lg:flex">
          <a href="#problem" className="hover:text-ink">Problem</a>
          <a href="#nasil" className="hover:text-ink">Nasıl çalışır</a>
          <a href="#urun" className="hover:text-ink">Ürün</a>
          <a href="#fiyat" className="hover:text-ink">Fiyatlar</a>
          <a href="#sss" className="hover:text-ink">SSS</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/giris" className="hidden text-sm font-medium text-ink hover:text-forest sm:block">
            Giriş
          </Link>
          <DemoButton variant="default" size="sm" />
        </div>
      </header>

      <section className="paper-grain relative">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Yerel cenaze evleri için
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.02] tracking-tight text-forest-deep md:text-7xl">
              Her cenazede aynı 40 telefonu bitirin.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              TaziyeKart, aileye tek bir saygın link verir: cenaze namazı yeri ve saati, defin,
              taziye adresi, yol tarifi, takvim ve QR&apos;lı yazdırılabilir kart. Aile acısını
              yaşasın; organizasyonu siz taşıyın.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DemoButton variant="gold" size="lg" />
              <Link href="/kayit" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                Cenaze evi kaydı
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              <span className="font-semibold text-forest">Aileler için ücretsiz.</span> Cenaze evi
              ayda 1.500 TL. Demo; kredi kartı istenmez.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[36px] bg-forest/5 blur-2xl" />
            <MarketingSampleCard />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-sm text-muted">
          <span>Aileler için ücretsiz</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>Reklamsız</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>Arama motorunda görünmez</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>A6 QR&apos;lı yazdırma</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span>Aile düzenleme linki</span>
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Problem</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep md:text-5xl">
              Aile acısını yaşamak yerine adres tarif ediyor.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              İlk saatlerde onlarca telefon gelir: “Cami nerede? Saat kaçta? Taziye çadırı nerede?”
              Mesajlar kaybolur, yaşlı akrabalar adresi bulamaz. Cenaze evi aynı cevabı tekrar tekrar
              verir.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Bugün</p>
              <h3 className="mt-3 font-serif text-2xl text-forest-deep">Dağınık WhatsApp trafiği</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                <li>Kaybolan mesajlar ve farklı kopyalar</li>
                <li>Tek tek adres ve saat tarifi</li>
                <li>Kağıt notlar, kaybolan numaralar</li>
                <li>Yaşlılar için anlaşılmayan konumlar</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-forest bg-forest p-6 text-cream">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">TaziyeKart</p>
              <h3 className="mt-3 font-serif text-2xl">Tek güncel link</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-cream/80">
                <li>Yol tarifi ve takvim aynı sayfada</li>
                <li>QR’lı yazdırılabilir A6 kart</li>
                <li>Onaylı, reklamsız taziye defteri</li>
                <li>Aileye özel gizli düzenleme linki</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="nasil" className="border-y border-line bg-paper/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Nasıl çalışır</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
              Bir form. İki link. Herkes zamanında.
            </h2>
            <p className="mt-4 text-muted">
              Aileye hesap açtırmıyoruz. Cenaze evi kartı oluşturur, aileye public ve gizli
              düzenleme linkini verir.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(([step, title, text]) => (
              <li key={step} className="rounded-2xl border border-line bg-paper p-6">
                <span className="text-xs font-semibold tracking-[0.18em] text-gold">{step}</span>
                <h3 className="mt-4 font-serif text-2xl text-forest-deep">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Cenaze evi için</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
            Daha az telefon. Daha çok güven.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="rounded-2xl border border-line bg-paper p-6">
                <span className="inline-flex rounded-xl bg-cream p-2 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-forest-deep">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="urun" className="border-y border-line bg-paper/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Ürün</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
              Aileye giden şey sade ve saygın olmalı.
            </h2>
            <p className="mt-4 text-muted">
              Public kart aileye tek link; panel size kontrol. İkisi de aynı veriyi kullanır.
              Görsellerdeki isim ve bilgiler örnektir.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <figure>
              <img
                src="/ekran-public.png"
                alt="Örnek public taziye kartı ekranı"
                className="mx-auto w-full max-w-[360px] rounded-[24px] border border-line shadow-card"
              />
              <figcaption className="mt-3 text-center text-xs text-muted">
                Public kart · aile ve ziyaretçiler için
              </figcaption>
            </figure>
            <figure>
              <img
                src="/ekran-panel.png"
                alt="Cenaze evi paneli ekran görüntüsü"
                className="w-full rounded-2xl border border-line shadow-card"
              />
              <figcaption className="mt-3 text-center text-xs text-muted">
                Cenaze evi paneli · kartlar, mesajlar ve plan
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Özellikler</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
            Cenaze evinin ihtiyacı olan her şey.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-line bg-paper p-6">
                <Icon className="h-5 w-5 text-gold" />
                <h3 className="mt-4 font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-forest text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <Users className="h-6 w-6 text-gold" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">Kimler için</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              Tek şubeli yerel cenaze evleri.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-cream/80">
            <p>
              Ayda 10-20 cenaze kaldıran, aileye daha iyi bir hizmet sunmak isteyen ve kendi markasını
              öne çıkarmak isteyen işletmeler için.
            </p>
            <p>
              Aileler her zaman ücretsiz kullanır. Public kartta reklam, sayaç veya üçüncü taraf
              izleyici yoktur; kartı yalnızca sizin paylaştığınız kişiler açar.
            </p>
            <p className="font-semibold text-cream">
              Zincir kurumlar, çok şubeli yapılar ve ekip hesapları ilk sürümün kapsamı dışında.
            </p>
          </div>
        </div>
      </section>

      <section id="fiyat" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Fiyatlar</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
            Aile ödemez. Cenaze evi öder.
          </h2>
          <p className="mt-4 text-muted">
            Tek kartla deneyin veya aylık paketle sınırsız karta geçin. Ödeme akışı demo; gerçek
            tahsilat yapılmaz.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-[#6c5129]">
          <strong>Aileler için her zaman 0 TL.</strong> Cenaze evi paketi aileye değil, hizmeti
          sunan işletmeye aittir.
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border p-7',
                plan.recommended ? 'border-forest bg-forest text-cream' : 'border-line bg-paper',
              )}
            >
              {plan.recommended ? (
                <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-forest-deep">
                  Önerilen
                </span>
              ) : null}
              <h3 className={cn('font-serif text-2xl', plan.recommended ? 'text-cream' : 'text-forest-deep')}>
                {plan.name}
              </h3>
              <p className={cn('mt-2 text-4xl font-semibold tabular-nums', plan.recommended ? 'text-cream' : 'text-ink')}>
                {plan.price}
                <span className={cn('text-base font-normal', plan.recommended ? 'text-cream/70' : 'text-muted')}>
                  {plan.suffix}
                </span>
              </p>
              <p className={cn('mt-2 text-sm', plan.recommended ? 'text-cream/70' : 'text-muted')}>
                {plan.description}
              </p>
              <ul className={cn('mt-5 space-y-2 text-sm', plan.recommended ? 'text-cream/80' : 'text-muted')}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className={cn('mt-0.5 h-4 w-4 shrink-0', plan.recommended ? 'text-gold' : 'text-forest')} />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.demo ? (
                <DemoButton className="mt-7 w-full" variant="gold" label="Demo panele gir" />
              ) : (
                <Link
                  href={plan.href ?? '/kayit'}
                  className={cn(buttonVariants({ variant: 'outline' }), 'mt-7 w-full')}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Demo checkout: kart bilgisi istenmez, gerçek tahsilat yapılmaz. Plan değişikliği panelden
          anında uygulanır.
        </p>
      </section>

      <section id="sss" className="border-y border-line bg-paper/60">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">SSS</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
              Aklınızdaki gerçek sorular.
            </h2>
          </div>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details key={item.question} className="rounded-xl border border-line bg-paper p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                  {item.question}
                  <span className="text-lg font-normal text-gold">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[28px] bg-forest px-6 py-14 text-center text-cream md:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Bir cenazede fark yaratın</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
            Aile acısını yaşasın; organizasyonu siz taşıyın.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/75">
            Aileler için ücretsiz. Cenaze evi için tek panel, tek link, tek standart.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <DemoButton variant="gold" size="lg" />
            <Link
              href="/kayit"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-cream/30 text-cream hover:bg-cream/10',
              )}
            >
              Cenaze evi kaydı
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-base font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              TaziyeKart
            </Link>
            <p className="mt-2 text-xs">Bir link, herkes zamanında.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs">
            <Link href="/giris" className="hover:text-ink">Giriş</Link>
            <Link href="/kayit" className="hover:text-ink">Cenaze evi kaydı</Link>
            <a href="#fiyat" className="hover:text-ink">Fiyatlar</a>
            <a href="#sss" className="hover:text-ink">SSS</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} TaziyeKart · Yarışma demosu, gerçek ödeme alınmaz.</p>
        </div>
      </footer>
    </main>
  );
}
