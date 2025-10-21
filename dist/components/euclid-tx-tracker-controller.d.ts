import type { Components, JSX } from "../types/components";

interface EuclidTxTrackerController extends Components.EuclidTxTrackerController, HTMLElement {}
export const EuclidTxTrackerController: {
    prototype: EuclidTxTrackerController;
    new (): EuclidTxTrackerController;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
