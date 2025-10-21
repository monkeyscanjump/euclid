import type { Components, JSX } from "../types/components";

interface EuclidWalletContent extends Components.EuclidWalletContent, HTMLElement {}
export const EuclidWalletContent: {
    prototype: EuclidWalletContent;
    new (): EuclidWalletContent;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
