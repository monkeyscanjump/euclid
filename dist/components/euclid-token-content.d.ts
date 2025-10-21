import type { Components, JSX } from "../types/components";

interface EuclidTokenContent extends Components.EuclidTokenContent, HTMLElement {}
export const EuclidTokenContent: {
    prototype: EuclidTokenContent;
    new (): EuclidTokenContent;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
