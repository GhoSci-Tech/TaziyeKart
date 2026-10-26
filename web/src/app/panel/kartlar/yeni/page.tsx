'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CardForm } from '@/components/panel/card-form';
import { PageHeader } from '@/components/panel/panel-states';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function NewCardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        title="Yeni taziye kartı"
        description="Zorunlu alanlar: ad, cenaze yeri, tarih ve saat. Diğer alanları sonra da doldurabilirsiniz."
        action={
          <Link href="/panel/kartlar" className={cn(buttonVariants({ variant: 'outline' }))}>
            <ArrowLeft className="h-4 w-4" />
            Kartlar
          </Link>
        }
      />
      <CardForm mode="create" />
    </div>
  );
}
