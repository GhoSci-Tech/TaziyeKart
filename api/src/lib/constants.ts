export const ROLES = ['SUPERADMIN', 'FUNERAL_HOME'] as const;
export type Role = (typeof ROLES)[number];

export const PLANS = ['TRIAL', 'SINGLE', 'MONTHLY'] as const;
export type Plan = (typeof PLANS)[number];

export const HOME_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export type HomeStatus = (typeof HOME_STATUSES)[number];

export const CONDOLENCE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type CondolenceStatus = (typeof CONDOLENCE_STATUSES)[number];

export const PLAN_LIMITS: Record<Plan, number | null> = {
  TRIAL: 1,
  SINGLE: 1,
  MONTHLY: null,
};

export const PLAN_PRICES_TRY: Record<Plan, number> = {
  TRIAL: 0,
  SINGLE: 350,
  MONTHLY: 1500,
};

export const COOKIE_NAME = 'taziye_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const DEMO_HOME_ID = 'demo-home';
