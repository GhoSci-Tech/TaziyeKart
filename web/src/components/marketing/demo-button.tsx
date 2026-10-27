'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoLoginRequest } from '@/lib/auth-api';
import { Button } from '@/components/ui/button';

type DemoButtonProps = {
  variant?: 'default' | 'gold' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  label?: string;
};

export function DemoButton({
  variant = 'gold',
  size = 'lg',
  className,
  label = 'Demo panele gir',
}: DemoButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const demo = useMutation({
    mutationFn: demoLoginRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Demo cenaze evi hesabıyla giriş yapıldı.');
      router.push('/panel');
    },
    onError: () => toast.error('Demo giriş yapılamadı. Lütfen tekrar deneyin.'),
  });

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => demo.mutate()}
      disabled={demo.isPending}
    >
      {demo.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
