// src/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/useUserStore';
import { logger } from '@/lib/utils/logger';

/**
 * Custom hook to manage authentication state
 * Syncs Supabase auth with Zustand store
 *
 * Industry best practices:
 * - Single source of truth (Supabase)
 * - Local cache for performance (Zustand + localStorage)
 * - Real-time sync with auth changes
 * - SSR-safe
 */
export function useAuth() {
  const { user, organization, isLoading, setUser, setOrganization, setLoading, clearUser } =
    useUserStore();

  useEffect(() => {
    const supabase = createClient();

    // Load initial user
    const loadUser = async () => {
      try {
        setLoading(true);

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          clearUser();
          return;
        }

        // Fetch user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select(
            `
            id,
            email,
            first_name,
            last_name,
            dni,
            avatar_url,
            role,
            organization_id,
            email_verified,
            organization:organizations (
              id,
              name,
              slug,
              is_temporary,
              subscription_plan,
              subscription_status
            )
          `
          )
          .eq('auth_id', authUser.id)
          .single();

        if (profileError || !profile) {
          logger.error('Failed to fetch user profile', { error: profileError });
          clearUser();
          return;
        }

        // Update store
        setUser({
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          fullName: `${profile.first_name} ${profile.last_name}`,
          dni: profile.dni || undefined,
          avatarUrl: profile.avatar_url || undefined,
          role: profile.role,
          organizationId: profile.organization_id,
          emailVerified: profile.email_verified,
        });

        if (profile.organization) {
          const org = Array.isArray(profile.organization)
            ? profile.organization[0]
            : profile.organization;

          setOrganization({
            id: org.id,
            name: org.name,
            slug: org.slug,
            isTemporary: org.is_temporary,
            subscriptionPlan: org.subscription_plan,
            subscriptionStatus: org.subscription_status,
          });
        }
      } catch (error) {
        logger.error('Error loading user', { error });
        clearUser();
      }
    };

    loadUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state changed', { event });

      if (event === 'SIGNED_OUT' || !session) {
        clearUser();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setOrganization, setLoading, clearUser]);

  return {
    user,
    organization,
    isLoading,
    isAuthenticated: !!user,
    needsOnboarding: organization?.isTemporary ?? false,
  };
}
