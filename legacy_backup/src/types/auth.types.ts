// Import Zod-inferred types
import type {
  LoginFormData,
  RegisterFormData,
} from '@/lib/validations/auth';

// Re-export for backward compatibility
export type { LoginFormData, RegisterFormData };

/**
 * Validation errors for login form
 * Maps field names to error messages
 */
export interface LoginFormErrors {
  email?: string;
  password?: string;
}

/**
 * Login form state management
 * Tracks the current state of the login process
 */
export interface LoginFormState {
  isLoading: boolean;
  errors: LoginFormErrors;
}

/**
 * Result of a login attempt
 * Generic type to allow for future extensions (API responses, etc.)
 */
export interface LoginResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Validation errors for register form
 * Maps field names to error messages
 */
export interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  dni?: string;
}

/**
 * Register form state management
 * Tracks the current state of the registration process
 */
export interface RegisterFormState {
  isLoading: boolean;
  errors: RegisterFormErrors;
}

/**
 * Result of a registration attempt
 */
export interface RegisterResult {
  success: boolean;
  message?: string;
  error?: string;
  requiresEmailVerification?: boolean;
}

/**
 * User session data
 * Represents authenticated user information
 */
export interface UserSession {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string;
  dni?: string;
  avatarUrl?: string;
}
