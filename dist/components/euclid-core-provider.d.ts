import type { Components, JSX } from "../types/components";

interface EuclidCoreProvider extends Components.EuclidCoreProvider, HTMLElement {}
export const EuclidCoreProvider: {
    prototype: EuclidCoreProvider;
    new (): EuclidCoreProvider;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
