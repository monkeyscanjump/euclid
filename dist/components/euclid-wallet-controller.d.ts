import type { Components, JSX } from "../types/components";

interface EuclidWalletController extends Components.EuclidWalletController, HTMLElement {}
export const EuclidWalletController: {
    prototype: EuclidWalletController;
    new (): EuclidWalletController;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
