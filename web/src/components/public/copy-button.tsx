'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = 'Kopyala' }: CopyButtonProps) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} kopyalandı.`);
    } catch {
      toast.error('Kopyalanamadı.');
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
      <Copy className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
