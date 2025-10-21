import type { Components, JSX } from "../types/components";

interface EuclidSwapCard extends Components.EuclidSwapCard, HTMLElement {}
export const EuclidSwapCard: {
    prototype: EuclidSwapCard;
    new (): EuclidSwapCard;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
