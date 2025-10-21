import type { Components, JSX } from "../types/components";

interface EuclidMarketDataController extends Components.EuclidMarketDataController, HTMLElement {}
export const EuclidMarketDataController: {
    prototype: EuclidMarketDataController;
    new (): EuclidMarketDataController;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
