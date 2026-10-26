'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type ShareLinksProps = {
  publicPath: string;
  editPath: string;
  title?: string;
};

export function ShareLinks({ publicPath, editPath, title = 'Taziye kartı' }: ShareLinksProps) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = `${origin}${publicPath}`;
  const editUrl = `${origin}${editPath}`;
  const whatsappText = encodeURIComponent(`${title} — ${publicUrl}`);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} kopyalandı.`);
    } catch {
      toast.error('Kopyalanamadı. Linki seçip elle kopyalayın.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-cream/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Public link</p>
            <p className="mt-1 break-all font-mono text-xs text-ink">{publicUrl}</p>
            <p className="mt-1 text-[11px] text-muted">Aile ve ziyaretçilerle paylaşabilirsiniz.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copy(publicUrl, 'Public link')}>
              <Copy className="h-3.5 w-3.5" />
              Kopyala
            </Button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Aç
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-cream/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Aile düzenleme linki
            </p>
            <p className="mt-1 break-all font-mono text-xs text-ink">{editUrl}</p>
            <p className="mt-1 text-[11px] text-muted">
              Bu linki yalnızca aileyle paylaşın; kartı düzenleme yetkisi verir.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copy(editUrl, 'Düzenleme linki')}>
              <Copy className="h-3.5 w-3.5" />
              Kopyala
            </Button>
            <a
              href={editUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Aç
            </a>
          </div>
        </div>
      </div>

      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'w-full')}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp&apos;ta paylaş
      </a>
    </div>
  );
}
