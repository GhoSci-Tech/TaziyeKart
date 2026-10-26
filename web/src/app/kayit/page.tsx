import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function RegisterPage() {
  return (
    <PageShell
      eyebrow="Cenaze evi"
      title="Kayıt"
      description="Kayıt formu Faz 2'de; cenaze evi hesabı, marka bilgisi ve deneme planıyla birlikte gelecek."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/giris" className={cn(buttonVariants({ variant: 'default' }))}>
          Girişe dön
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          Ana sayfa
        </Link>
      </div>
    </PageShell>
  );
}
