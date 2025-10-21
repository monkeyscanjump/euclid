import type { Components, JSX } from "../types/components";

interface TokensFilters extends Components.TokensFilters, HTMLElement {}
export const TokensFilters: {
    prototype: TokensFilters;
    new (): TokensFilters;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
