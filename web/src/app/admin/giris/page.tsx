import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function AdminLoginPage() {
  return (
    <PageShell
      eyebrow="Superadmin"
      title="Yönetim girişi"
      description="Superadmin girişi Faz 8'de bağlanacak. Seed edilen admin hesabı ve demo girişi hazır olacak."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/admin" className={cn(buttonVariants({ variant: 'outline' }))}>
          Admin paneli
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Ana sayfa
        </Link>
      </div>
    </PageShell>
  );
}
