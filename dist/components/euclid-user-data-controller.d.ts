import type { Components, JSX } from "../types/components";

interface EuclidUserDataController extends Components.EuclidUserDataController, HTMLElement {}
export const EuclidUserDataController: {
    prototype: EuclidUserDataController;
    new (): EuclidUserDataController;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
