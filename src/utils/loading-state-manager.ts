/**
 * Loading State Manager
 * Provides smooth loading transitions and prevents UI flickering during data updates
 */

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  error?: string | null;
  lastUpdated?: number;
}

export interface LoadingOptions {
  minLoadingTime?: number; // Minimum time to show loading (prevents flashing)
  maxLoadingTime?: number; // Maximum time before timeout
  showProgress?: boolean;
  smoothTransition?: boolean;
  transitionDelay?: number;
}

export class LoadingStateManager {
  private states = new Map<string, LoadingState>();
  private timers = new Map<string, {
    minTimer?: number;
    maxTimer?: number;
    transitionTimer?: number;
  }>();
  private listeners = new Map<string, Set<(state: LoadingState) => void>>();

  /**
   * Start loading state
   */
  startLoading(
    id: string,
    text?: string,
    options: LoadingOptions = {}
  ): void {
    const {
      minLoadingTime = 300,
      maxLoadingTime = 30000,
      showProgress = false
    } = options;

    // Clear any existing timers
    this.clearTimers(id);

    const loadingState: LoadingState = {
      isLoading: true,
      loadingText: text,
      progress: showProgress ? 0 : undefined,
      error: null,
      lastUpdated: Date.now()
    };

    // Set initial state
    this.setState(id, loadingState);

    const timers: { minTimer?: number; maxTimer?: number; transitionTimer?: number } = {};

    // Set minimum loading time
    if (minLoadingTime > 0) {
      timers.minTimer = window.setTimeout(() => {
        // Allow stopping after minimum time
        const currentState = this.states.get(id);
        if (currentState) {
          this.setState(id, { ...currentState });
        }
      }, minLoadingTime);
    }

    // Set maximum loading time (timeout)
    if (maxLoadingTime > 0) {
      timers.maxTimer = window.setTimeout(() => {
        this.stopLoading(id, 'Loading timeout');
      }, maxLoadingTime);
    }

    this.timers.set(id, timers);
  }

  /**
   * Update loading progress
   */
  updateProgress(id: string, progress: number, text?: string): void {
    const currentState = this.states.get(id);
    if (!currentState || !currentState.isLoading) return;

    this.setState(id, {
      ...currentState,
      progress: Math.max(0, Math.min(100, progress)),
      loadingText: text || currentState.loadingText,
      lastUpdated: Date.now()
    });
  }

  /**
   * Stop loading state
   */
  stopLoading(id: string, error?: string): void {
    const currentState = this.states.get(id);
    if (!currentState) return;

    const timers = this.timers.get(id);
    const minTimer = timers?.minTimer;

    // If we haven't met minimum loading time, wait
    if (minTimer) {
      const elapsed = Date.now() - (currentState.lastUpdated || 0);
      const minTime = 300; // Default minimum time

      if (elapsed < minTime) {
        setTimeout(() => {
          this.completeStop(id, error);
        }, minTime - elapsed);
        return;
      }
    }

    this.completeStop(id, error);
  }

  private completeStop(id: string, error?: string): void {
    this.clearTimers(id);

    const currentState = this.states.get(id);
    if (!currentState) return;

    const finalState: LoadingState = {
      isLoading: false,
      loadingText: undefined,
      progress: undefined,
      error: error || null,
      lastUpdated: Date.now()
    };

    this.setState(id, finalState);

    // Clean up state after a delay
    setTimeout(() => {
      this.states.delete(id);
      this.listeners.delete(id);
    }, 5000);
  }

  /**
   * Get current loading state
   */
  getState(id: string): LoadingState | null {
    return this.states.get(id) || null;
  }

  /**
   * Check if currently loading
   */
  isLoading(id: string): boolean {
    const state = this.states.get(id);
    return state?.isLoading || false;
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(id: string, listener: (state: LoadingState) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }

    const listeners = this.listeners.get(id)!;
    listeners.add(listener);

    // Call immediately with current state
    const currentState = this.states.get(id);
    if (currentState) {
      listener(currentState);
    }

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(id);
      }
    };
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    for (const id of this.states.keys()) {
      this.clearTimers(id);
    }
    this.states.clear();
    this.timers.clear();
    this.listeners.clear();
  }

  /**
   * Get all active loading states
   */
  getActiveStates(): { [id: string]: LoadingState } {
    const active: { [id: string]: LoadingState } = {};
    for (const [id, state] of this.states) {
      if (state.isLoading) {
        active[id] = state;
      }
    }
    return active;
  }

  private setState(id: string, state: LoadingState): void {
    this.states.set(id, state);

    // Notify listeners
    const listeners = this.listeners.get(id);
    if (listeners) {
      listeners.forEach(listener => listener(state));
    }
  }

  private clearTimers(id: string): void {
    const timers = this.timers.get(id);
    if (timers) {
      if (timers.minTimer) clearTimeout(timers.minTimer);
      if (timers.maxTimer) clearTimeout(timers.maxTimer);
      if (timers.transitionTimer) clearTimeout(timers.transitionTimer);
      this.timers.delete(id);
    }
  }

  /**
   * Cleanup - call when manager is no longer needed
   */
  destroy(): void {
    this.clearAll();
  }
}

// Global instance
export const loadingManager = new LoadingStateManager();

/**
 * Simple loading state hook for Stencil components
 */
export function useLoadingState(id: string): {
  state: LoadingState | null;
  start: (text?: string, options?: LoadingOptions) => void;
  updateProgress: (progress: number, text?: string) => void;
  stop: (error?: string) => void;
  isLoading: boolean;
} {
  const state = loadingManager.getState(id);

  const actions = {
    start: (text?: string, options?: LoadingOptions) => {
      loadingManager.startLoading(id, text, options);
    },
    updateProgress: (progress: number, text?: string) => {
      loadingManager.updateProgress(id, progress, text);
    },
    stop: (error?: string) => {
      loadingManager.stopLoading(id, error);
    },
    isLoading: loadingManager.isLoading(id)
  };

  return { state, ...actions };
}

/**
 * Decorator for automatic loading state management
 */
export function withLoadingState(loadingId?: string) {
  return function(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const id = loadingId || `${(target as { constructor: { name: string } }).constructor.name}-${propertyKey}`;

    descriptor.value = async function(...args: unknown[]) {
      loadingManager.startLoading(id);

      try {
        const result = await originalMethod.apply(this, args);
        loadingManager.stopLoading(id);
        return result;
      } catch (error) {
        loadingManager.stopLoading(id, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utility for batch loading operations
 */
export class BatchLoadingManager {
  private batchId: string;
  private operations: string[] = [];
  private completedOperations = new Set<string>();

  constructor(batchId: string) {
    this.batchId = batchId;
  }

  addOperation(operationId: string): void {
    this.operations.push(operationId);
    this.updateProgress();
  }

  completeOperation(operationId: string): void {
    this.completedOperations.add(operationId);
    this.updateProgress();

    if (this.completedOperations.size === this.operations.length) {
      loadingManager.stopLoading(this.batchId);
    }
  }

  start(text?: string): void {
    loadingManager.startLoading(this.batchId, text, { showProgress: true });
  }

  private updateProgress(): void {
    if (this.operations.length === 0) return;

    const progress = (this.completedOperations.size / this.operations.length) * 100;
    const remainingOps = this.operations.length - this.completedOperations.size;
    const text = remainingOps > 0
      ? `Loading... (${this.completedOperations.size}/${this.operations.length})`
      : 'Complete';

    loadingManager.updateProgress(this.batchId, progress, text);
  }
}

/**
 * Simple utility to subscribe to loading state changes
 */
export function subscribeToLoadingState(
  id: string,
  callback: (state: LoadingState) => void
): () => void {
  return loadingManager.subscribe(id, callback);
}
