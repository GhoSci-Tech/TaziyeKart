'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function PrintTrigger({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href={backHref} className={cn(buttonVariants({ variant: 'outline' }))}>
        <ArrowLeft className="h-4 w-4" />
        Karta dön
      </Link>
      <Button onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Yazdır / PDF olarak kaydet
      </Button>
    </div>
  );
}
