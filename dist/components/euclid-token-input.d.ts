import type { Components, JSX } from "../types/components";

interface EuclidTokenInput extends Components.EuclidTokenInput, HTMLElement {}
export const EuclidTokenInput: {
    prototype: EuclidTokenInput;
    new (): EuclidTokenInput;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
