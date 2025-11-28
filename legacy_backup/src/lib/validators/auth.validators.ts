// src/lib/validators/auth.validators.ts
import { ValidationMessages } from '@/lib/constants/messages';

/**
 * Validation result interface
 * Provides a consistent structure for validation responses
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Base Validator Abstract Class
 * Following Open/Closed Principle - open for extension, closed for modification
 */
export abstract class BaseValidator {
  /**
   * Validates if a field is required (not empty)
   */
  protected static validateRequired(
    value: string,
    fieldName: string
  ): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        error: `${fieldName} es requerido`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validates minimum length
   */
  protected static validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): ValidationResult {
    if (value.length < minLength) {
      return {
        isValid: false,
        error: `${fieldName} debe tener al menos ${minLength} caracteres`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validates maximum length
   */
  protected static validateMaxLength(
    value: string,
    maxLength: number,
    fieldName: string
  ): ValidationResult {
    if (value.length > maxLength) {
      return {
        isValid: false,
        error: `${fieldName} no puede exceder ${maxLength} caracteres`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validates a regex pattern
   */
  protected static validatePattern(
    value: string,
    pattern: RegExp,
    errorMessage: string
  ): ValidationResult {
    if (!pattern.test(value)) {
      return {
        isValid: false,
        error: errorMessage,
      };
    }
    return { isValid: true };
  }
}

/**
 * Email Validator
 * Handles all email validation logic
 */
export class EmailValidator extends BaseValidator {
  // RFC 5322 compliant email regex (simplified version)
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private static readonly MIN_LENGTH = 5; // a@b.c
  private static readonly MAX_LENGTH = 254; // RFC 5321

  /**
   * Validates email format and constraints
   */
  static validate(email: string): ValidationResult {
    // Required validation
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: ValidationMessages.EMAIL_REQUIRED,
      };
    }

    // Trim whitespace
    const trimmedEmail = email.trim();

    // Min length validation
    if (trimmedEmail.length < this.MIN_LENGTH) {
      return {
        isValid: false,
        error: ValidationMessages.EMAIL_TOO_SHORT,
      };
    }

    // Max length validation
    if (trimmedEmail.length > this.MAX_LENGTH) {
      return {
        isValid: false,
        error: ValidationMessages.EMAIL_TOO_LONG,
      };
    }

    // Pattern validation
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return {
        isValid: false,
        error: ValidationMessages.EMAIL_INVALID,
      };
    }

    return { isValid: true };
  }

  /**
   * Normalizes email (lowercase and trim)
   */
  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}

/**
 * Password Validator
 * Handles all password validation logic
 */
export class PasswordValidator extends BaseValidator {
  private static readonly MIN_LENGTH = 8; // Changed from 6 to 8
  private static readonly MAX_LENGTH = 100;

  /**
   * Configuration for password strength requirements
   * Can be easily extended in the future
   */
  private static readonly STRENGTH_CONFIG = {
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: false,
  };

  /**
   * Validates password format and constraints
   */
  static validate(password: string): ValidationResult {
    // Required validation
    if (!password || password.trim().length === 0) {
      return {
        isValid: false,
        error: ValidationMessages.PASSWORD_REQUIRED,
      };
    }

    // Min length validation
    if (password.length < this.MIN_LENGTH) {
      return {
        isValid: false,
        error: ValidationMessages.PASSWORD_TOO_SHORT,
      };
    }

    // Max length validation
    if (password.length > this.MAX_LENGTH) {
      return {
        isValid: false,
        error: ValidationMessages.PASSWORD_TOO_LONG,
      };
    }

    // Strength validations (if enabled)
    if (this.STRENGTH_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos una mayúscula',
      };
    }

    if (this.STRENGTH_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos una minúscula',
      };
    }

    if (this.STRENGTH_CONFIG.requireNumber && !/\d/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos un número',
      };
    }

    if (
      this.STRENGTH_CONFIG.requireSpecialChar &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos un carácter especial',
      };
    }

    return { isValid: true };
  }

  /**
   * Validates password confirmation (for registration forms)
   */
  static validateConfirmation(
    password: string,
    confirmation: string
  ): ValidationResult {
    if (password !== confirmation) {
      return {
        isValid: false,
        error: ValidationMessages.PASSWORDS_DONT_MATCH,
      };
    }
    return { isValid: true };
  }
}

/**
 * Name Validator
 * For validating first name, last name, etc.
 */
export class NameValidator extends BaseValidator {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;
  private static readonly NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

  static validate(name: string, fieldName: string = 'El nombre'): ValidationResult {
    // Required validation
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        error: fieldName === 'El nombre completo' ? ValidationMessages.FULL_NAME_REQUIRED : ValidationMessages.NAME_REQUIRED,
      };
    }

    const trimmedName = name.trim();

    // Min length validation
    if (trimmedName.length < this.MIN_LENGTH) {
      return {
        isValid: false,
        error: fieldName === 'El nombre completo' ? ValidationMessages.FULL_NAME_TOO_SHORT : ValidationMessages.NAME_TOO_SHORT,
      };
    }

    // Max length validation
    if (trimmedName.length > this.MAX_LENGTH) {
      return {
        isValid: false,
        error: fieldName === 'El nombre completo' ? ValidationMessages.FULL_NAME_TOO_LONG : ValidationMessages.NAME_TOO_LONG,
      };
    }

    // Pattern validation (only letters, spaces, hyphens, apostrophes)
    if (!this.NAME_REGEX.test(trimmedName)) {
      return {
        isValid: false,
        error: `${fieldName} solo puede contener letras, espacios, guiones y apóstrofes`,
      };
    }

    return { isValid: true };
  }

  /**
   * Normalizes name (trim and capitalize first letter of each word)
   */
  static normalize(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

/**
 * Phone Validator
 * For validating phone numbers (Peruvian format)
 */
export class PhoneValidator extends BaseValidator {
  // Peruvian phone regex: +51 followed by 9 digits
  private static readonly PHONE_REGEX = /^(\+51)?9\d{8}$/;

  static validate(phone: string): ValidationResult {
    // Required validation
    if (!phone || phone.trim().length === 0) {
      return {
        isValid: false,
        error: 'El teléfono es requerido',
      };
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Pattern validation
    if (!this.PHONE_REGEX.test(cleanPhone)) {
      return {
        isValid: false,
        error: ValidationMessages.PHONE_INVALID,
      };
    }

    return { isValid: true };
  }

  /**
   * Normalizes phone (adds +51 prefix if not present)
   */
  static normalize(phone: string): string {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return cleanPhone.startsWith('+51') ? cleanPhone : `+51${cleanPhone}`;
  }
}

/**
 * DNI Validator
 * For validating Peruvian DNI (8 digits)
 */
export class DniValidator extends BaseValidator {
  private static readonly DNI_LENGTH = 8;
  private static readonly DNI_REGEX = /^\d{8}$/;

  static validate(dni: string): ValidationResult {
    // Required validation
    if (!dni || dni.trim().length === 0) {
      return {
        isValid: false,
        error: ValidationMessages.DNI_REQUIRED,
      };
    }

    const trimmedDni = dni.trim();

    // Remove any spaces or hyphens
    const cleanDni = trimmedDni.replace(/[\s-]/g, '');

    // Length and pattern validation combined
    if (!this.DNI_REGEX.test(cleanDni)) {
      return {
        isValid: false,
        error: ValidationMessages.DNI_INVALID,
      };
    }

    return { isValid: true };
  }

  /**
   * Normalizes DNI (removes spaces and hyphens)
   */
  static normalize(dni: string): string {
    return dni.trim().replace(/[\s-]/g, '');
  }
}
