import type { Components, JSX } from "../types/components";

interface TokensLoading extends Components.TokensLoading, HTMLElement {}
export const TokensLoading: {
    prototype: TokensLoading;
    new (): TokensLoading;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
