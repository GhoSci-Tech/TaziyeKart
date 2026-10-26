import Link from 'next/link';
import { ArrowRight, HeartHandshake, MapPin, Printer, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          TaziyeKart
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#nasil" className="hover:text-ink">Nasıl çalışır</a>
          <a href="#fiyat" className="hover:text-ink">Fiyatlar</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/giris" className="text-sm font-medium text-ink hover:text-forest">Giriş</Link>
          <Link href="/panel" className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}>
            Demo panele gir
          </Link>
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
              <Link href="/panel" className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}>
                Demo panele gir
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/kayit" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                Cenaze evi kaydı
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              <span className="font-semibold text-forest">Aileler için ücretsiz.</span> Cenaze evi
              ayda 1.500 TL.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[36px] bg-forest/5 blur-2xl" />
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
                    <dd className="mt-1 text-muted">Merkez Camii · 26 Ekim 2026, 14:30</dd>
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
        </div>
      </section>

      <section id="nasil" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Nasıl çalışır</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-forest-deep">
              Bir form. İki link. Herkes zamanında.
            </h2>
            <p className="mt-4 text-muted">
              Aileye hesap açtırmıyoruz. Cenaze evi kartı oluşturur, aileye public ve gizli
              düzenleme linkini verir.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Kartı oluştur', 'Cenaze evi panelinden merhumun bilgilerini gir.'],
              ['02', 'Linki ver', 'Public linki aileye ilet; düzenleme linki ailede kalsın.'],
              ['03', 'Herkes gelsin', 'Yol tarifi, takvim, QR ve onaylı taziye defteri.'],
            ].map(([step, title, text]) => (
              <li key={step} className="rounded-2xl border border-line bg-paper p-5">
                <span className="text-xs font-semibold tracking-[0.18em] text-gold">{step}</span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fiyat" className="border-t border-line bg-paper/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
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
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper p-7">
              <h3 className="font-serif text-2xl text-forest-deep">Tek Kart</h3>
              <p className="mt-2 text-4xl font-semibold tabular-nums text-ink">350 TL</p>
              <p className="mt-1 text-sm text-muted">tek seferlik</p>
              <ul className="mt-6 space-y-2 text-sm text-muted">
                <li>1 taziye kartı</li>
                <li>Public + gizli düzenleme linki</li>
                <li>Taziye defteri ve A6 QR baskı</li>
              </ul>
              <Link href="/kayit" className={cn(buttonVariants({ variant: 'outline' }), 'mt-7 w-full')}>
                Tek kartla başla
              </Link>
            </div>
            <div className="relative rounded-2xl border border-forest bg-forest p-7 text-cream">
              <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-forest-deep">
                Önerilen
              </span>
              <h3 className="font-serif text-2xl">Cenaze Evi</h3>
              <p className="mt-2 text-4xl font-semibold tabular-nums">
                1.500 TL<span className="text-base font-normal text-cream/70">/ay</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-cream/80">
                <li>Sınırsız taziye kartı</li>
                <li>Kendi adınız ve telefonunuz</li>
                <li>Taziye defteri moderasyonu</li>
                <li>A6 QR&apos;lı yazdırma</li>
              </ul>
              <Link href="/giris" className={cn(buttonVariants({ variant: 'gold' }), 'mt-7 w-full')}>
                Demo panele gir
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TaziyeKart · Bir link, herkes zamanında.</p>
        <p>Yarışma demosu · Gerçek ödeme alınmaz.</p>
      </footer>
    </main>
  );
}
