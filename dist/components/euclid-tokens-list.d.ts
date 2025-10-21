import type { Components, JSX } from "../types/components";

interface EuclidTokensList extends Components.EuclidTokensList, HTMLElement {}
export const EuclidTokensList: {
    prototype: EuclidTokensList;
    new (): EuclidTokensList;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
