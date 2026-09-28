import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/useUserStore';
import { AuthService } from '@/services/auth.service';
import { logger } from '@/lib/utils/logger';
import { setAccessToken } from '@/lib/auth/access-token';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, setOrganization, clearUser, setLoading } = useUserStore();
    const isSyncing = useRef(false);

    useEffect(() => {
        const syncUser = async (session: any) => {
            // Keep API token in sync before any profile fetches (avoids interceptor deadlock)
            setAccessToken(session?.access_token ?? null);

            if (isSyncing.current) return;
            isSyncing.current = true;
            
            try {
                // Get current state to see if we already have a user
                const { user: existingUser } = useUserStore.getState();
                
                // Only show loading if we don't have a user yet
                if (!existingUser && session?.user) {
                    setLoading(true);
                }

                if (session?.user) {
                    const profile = await AuthService.getUserProfile(session.user.id);
                    if (profile) {
                        setUser(profile);
                        const org = await AuthService.getOrganization(profile.organizationId);
                        if (org) {
                            setOrganization(org);
                        }
                        logger.info('User session synchronized');
                    } else if (!existingUser) {
                        // Profile missing and no cached user, clear
                        logger.warn('Auth user has no database profile and no cache');
                        clearUser();
                    }
                } else {
                    // Explicitly no session
                    clearUser();
                }
            } catch (error) {
                logger.error('Auth synchronization error', { error });
                // Do NOT clearUser on transient failures while a token is still cached.
                if (!session?.access_token) {
                    clearUser();
                }
            } finally {
                setLoading(false);
                isSyncing.current = false;
            }
        };

        // Get initial session and start listening
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await syncUser(session);

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                logger.info('Auth state change detected', { event });
                // Always refresh in-memory token first (sync, before any API)
                setAccessToken(newSession?.access_token ?? null);
                
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    await syncUser(newSession);
                } else if (event === 'SIGNED_OUT') {
                    setAccessToken(null);
                    clearUser();
                }
            });

            return subscription;
        };

        const authSubscriptionPromise = initAuth();

        return () => {
            authSubscriptionPromise.then(sub => sub.unsubscribe());
        };
    }, [setUser, setOrganization, clearUser, setLoading]);

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};
