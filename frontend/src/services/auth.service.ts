import { supabase } from "@/lib/supabase/client";
import type {
  RegisterFormData,
  LoginFormData,
  RegisterResult,
  LoginResult,
} from "@/types/auth.types";
import { AuthMessages } from "@/lib/constants/messages";
import { AppConfig } from "@/lib/config/app.config";
import { logger } from "@/lib/utils/logger";
import { mapSupabaseAuthError } from "@/lib/errors/auth-errors";
import type { User, Organization } from "@/stores/useUserStore";

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
      // Data is already validated and transformed by Zod schema
      // email is lowercased, dni is cleaned, fullName is trimmed

      // Create auth user with Supabase Auth
      // The DB Trigger 'on_auth_user_created' will automatically create:
      // 1. The Organization
      // 2. The User Profile (linked to Auth ID and Org)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${AppConfig.baseUrl}${AppConfig.routes.authCallback}`,
          data: {
            full_name: data.fullName,
            dni: data.dni,
          },
        },
      });

      if (authError) {
        logger.error("Supabase auth error during registration", {
          error: authError.message,
        });
        const mappedError = mapSupabaseAuthError(authError);
        return {
          success: false,
          error: mappedError.userMessage,
        };
      }

      if (!authData.user) {
        logger.error("No user returned from Supabase auth");
        return {
          success: false,
          error: AuthMessages.REGISTRATION_ERROR,
        };
      }

      // Poll for the user profile to be created by the trigger
      // This ensures the DB transaction has completed before we return success
      let profile = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!profile && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
        profile = await AuthService.getUserProfile(authData.user.id);
        attempts++;
      }

      if (!profile) {
        logger.warn(
          "Profile not found after registration (Trigger might be slow or failed)",
          { userId: authData.user.id },
        );
        // We still return success because the auth user was created,
        // and the profile might appear momentarily.
        // Ideally we should warn the user, but for now we proceed.
      } else {
        logger.info("Profile created successfully by trigger", {
          profileId: profile.id,
        });
      }

      logger.info("User registration successful");
      return {
        success: true,
        message: AuthMessages.ACCOUNT_CREATED_SUCCESS,
        requiresEmailVerification: true,
      };
    } catch (error) {
      logger.error("Unexpected registration error", { error });
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
      // Email is already validated and lowercased by Zod schema

      // Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email, // Already lowercased by Zod
          password: data.password,
        });

      if (authError) {
        logger.error("Login error", { error: authError.message });
        const mappedError = mapSupabaseAuthError(authError);
        return {
          success: false,
          error: mappedError.userMessage,
        };
      }

      if (!authData.user) {
        logger.error("No user returned from login");
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

      logger.info("User login successful");
      return {
        success: true,
        message: AuthMessages.LOGIN_SUCCESS,
      };
    } catch (error) {
      logger.error("Unexpected login error", { error });
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
      await supabase.auth.signOut();
      logger.info("User logged out");
    } catch (error) {
      logger.error("Logout error", { error });
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
      // Normalize email manually here since it comes as a raw string
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${AppConfig.baseUrl}${AppConfig.routes.authCallback}`,
        },
      });

      if (error) {
        logger.error("Resend verification email error", {
          error: error.message,
        });
        return {
          success: false,
          error: AuthMessages.VERIFICATION_EMAIL_ERROR,
        };
      }

      logger.info("Verification email resent");
      return {
        success: true,
        message: AuthMessages.VERIFICATION_EMAIL_RESENT,
      };
    } catch (error) {
      logger.error("Unexpected resend verification error", { error });
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
      // Normalize email manually here since it comes as a raw string
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${AppConfig.baseUrl}${AppConfig.routes.resetPassword}`,
        },
      );

      if (error) {
        logger.error("Password reset request error", { error: error.message });
        return {
          success: false,
          error: AuthMessages.PASSWORD_RESET_ERROR,
        };
      }

      logger.info("Password reset email sent");
      return {
        success: true,
        message: AuthMessages.PASSWORD_RESET_SENT,
      };
    } catch (error) {
      logger.error("Unexpected password reset error", { error });
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      logger.error("Get session error", { error });
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      logger.error("Get user error", { error });
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
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Get user's organization
      const { data: userProfile } = await supabase
        .from("users")
        .select("organization_id")
        .eq("auth_id", user.id)
        .single();

      if (!userProfile?.organization_id) return false;

      // Check if organization is temporary
      const { data: org } = await supabase
        .from("organizations")
        .select("is_temporary")
        .eq("id", userProfile.organization_id)
        .single();

      return org?.is_temporary ?? false;
    } catch (error) {
      logger.error("Error checking onboarding status", { error });
      return false;
    }
  }

  /**
   * Get user profile from database
   *
   * @param userId - Auth user ID
   * @returns Promise<User | null>
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000),
      );

      const fetchPromise = supabase
        .from("users")
        .select("*")
        .eq("auth_id", userId)
        .single();

      // Race against timeout
      const result = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as any;
      const { data, error } = result;

      if (error || !data) {
        logger.error("Error fetching user profile", { error: error?.message });
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: `${data.first_name} ${data.last_name}`,
        dni: data.dni,
        avatarUrl: data.avatar_url,
        role: data.role,
        organizationId: data.organization_id,
        emailVerified: data.email_verified,
      };
    } catch (error) {
      logger.error("Unexpected error fetching profile", { error });
      return null;
    }
  }

  /**
   * Get organization from database
   *
   * @param orgId - Organization ID
   * @returns Promise<Organization | null>
   */
  static async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();

      if (error || !data) {
        logger.error("Error fetching organization", { error: error?.message });
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        isTemporary: data.is_temporary,
        subscriptionPlan: data.subscription_plan,
        subscriptionStatus: data.subscription_status,
      };
    } catch (error) {
      logger.error("Unexpected error fetching organization", { error });
      return null;
    }
  }
}
