import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Superadmin"
      title="Yönetim paneli"
      description="Cenaze evleri, tüm kartlar, taziye mesajları ve plan yönetimi Faz 8'de gelecek."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/giris" className={cn(buttonVariants({ variant: 'outline' }))}>
          Yönetim girişi
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Ana sayfa
        </Link>
      </div>
    </PageShell>
  );
}
