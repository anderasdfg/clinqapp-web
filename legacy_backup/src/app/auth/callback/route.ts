// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { Routes } from '@/lib/constants/routes';

/**
 * Auth Callback Route Handler
 * Handles email verification and password reset callbacks from Supabase
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? Routes.APP.DASHBOARD;

  logger.debug('Auth callback received', {
    hasCode: !!code,
    next,
  });

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('Failed to exchange code for session', {
        error: error.message,
      });
      return NextResponse.redirect(
        `${origin}${Routes.AUTH.ERROR}?message=${encodeURIComponent(error.message)}`
      );
    }

    if (data?.session) {
      logger.info('Session created successfully');

      // Successful verification, redirect to next page
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If there's an error or no code, redirect to error page
  logger.warn('No verification code provided in callback');
  return NextResponse.redirect(
    `${origin}${Routes.AUTH.ERROR}?message=No+verification+code+provided`
  );
}
