import type { Components, JSX } from "../types/components";

interface EuclidPoolsList extends Components.EuclidPoolsList, HTMLElement {}
export const EuclidPoolsList: {
    prototype: EuclidPoolsList;
    new (): EuclidPoolsList;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
