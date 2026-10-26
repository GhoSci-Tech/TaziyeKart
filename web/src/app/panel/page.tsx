import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function PanelPage() {
  return (
    <PageShell
      eyebrow="Cenaze evi paneli"
      title="Panel"
      description="Dashboard, kart oluşturma, taziye defteri moderasyonu ve plan yönetimi Faz 3'te gelecek. Şu an iskelet ve API hazır."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/admin" className={cn(buttonVariants({ variant: 'outline' }))}>
          Superadmin
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Ana sayfa
        </Link>
      </div>
    </PageShell>
  );
}
