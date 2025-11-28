// src/lib/constants/subscription.ts

export const SubscriptionDefaults = {
    PLAN: 'FREE_TRIAL' as const,
    STATUS: 'TRIALING' as const,
    TRIAL_DAYS: 30,
} as const;

export const SubscriptionPlans = {
    FREE_TRIAL: 'FREE_TRIAL',
    BASIC: 'BASIC',
    PROFESSIONAL: 'PROFESSIONAL',
    ENTERPRISE: 'ENTERPRISE',
} as const;

export const SubscriptionStatus = {
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    PAST_DUE: 'PAST_DUE',
    TRIALING: 'TRIALING',
} as const;
