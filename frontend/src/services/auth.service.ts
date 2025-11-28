import { createClient } from '@/lib/supabase/client';
import type {
    RegisterFormData,
    LoginFormData,
    RegisterResult,
    LoginResult,
} from '@/types/auth.types';
import { AuthMessages } from '@/lib/constants/messages';
import { AppConfig } from '@/lib/config/app.config';
import { SubscriptionDefaults } from '@/lib/constants/subscription';
import { logger } from '@/lib/utils/logger';
import { parseFullName } from '@/lib/utils/sanitize';
import { mapSupabaseAuthError } from '@/lib/errors/auth-errors';

/**
 * Authentication Service
 * Handles all auth operations with Supabase
 * Following Single Responsibility Principle
 */
export class AuthService {
    /**
     * Register a new user
     * Creates auth user, organization, and profile in database
     *
     * @param data - Registration form data
     * @returns Promise<RegisterResult>
     */
    static async register(data: RegisterFormData): Promise<RegisterResult> {
        try {
            const supabase = createClient();

            // Data is already validated and transformed by Zod schema
            // email is lowercased, dni is cleaned, fullName is trimmed
            const { firstName, lastName } = parseFullName(data.fullName);

            // Create auth user with Supabase Auth
            // Let Supabase handle duplicate email checks
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email, // Already validated and lowercased by Zod
                password: data.password,
                options: {
                    emailRedirectTo: `${AppConfig.baseUrl}${AppConfig.routes.authCallback}`,
                    data: {
                        full_name: data.fullName,
                        dni: data.dni, // Already cleaned by Zod
                    },
                },
            });

            if (authError) {
                logger.error('Supabase auth error during registration', {
                    error: authError.message,
                });
                const mappedError = mapSupabaseAuthError(authError);
                return {
                    success: false,
                    error: mappedError.userMessage,
                };
            }

            if (!authData.user) {
                logger.error('No user returned from Supabase auth');
                return {
                    success: false,
                    error: AuthMessages.REGISTRATION_ERROR,
                };
            }

            // Check if DNI already exists (before creating organization)
            const { data: existingDniUser, error: dniCheckError } = await supabase
                .from('users')
                .select('dni')
                .eq('dni', data.dni)
                .maybeSingle(); // Use maybeSingle() to allow 0 or 1 results

            // Ignore "no rows" error, only fail on actual errors
            if (dniCheckError && dniCheckError.code !== 'PGRST116') {
                logger.error('Error checking DNI', { error: dniCheckError.message });
                return {
                    success: false,
                    error: AuthMessages.UNEXPECTED_ERROR,
                };
            }

            if (existingDniUser) {
                // Rollback: Delete the auth user we just created
                logger.warn('DNI already exists, rolling back auth user creation');
                // Note: In production, you'd use Supabase Admin API to delete the user
                return {
                    success: false,
                    error: AuthMessages.DNI_ALREADY_REGISTERED,
                };
            }

            // Create organization for the user
            const trialEndsAt = new Date(
                Date.now() + SubscriptionDefaults.TRIAL_DAYS * 24 * 60 * 60 * 1000
            );

            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: `${data.fullName}'s Consultorio`,
                    slug: `org-${authData.user.id.slice(0, 8)}`,
                    email: data.email,
                    subscription_plan: SubscriptionDefaults.PLAN,
                    subscription_status: SubscriptionDefaults.STATUS,
                    trial_ends_at: trialEndsAt.toISOString(),
                    is_temporary: true, // Mark as temporary until onboarding is completed
                    onboarding_completed: false, // User needs to complete onboarding
                })
                .select()
                .single();

            if (orgError || !orgData) {
                logger.error('Organization creation error', { error: orgError?.message });
                return {
                    success: false,
                    error: AuthMessages.ORGANIZATION_CREATION_ERROR,
                };
            }

            // Create user profile in database
            const { error: profileError } = await supabase.from('users').insert({
                auth_id: authData.user.id,
                email: data.email, // Already lowercased by Zod
                first_name: firstName,
                last_name: lastName || firstName,
                dni: data.dni, // Already cleaned by Zod
                organization_id: orgData.id,
                role: 'OWNER',
                email_verified: false,
            });

            if (profileError) {
                logger.error('Profile creation error', { error: profileError.message });
                return {
                    success: false,
                    error: AuthMessages.PROFILE_CREATION_ERROR,
                };
            }

            logger.info('User registration successful');
            return {
                success: true,
                message: AuthMessages.ACCOUNT_CREATED_SUCCESS,
                requiresEmailVerification: true,
            };
        } catch (error) {
            logger.error('Unexpected registration error', { error });
            return {
                success: false,
                error: AuthMessages.UNEXPECTED_ERROR,
            };
        }
    }

    /**
     * Login user
     *
     * @param data - Login form data
     * @returns Promise<LoginResult>
     */
    static async login(data: LoginFormData): Promise<LoginResult> {
        try {
            const supabase = createClient();

            // Email is already validated and lowercased by Zod schema

            // Sign in with Supabase
            const { data: authData, error: authError } =
                await supabase.auth.signInWithPassword({
                    email: data.email, // Already lowercased by Zod
                    password: data.password,
                });

            if (authError) {
                logger.error('Login error', { error: authError.message });
                const mappedError = mapSupabaseAuthError(authError);
                return {
                    success: false,
                    error: mappedError.userMessage,
                };
            }

            if (!authData.user) {
                logger.error('No user returned from login');
                return {
                    success: false,
                    error: AuthMessages.LOGIN_ERROR,
                };
            }

            // Check if email is verified
            if (!authData.user.email_confirmed_at) {
                return {
                    success: false,
                    error: AuthMessages.EMAIL_NOT_CONFIRMED,
                };
            }

            logger.info('User login successful');
            return {
                success: true,
                message: AuthMessages.LOGIN_SUCCESS,
            };
        } catch (error) {
            logger.error('Unexpected login error', { error });
            return {
                success: false,
                error: AuthMessages.UNEXPECTED_ERROR,
            };
        }
    }

    /**
     * Logout user
     */
    static async logout(): Promise<void> {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            logger.info('User logged out');
        } catch (error) {
            logger.error('Logout error', { error });
        }
    }

    /**
     * Resend verification email
     *
     * @param email - User's email address
     * @returns Promise<LoginResult>
     */
    static async resendVerificationEmail(email: string): Promise<LoginResult> {
        try {
            const supabase = createClient();
            // Normalize email manually here since it comes as a raw string
            const normalizedEmail = email.trim().toLowerCase();

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: normalizedEmail,
                options: {
                    emailRedirectTo: `${AppConfig.baseUrl}${AppConfig.routes.authCallback}`,
                },
            });

            if (error) {
                logger.error('Resend verification email error', { error: error.message });
                return {
                    success: false,
                    error: AuthMessages.VERIFICATION_EMAIL_ERROR,
                };
            }

            logger.info('Verification email resent');
            return {
                success: true,
                message: AuthMessages.VERIFICATION_EMAIL_RESENT,
            };
        } catch (error) {
            logger.error('Unexpected resend verification error', { error });
            return {
                success: false,
                error: AuthMessages.UNEXPECTED_ERROR,
            };
        }
    }

    /**
     * Request password reset
     *
     * @param email - User's email address
     * @returns Promise<LoginResult>
     */
    static async requestPasswordReset(email: string): Promise<LoginResult> {
        try {
            const supabase = createClient();
            // Normalize email manually here since it comes as a raw string
            const normalizedEmail = email.trim().toLowerCase();

            const { error } = await supabase.auth.resetPasswordForEmail(
                normalizedEmail,
                {
                    redirectTo: `${AppConfig.baseUrl}${AppConfig.routes.resetPassword}`,
                }
            );

            if (error) {
                logger.error('Password reset request error', { error: error.message });
                return {
                    success: false,
                    error: AuthMessages.PASSWORD_RESET_ERROR,
                };
            }

            logger.info('Password reset email sent');
            return {
                success: true,
                message: AuthMessages.PASSWORD_RESET_SENT,
            };
        } catch (error) {
            logger.error('Unexpected password reset error', { error });
            return {
                success: false,
                error: AuthMessages.UNEXPECTED_ERROR,
            };
        }
    }

    /**
     * Get current session
     *
     * @returns Promise<Session | null>
     */
    static async getSession() {
        try {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            return session;
        } catch (error) {
            logger.error('Get session error', { error });
            return null;
        }
    }

    /**
     * Get current user
     *
     * @returns Promise<User | null>
     */
    static async getUser() {
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            return user;
        } catch (error) {
            logger.error('Get user error', { error });
            return null;
        }
    }

    /**
     * Check if user needs onboarding
     * Returns true if organization is temporary
     *
     * @returns Promise<boolean>
     */
    static async needsOnboarding(): Promise<boolean> {
        try {
            const supabase = createClient();

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return false;

            // Get user's organization
            const { data: userProfile } = await supabase
                .from('users')
                .select('organization_id')
                .eq('auth_id', user.id)
                .single();

            if (!userProfile?.organization_id) return false;

            // Check if organization is temporary
            const { data: org } = await supabase
                .from('organizations')
                .select('is_temporary')
                .eq('id', userProfile.organization_id)
                .single();

            return org?.is_temporary ?? false;
        } catch (error) {
            logger.error('Error checking onboarding status', { error });
            return false;
        }
    }
}
