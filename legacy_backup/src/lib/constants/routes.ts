// src/lib/constants/routes.ts

export const Routes = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    CALLBACK: '/auth/callback',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    ERROR: '/auth/error',
  },
  APP: {
    DASHBOARD: '/dashboard',
    ONBOARDING: '/onboarding',
  },
  PUBLIC: {
    HOME: '/',
  },
} as const;
