/**
 * Temporary DNIs are assigned server-side when a patient is created without one.
 * Format: TEMP-XXXXXX (see backend/src/utils/dni.ts).
 */

export function isTemporaryDocumentNumber(
  dni: string | null | undefined,
): boolean {
  if (!dni) return false;
  return dni.toUpperCase().startsWith('TEMP-');
}

/**
 * Value safe for read-only UI / PDFs. TEMP DNIs are hidden (blank by default).
 * Editing forms can pass fallback '' so the input stays empty while DB keeps TEMP-*.
 */
export function formatDocumentNumberForDisplay(
  dni: string | null | undefined,
  fallback = '',
): string {
  if (!dni || isTemporaryDocumentNumber(dni)) return fallback;
  return dni;
}
