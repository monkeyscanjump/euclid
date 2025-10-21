import type { Components, JSX } from "../types/components";

interface EuclidSwapController extends Components.EuclidSwapController, HTMLElement {}
export const EuclidSwapController: {
    prototype: EuclidSwapController;
    new (): EuclidSwapController;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
