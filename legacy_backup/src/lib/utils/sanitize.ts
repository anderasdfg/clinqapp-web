// src/lib/utils/sanitize.ts

/**
 * Sanitizes a string by removing HTML tags and trimming whitespace
 * For now uses a simple regex approach, can be upgraded to DOMPurify if needed
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim();
}

/**
 * Parses a full name into first name and last name
 * @param fullName - The full name to parse
 * @returns Object with firstName and lastName
 */
export function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const sanitized = sanitizeString(fullName);
  const parts = sanitized.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Sanitizes an email by trimming and converting to lowercase
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase();
}

/**
 * Sanitizes a DNI by removing non-numeric characters
 */
export function sanitizeDni(dni: string): string {
  return dni.replace(/\D/g, '');
}
