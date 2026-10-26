import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function CardNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Taziye</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-forest-deep">
          Bu taziye sayfası yayında değil.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Link yanlış olabilir veya aile kartı yayından kaldırmış olabilir.
        </p>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}>
          Ana sayfa
        </Link>
      </div>
    </main>
  );
}
