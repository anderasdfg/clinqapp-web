import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/useUserStore';
import { AuthService } from '@/services/auth.service';
import { logger } from '@/lib/utils/logger';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, setOrganization, clearUser, setLoading } = useUserStore();
    const isSyncing = useRef(false);

    useEffect(() => {
        const syncUser = async (session: any) => {
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
                // Do NOT clearUser here unless we are sure there is no session.
                // If it was just a network timeout, let the user stay with cached data.
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (!currentSession) {
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
                
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    await syncUser(newSession);
                } else if (event === 'SIGNED_OUT') {
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
