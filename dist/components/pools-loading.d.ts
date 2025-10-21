import type { Components, JSX } from "../types/components";

interface PoolsLoading extends Components.PoolsLoading, HTMLElement {}
export const PoolsLoading: {
    prototype: PoolsLoading;
    new (): PoolsLoading;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
