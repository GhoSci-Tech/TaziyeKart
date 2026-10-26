import { PLAN_LIMITS, PLAN_PRICES_TRY, type Plan } from './constants';

export function getPlanLimit(plan: string): number | null {
  if (!(plan in PLAN_LIMITS)) {
    return 0;
  }
  return PLAN_LIMITS[plan as Plan];
}

export function getPlanPrice(plan: string): number {
  return PLAN_PRICES_TRY[plan as Plan] ?? 0;
}

export type CardCreationCheck = {
  allowed: boolean;
  code?: 'PLAN_LIMIT' | 'PLAN_SUSPENDED';
  message?: string;
  limit: number | null;
};

export function checkCardCreation(
  home: { plan: string; status: string },
  currentCount: number,
): CardCreationCheck {
  if (home.status === 'SUSPENDED') {
    return {
      allowed: false,
      code: 'PLAN_SUSPENDED',
      message: 'Cenaze evi hesabı askıda. Yeni kart oluşturulamaz.',
      limit: 0,
    };
  }

  const limit = getPlanLimit(home.plan);
  if (limit !== null && currentCount >= limit) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT',
      message: `Planınız ${limit} kart içeriyor. Sınırsız kart için Cenaze Evi paketine geçin.`,
      limit,
    };
  }

  return { allowed: true, limit };
}
