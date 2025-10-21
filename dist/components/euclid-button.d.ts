import type { Components, JSX } from "../types/components";

interface EuclidButton extends Components.EuclidButton, HTMLElement {}
export const EuclidButton: {
    prototype: EuclidButton;
    new (): EuclidButton;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
