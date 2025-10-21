import type { Components, JSX } from "../types/components";

interface EuclidModal extends Components.EuclidModal, HTMLElement {}
export const EuclidModal: {
    prototype: EuclidModal;
    new (): EuclidModal;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
