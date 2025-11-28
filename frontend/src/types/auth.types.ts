// Import Zod-inferred types
// We will need to create validations/auth first, or define them here temporarily
// For now defining interfaces directly to avoid circular dependency if validation not ready

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    dni: string;
}

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
