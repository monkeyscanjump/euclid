/**
 * Store-specific type definitions for the Euclid package
 * Centralizes all store-related types to avoid duplication
 */

// Stencil Store OnChangeHandler type - matches @stencil/store API exactly
export type StencilOnChangeHandler<T> = <Key extends keyof T>(
  propName: Key,
  cb: (newValue: T[Key]) => void
) => () => void;

// Base store interface that all stores should extend
export interface BaseStore<T> {
  state: T;
  onChange: StencilOnChangeHandler<T>;
  reset: () => void;
  dispose: () => void;
}
