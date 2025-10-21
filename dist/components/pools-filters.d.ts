import type { Components, JSX } from "../types/components";

interface PoolsFilters extends Components.PoolsFilters, HTMLElement {}
export const PoolsFilters: {
    prototype: PoolsFilters;
    new (): PoolsFilters;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
