import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Cenaze evi"
      title="Giriş"
      description="Gerçek giriş Faz 2'de, panel Faz 3'te bağlanacak. Şimdilik iskelet hazır."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/kayit" className={cn(buttonVariants({ variant: 'default' }))}>
          Cenaze evi kaydı
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          Ana sayfa
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">
        Demo giriş: demo@taziyekart.local / Demo123! (Faz 2&apos;de aktif)
      </p>
    </PageShell>
  );
}
