import type { Components, JSX } from "../types/components";

interface EuclidLiquidityCard extends Components.EuclidLiquidityCard, HTMLElement {}
export const EuclidLiquidityCard: {
    prototype: EuclidLiquidityCard;
    new (): EuclidLiquidityCard;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
