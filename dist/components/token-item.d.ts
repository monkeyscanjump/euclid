import type { Components, JSX } from "../types/components";

interface TokenItem extends Components.TokenItem, HTMLElement {}
export const TokenItem: {
    prototype: TokenItem;
    new (): TokenItem;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
