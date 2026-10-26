import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
  {
    variants: {
      variant: {
        default: 'bg-forest/10 text-forest',
        success: 'bg-emerald-100 text-emerald-800',
        muted: 'bg-line/70 text-muted',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-700',
        gold: 'bg-gold/15 text-[#7a5b2e]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
