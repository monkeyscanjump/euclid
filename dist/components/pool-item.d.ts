import type { Components, JSX } from "../types/components";

interface PoolItem extends Components.PoolItem, HTMLElement {}
export const PoolItem: {
    prototype: PoolItem;
    new (): PoolItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
