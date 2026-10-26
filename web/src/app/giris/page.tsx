import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Cenaze evi"
      title="Giriş"
      description="Auth API'si hazır. Giriş formu Faz 3'te panele bağlanacak."
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
        Demo giriş: demo@taziyekart.local / Demo123! (API hazır; form Faz 3&apos;te)
      </p>
    </PageShell>
  );
}
