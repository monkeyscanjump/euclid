/**
 * String helper utilities - NO MORE REPETITIVE CODE!
 */

/**
 * Parse comma-separated string into array of trimmed, non-empty strings
 */
export function parseCommaSeparated(input: string | undefined): string[] {
  if (!input?.trim()) return [];
  return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Safe JSON parsing with fallback
 */
export function parseJsonSafe<T>(jsonString: string | undefined, fallback: T): T {
  if (!jsonString?.trim()) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Cache JSON.stringify results to avoid repeated serialization
 */
const stringifyCache = new Map<object, string>();

export function stringifyWithCache(obj: object): string {
  if (stringifyCache.has(obj)) {
    return stringifyCache.get(obj)!;
  }
  const result = JSON.stringify(obj);
  stringifyCache.set(obj, result);
  return result;
}

/**
 * Clear stringify cache (call when objects change)
 */
export function clearStringifyCache(): void {
  stringifyCache.clear();
}

/**
 * Method categorization using efficient lookup
 */
const METHOD_CATEGORIES = {
  Chain: ['chain'],
  Token: ['token'],
  Pool: ['pool'],
  Routing: ['route'],
  Transaction: ['transaction', 'tx'],
  User: ['user', 'balance'],
  Swap: ['swap'],
  Liquidity: ['liquidity']
} as const;

export function categorizeMethod(methodName: string): string {
  const lowerMethod = methodName.toLowerCase();
  for (const [category, keywords] of Object.entries(METHOD_CATEGORIES)) {
    if (keywords.some(keyword => lowerMethod.includes(keyword))) {
      return category;
    }
  }
  return 'Other';
}

/**
 * Format camelCase method names to readable format
 */
export function formatMethodName(methodName: string): string {
  return methodName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Efficient array checking - avoid .length > 0
 */
export function hasItems<T>(array: T[] | undefined | null): array is T[] {
  return Boolean(array?.length);
}

/**
 * Get first item from array safely
 */
export function getFirstItem<T>(array: T[] | undefined | null): T | null {
  return hasItems(array) ? array[0] : null;
}
