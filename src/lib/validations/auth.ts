// src/lib/validations/auth.ts
import { z } from 'zod';
import { ValidationMessages } from '@/lib/constants/messages';

/**
 * Email validation schema
 * RFC 5322 compliant
 */
export const emailSchema = z
  .string()
  .min(1, ValidationMessages.EMAIL_REQUIRED)
  .email(ValidationMessages.EMAIL_INVALID)
  .min(5, ValidationMessages.EMAIL_TOO_SHORT)
  .max(254, ValidationMessages.EMAIL_TOO_LONG)
  .transform((val) => val.toLowerCase().trim());

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(1, ValidationMessages.PASSWORD_REQUIRED)
  .min(8, ValidationMessages.PASSWORD_TOO_SHORT)
  .max(128, ValidationMessages.PASSWORD_TOO_LONG);

/**
 * DNI validation schema (Peruvian DNI - 8 digits)
 */
export const dniSchema = z
  .string()
  .min(1, ValidationMessages.DNI_REQUIRED)
  .regex(/^\d{8}$/, ValidationMessages.DNI_INVALID)
  .transform((val) => val.trim().replace(/[\s-]/g, ''));

/**
 * Full name validation schema
 */
export const fullNameSchema = z
  .string()
  .min(1, ValidationMessages.FULL_NAME_REQUIRED)
  .min(2, ValidationMessages.FULL_NAME_TOO_SHORT)
  .max(100, ValidationMessages.FULL_NAME_TOO_LONG)
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
    'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
  )
  .transform((val) => val.trim());

/**
 * Phone validation schema (Peruvian format)
 */
export const phoneSchema = z
  .string()
  .min(1, 'El teléfono es requerido')
  .regex(/^(\+51)?9\d{8}$/, ValidationMessages.PHONE_INVALID)
  .transform((val) => {
    const clean = val.replace(/[\s-]/g, '');
    return clean.startsWith('+51') ? clean : `+51${clean}`;
  });

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    fullName: fullNameSchema,
    dni: dniSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  });

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  });

/**
 * Type inference from schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

/**
 * Helper function to validate and return errors
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}
