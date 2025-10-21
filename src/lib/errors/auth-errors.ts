// src/lib/errors/auth-errors.ts
import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { AuthMessages } from '@/lib/constants/messages';

export enum AuthErrorCode {
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    public userMessage: string,
    public originalError?: unknown
  ) {
    super(userMessage);
    this.name = 'AuthError';
  }
}

/**
 * Maps Supabase Auth errors to our custom AuthError
 */
export function mapSupabaseAuthError(error: SupabaseAuthError): AuthError {
  const errorMessage = error.message || '';
  const errorStatus = error.status;

  // Email already registered
  if (
    errorStatus === 422 ||
    errorMessage.includes('already registered') ||
    errorMessage.includes('already been registered')
  ) {
    return new AuthError(
      AuthErrorCode.EMAIL_ALREADY_REGISTERED,
      AuthMessages.EMAIL_ALREADY_REGISTERED,
      error
    );
  }

  // Invalid credentials
  if (
    errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('invalid_credentials')
  ) {
    return new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      AuthMessages.INVALID_CREDENTIALS,
      error
    );
  }

  // Email not confirmed
  if (
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('email_not_confirmed')
  ) {
    return new AuthError(
      AuthErrorCode.EMAIL_NOT_CONFIRMED,
      AuthMessages.EMAIL_NOT_CONFIRMED,
      error
    );
  }

  // Weak password
  if (errorMessage.includes('Password') && errorMessage.includes('weak')) {
    return new AuthError(
      AuthErrorCode.WEAK_PASSWORD,
      'La contraseña es muy débil. Por favor, usa una contraseña más segura.',
      error
    );
  }

  // Network or timeout errors
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return new AuthError(
      AuthErrorCode.NETWORK_ERROR,
      'Error de conexión. Por favor, verifica tu internet e intenta nuevamente.',
      error
    );
  }

  // Default unknown error
  return new AuthError(
    AuthErrorCode.UNKNOWN_ERROR,
    AuthMessages.UNEXPECTED_ERROR,
    error
  );
}
