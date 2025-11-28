import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/config/env.config';
import { logger } from '@/lib/utils/logger';
import { Routes } from '@/lib/constants/routes';

export async function updateSession(request: NextRequest) {
  logger.debug('Middleware executing', { pathname: request.nextUrl.pathname });

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('User authentication status', { authenticated: !!user });

  // If no user and trying to access protected routes, redirect to login
  if (
    !user &&
    (request.nextUrl.pathname.startsWith(Routes.APP.DASHBOARD) ||
      request.nextUrl.pathname.startsWith(Routes.APP.ONBOARDING))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = Routes.AUTH.LOGIN;
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check if they need onboarding
  if (user) {
    // Get user's organization to check if it's temporary
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_id', user.id)
      .single();

    if (profileError) {
      logger.error('Failed to fetch user profile', { error: profileError.message });
    }

    let isTemporary = false;
    if (userProfile?.organization_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('is_temporary')
        .eq('id', userProfile.organization_id)
        .single();

      if (orgError) {
        logger.error('Failed to fetch organization', { error: orgError.message });
      }

      isTemporary = org?.is_temporary ?? false;
      logger.debug('Organization onboarding status', { isTemporary });
    }

    // If organization is temporary and user is not on onboarding page, redirect to onboarding
    if (isTemporary && request.nextUrl.pathname !== Routes.APP.ONBOARDING) {
      // Don't redirect if they're on auth routes
      if (!request.nextUrl.pathname.startsWith('/auth/')) {
        logger.debug('Redirecting to onboarding', { from: request.nextUrl.pathname });
        const url = request.nextUrl.clone();
        url.pathname = Routes.APP.ONBOARDING;
        return NextResponse.redirect(url);
      }
    }

    // If organization is NOT temporary and user is on onboarding, redirect to dashboard
    if (!isTemporary && request.nextUrl.pathname === Routes.APP.ONBOARDING) {
      const url = request.nextUrl.clone();
      url.pathname = Routes.APP.DASHBOARD;
      return NextResponse.redirect(url);
    }

    // If user is logged in and tries to access login/register, redirect to appropriate page
    if (
      request.nextUrl.pathname === Routes.AUTH.LOGIN ||
      request.nextUrl.pathname === Routes.AUTH.REGISTER
    ) {
      const url = request.nextUrl.clone();
      url.pathname = isTemporary ? Routes.APP.ONBOARDING : Routes.APP.DASHBOARD;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
