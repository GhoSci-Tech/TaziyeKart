'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ApiError, clientApi } from './api';
import { logoutRequest } from './auth-api';
import type { SessionUser } from './api-types';

type SessionContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const data = await clientApi<{ user: SessionUser }>('/auth/me');
        return data.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 30_000,
    enabled: typeof window !== 'undefined',
  });

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      queryClient.clear();
      router.replace('/giris');
    }
  }, [queryClient, router]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: me.data ?? null,
      isLoading: me.isPending,
      error: me.error,
      refetch: () => {
        void me.refetch();
      },
      logout,
    }),
    [me.data, me.isPending, me.error, me.refetch, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
