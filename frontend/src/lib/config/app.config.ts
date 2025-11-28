export const AppConfig = {
    baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
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
