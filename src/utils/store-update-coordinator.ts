/**
 * Store Update Coordinator
 * Prevents UI flickering by implementing smart state diffing and debounced updates
 */

import { createStore } from '@stencil/store';
import { logger } from './logger';

export interface StateChanges {
  [key: string]: {
    oldValue: unknown;
    newValue: unknown;
    hasChanged: boolean;
  };
}

export interface StoreUpdateOptions {
  debounceMs?: number;
  deepCompare?: boolean;
  skipFields?: string[];
  forceUpdate?: boolean;
}

export class StoreUpdateCoordinator {
  private pendingUpdates = new Map<string, {
    timer: number;
    updateFn: () => void;
    options: StoreUpdateOptions;
  }>();

  private stateSnapshots = new Map<string, Record<string, unknown>>();

  /**
   * Deep compare two values to check if they're actually different
   */
  private deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a === null || b === null || a === undefined || b === undefined) {
      return a === b;
    }

    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;

      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => this.deepEquals(item, b[index]));
      }

      const aKeys = Object.keys(a as Record<string, unknown>);
      const bKeys = Object.keys(b as Record<string, unknown>);

      if (aKeys.length !== bKeys.length) return false;

      return aKeys.every(key =>
        bKeys.includes(key) &&
        this.deepEquals(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      );
    }

    return false;
  }

  /**
   * Create a checksum for quick comparison
   */
  private createChecksum(data: unknown): string {
    try {
      const str = JSON.stringify(data, Object.keys(data as object).sort());
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    } catch {
      return Math.random().toString(36);
    }
  }

  /**
   * Compare current state with previous state to detect changes
   */
  private detectChanges(
    storeId: string,
    currentState: Record<string, unknown>,
    options: StoreUpdateOptions
  ): StateChanges {
    const previousState = this.stateSnapshots.get(storeId) || {};
    const changes: StateChanges = {};
    const skipFields = new Set(options.skipFields || []);

    for (const [key, newValue] of Object.entries(currentState)) {
      if (skipFields.has(key)) continue;

      const oldValue = previousState[key];
      const hasChanged = options.deepCompare
        ? !this.deepEquals(oldValue, newValue)
        : oldValue !== newValue;

      changes[key] = {
        oldValue,
        newValue,
        hasChanged
      };
    }

    return changes;
  }

  /**
   * Determine if an update should proceed based on changes
   */
  private shouldUpdate(changes: StateChanges, options: StoreUpdateOptions): boolean {
    if (options.forceUpdate) return true;

    // Check if any significant changes occurred
    return Object.values(changes).some(change => change.hasChanged);
  }

  /**
   * Schedule a store update with debouncing and change detection
   */
  scheduleUpdate(
    storeId: string,
    getCurrentState: () => Record<string, unknown>,
    updateFn: () => void,
    options: StoreUpdateOptions = {}
  ): void {
    // Clear existing timer
    const existing = this.pendingUpdates.get(storeId);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const finalOptions: StoreUpdateOptions = {
      debounceMs: 100,
      deepCompare: true,
      skipFields: ['loading', 'error', 'lastUpdated'], // Common fields that change frequently
      ...options
    };

    // If no debounce, execute immediately with change detection
    if (finalOptions.debounceMs === 0) {
      this.executeUpdate(storeId, getCurrentState, updateFn, finalOptions);
      return;
    }

    // Schedule debounced update
    const timer = window.setTimeout(() => {
      this.executeUpdate(storeId, getCurrentState, updateFn, finalOptions);
      this.pendingUpdates.delete(storeId);
    }, finalOptions.debounceMs);

    this.pendingUpdates.set(storeId, {
      timer,
      updateFn,
      options: finalOptions
    });
  }

  /**
   * Execute the actual update with change detection
   */
  private executeUpdate(
    storeId: string,
    getCurrentState: () => Record<string, unknown>,
    updateFn: () => void,
    options: StoreUpdateOptions
  ): void {
    const currentState = getCurrentState();
    const changes = this.detectChanges(storeId, currentState, options);

    // Only proceed if there are actual changes
    if (this.shouldUpdate(changes, options)) {
      logger.info('Utils', `🔄 Store update [${storeId}]:`, {
        changedFields: Object.keys(changes).filter(key => changes[key].hasChanged),
        totalFields: Object.keys(changes).length
      });

      updateFn();

      // Update snapshot
      this.stateSnapshots.set(storeId, { ...currentState });
    } else {
      logger.info('Utils', `⏭️ Store update skipped [${storeId}]: No significant changes detected`);
    }
  }

  /**
   * Force an immediate update bypassing all checks
   */
  forceUpdate(
    storeId: string,
    getCurrentState: () => Record<string, unknown>,
    updateFn: () => void
  ): void {
    this.executeUpdate(storeId, getCurrentState, updateFn, { forceUpdate: true });
  }

  /**
   * Clear pending updates for a store
   */
  clearPendingUpdates(storeId: string): void {
    const pending = this.pendingUpdates.get(storeId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingUpdates.delete(storeId);
    }
  }

  /**
   * Clear all pending updates
   */
  clearAllPendingUpdates(): void {
    for (const [storeId] of this.pendingUpdates) {
      this.clearPendingUpdates(storeId);
    }
  }

  /**
   * Get information about pending updates
   */
  getPendingUpdates(): string[] {
    return Array.from(this.pendingUpdates.keys());
  }

  /**
   * Cleanup - call when the coordinator is no longer needed
   */
  destroy(): void {
    this.clearAllPendingUpdates();
    this.stateSnapshots.clear();
  }
}

// Global coordinator instance
export const storeUpdateCoordinator = new StoreUpdateCoordinator();

/**
 * Enhanced store wrapper that provides automatic change detection and debouncing
 */
export function createSmartStore<T extends Record<string, unknown>>(
  initialState: T,
  storeId: string,
  options: StoreUpdateOptions = {}
): {
  state: T;
  onChange: (key: keyof T | '*', fn: () => void) => () => void;
  reset: () => void;
  dispose: () => void;
  updateState: (updates: Partial<T>, updateOptions?: StoreUpdateOptions) => void;
  setField: <K extends keyof T>(field: K, value: T[K], updateOptions?: StoreUpdateOptions) => void;
  forceUpdate: (updates: Partial<T>) => void;
  batchUpdate: (updateFn: (state: T) => void, updateOptions?: StoreUpdateOptions) => void;
} {
  const { state, onChange, reset, dispose } = createStore(initialState);

  // Track the original onChange behavior
  const originalOnChange = onChange;

  const smartActions = {
    updateState: (updates: Partial<T>, updateOptions?: StoreUpdateOptions) => {
      const finalOptions = { ...options, ...updateOptions };

      storeUpdateCoordinator.scheduleUpdate(
        storeId,
        () => state as Record<string, unknown>,
        () => {
          Object.assign(state, updates);
        },
        finalOptions
      );
    },

    setField: <K extends keyof T>(field: K, value: T[K], updateOptions?: StoreUpdateOptions) => {
      smartActions.updateState({ [field]: value } as unknown as Partial<T>, updateOptions);
    },

    forceUpdate: (updates: Partial<T>) => {
      storeUpdateCoordinator.forceUpdate(
        storeId,
        () => state as Record<string, unknown>,
        () => {
          Object.assign(state, updates);
        }
      );
    },

    batchUpdate: (updateFn: (state: T) => void, updateOptions?: StoreUpdateOptions) => {
      const finalOptions = { ...options, ...updateOptions };

      storeUpdateCoordinator.scheduleUpdate(
        storeId,
        () => state as Record<string, unknown>,
        () => updateFn(state),
        finalOptions
      );
    }
  };

  return {
    state,
    onChange: originalOnChange,
    reset,
    dispose: () => {
      storeUpdateCoordinator.clearPendingUpdates(storeId);
      dispose();
    },
    ...smartActions
  };
}

/**
 * Utility to wrap existing stores with smart update capabilities
 */
export function wrapStoreWithSmartUpdates<T extends Record<string, unknown>>(
  store: { state: T; onChange: (key: keyof T | '*', fn: () => void) => () => void },
  storeId: string,
  options: StoreUpdateOptions = {}
) {
  return {
    ...store,
    smartUpdate: (updates: Partial<T>, updateOptions?: StoreUpdateOptions) => {
      const finalOptions = { ...options, ...updateOptions };

      storeUpdateCoordinator.scheduleUpdate(
        storeId,
        () => store.state as Record<string, unknown>,
        () => {
          Object.assign(store.state, updates);
        },
        finalOptions
      );
    },

    smartSetField: <K extends keyof T>(field: K, value: T[K], updateOptions?: StoreUpdateOptions) => {
      const finalOptions = { ...options, ...updateOptions };

      storeUpdateCoordinator.scheduleUpdate(
        storeId,
        () => store.state as Record<string, unknown>,
        () => {
          store.state[field] = value;
        },
        finalOptions
      );
    }
  };
}
