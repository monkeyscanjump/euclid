/**
 * Simple State Management Helpers
 * No over-engineering, just practical utilities for common patterns
 */

/**
 * Simple debounced update function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Simple array update without mutation
 */
export function updateArrayItem<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map(item => predicate(item) ? updater(item) : item);
}

/**
 * Simple array addition without mutation
 */
export function addArrayItem<T>(array: T[], item: T): T[] {
  return [...array, item];
}

/**
 * Simple array removal without mutation
 */
export function removeArrayItem<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter(item => !predicate(item));
}

/**
 * Simple Map update helper
 */
export function updateMapValue<K, V>(
  map: Map<K, V>,
  key: K,
  updater: (value: V | undefined) => V
): Map<K, V> {
  const newMap = new Map(map);
  const currentValue = newMap.get(key);
  newMap.set(key, updater(currentValue));
  return newMap;
}

/**
 * Simple Map removal helper
 */
export function removeMapValue<K, V>(map: Map<K, V>, key: K): Map<K, V> {
  const newMap = new Map(map);
  newMap.delete(key);
  return newMap;
}

/**
 * Simple object update helper
 */
export function updateObject<T extends Record<string, unknown>>(
  obj: T,
  updates: Partial<T>
): T {
  return { ...obj, ...updates };
}

/**
 * Simple loading state manager
 */
export class SimpleLoadingState {
  private loadingStates = new Set<string>();

  start(id: string): void {
    this.loadingStates.add(id);
  }

  stop(id: string): void {
    this.loadingStates.delete(id);
  }

  isLoading(id?: string): boolean {
    if (id) {
      return this.loadingStates.has(id);
    }
    return this.loadingStates.size > 0;
  }

  clear(): void {
    this.loadingStates.clear();
  }
}

/**
 * Simple event emitter for cross-component communication
 */
export class SimpleEventEmitter<T = unknown> {
  private listeners = new Map<string, Set<(data: T) => void>>();

  on(event: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: T): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  off(event: string): void {
    this.listeners.delete(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}
