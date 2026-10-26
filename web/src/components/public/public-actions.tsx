'use client';

import { useEffect, useState } from 'react';
import { Copy, MessageCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type PublicActionsProps = {
  title: string;
  publicPath: string;
};

export function PublicActions({ title, publicPath }: PublicActionsProps) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}${publicPath}`;
  const shareText = encodeURIComponent(`${title} — ${url}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link kopyalandı.');
    } catch {
      toast.error('Link kopyalanamadı. Adres çubuğundan kopyalayabilirsiniz.');
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${shareText}`}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: 'gold', size: 'sm' }))}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp&apos;ta paylaş
      </a>
      <Button variant="outline" size="sm" onClick={() => void copy()}>
        <Copy className="h-4 w-4" />
        Linki kopyala
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Yazdır
      </Button>
    </div>
  );
}
