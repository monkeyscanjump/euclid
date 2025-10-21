/**
 * Store-specific type definitions for the Euclid package
 * Centralizes all store-related types to avoid duplication
 */
export type StencilOnChangeHandler<T> = <Key extends keyof T>(propName: Key, cb: (newValue: T[Key]) => void) => () => void;
export interface BaseStore<T> {
    state: T;
    onChange: StencilOnChangeHandler<T>;
    reset: () => void;
    dispose: () => void;
}
//# sourceMappingURL=types.d.ts.map