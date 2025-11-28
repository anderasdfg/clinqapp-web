// src/lib/config/app.config.ts
import { env } from './env.config';

export const AppConfig = {
  baseUrl: env.NEXT_PUBLIC_APP_URL,
  routes: {
    authCallback: '/auth/callback',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    onboarding: '/onboarding',
    authError: '/auth/error',
  },
} as const;
