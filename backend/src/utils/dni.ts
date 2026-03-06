import { prisma } from "../lib/prisma";

/**
 * Generates a unique temporary DNI for patients who don't provide one
 * Format: TEMP-XXXXXX (where X is a 6-digit number)
 */
export async function generateTemporaryDni(): Promise<string> {
  const MAX_ATTEMPTS = 100;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    // Generate a random 6-digit number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const tempDni = `TEMP-${randomNumber}`;

    // Check if this DNI already exists
    const existing = await prisma.patient.findFirst({
      where: {
        dni: tempDni,
        deletedAt: null,
      },
    });

    if (!existing) {
      return tempDni;
    }

    attempts++;
  }

  // Fallback: use timestamp-based DNI if random generation fails
  const timestamp = Date.now().toString().slice(-6);
  return `TEMP-${timestamp}`;
}

/**
 * Checks if a DNI is a temporary one
 */
export function isTemporaryDni(dni: string | null): boolean {
  if (!dni) return false;
  return dni.startsWith("TEMP-");
}
