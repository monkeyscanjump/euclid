import type { Components, JSX } from "../types/components";

interface PoolsStats extends Components.PoolsStats, HTMLElement {}
export const PoolsStats: {
    prototype: PoolsStats;
    new (): PoolsStats;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
