/**
 * Normalize text for accent-insensitive search
 * Converts "José García" -> "jose garcia"
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim();
}

/**
 * Check if a text matches a search query (accent-insensitive)
 */
export function matchesSearch(text: string, query: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  return normalizedText.includes(normalizedQuery);
}

/**
 * Filter items by search query across multiple fields
 */
export function filterBySearch<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const normalizedQuery = normalizeText(query);

  return items.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return normalizeText(value).includes(normalizedQuery);
      }
      return false;
    });
  });
}
