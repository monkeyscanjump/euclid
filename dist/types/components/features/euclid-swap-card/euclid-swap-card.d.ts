import { EventEmitter } from '../../../stencil-public-runtime';
import type { TokenMetadata } from '../../../utils/types/api.types';
export interface SwapToken {
    id: string;
    symbol: string;
    name: string;
    address: string;
    chainUID: string;
    decimals: number;
    logoUrl?: string;
    balance?: string;
    price?: number;
}
export interface SwapQuote {
    inputAmount: string;
    outputAmount: string;
    exchangeRate: number;
    priceImpact: number;
    minimumReceived: string;
    gasEstimate: string;
    route: SwapRouteStep[];
}
export interface SwapRouteStep {
    protocol: string;
    poolAddress: string;
    fee: number;
    inputToken: string;
    outputToken: string;
}
export interface SwapSettings {
    slippage: number;
    deadline: number;
    gasPrice?: string;
    infiniteApproval: boolean;
}
export declare class EuclidSwapCard {
    element: HTMLElement;
    /**
     * Available tokens for swapping (gets from market store automatically)
     * @deprecated Use store instead
     */
    tokens: SwapToken[];
    storeTokens: TokenMetadata[];
    storeLoading: boolean;
    /**
     * Currently selected input token
     */
    inputToken: SwapToken | null;
    /**
     * Currently selected output token
     */
    outputToken: SwapToken | null;
    /**
     * Input amount value
     */
    inputAmount: string;
    /**
     * Whether the component is in loading state
     */
    loading: boolean;
    /**
     * Whether the swap functionality is disabled
     */
    disabled: boolean;
    /**
     * Connected wallet address
     */
    walletAddress: string;
    /**
     * Whether to show advanced settings
     */
    showAdvanced: boolean;
    /**
     * Default slippage tolerance (0.1 = 0.1%)
     */
    defaultSlippage: number;
    /**
     * Card title
     */
    cardTitle: string;
    outputAmount: string;
    isSettingsOpen: boolean;
    tokenSelectorType: 'input' | 'output';
    currentQuote: SwapQuote | null;
    isQuoting: boolean;
    swapSettings: SwapSettings;
    swapInitiated: EventEmitter<{
        inputToken: SwapToken;
        outputToken: SwapToken;
        inputAmount: string;
        outputAmount: string;
        settings: SwapSettings;
        quote: SwapQuote;
    }>;
    tokenSelect: EventEmitter<{
        type: 'input' | 'output';
        token: SwapToken;
    }>;
    quoteRequested: EventEmitter<{
        inputToken: SwapToken;
        outputToken: SwapToken;
        inputAmount: string;
    }>;
    settingsChanged: EventEmitter<SwapSettings>;
    private quoteTimer;
    componentWillLoad(): void;
    componentDidLoad(): void;
    private syncWithStore;
    /**
     * Get available tokens for swap selection
     * Combines store tokens with legacy prop tokens for compatibility
     */
    private getAvailableTokens;
    /**
     * Get unique chains from available tokens
     */
    private getAvailableChains;
    disconnectedCallback(): void;
    handleInputChange(event: CustomEvent): void;
    handleTokenModalSelect(event: CustomEvent): void;
    private startQuoteTimer;
    private requestQuote;
    private handleSwapTokens;
    private handleMaxClick;
    private openTokenSelector;
    private toggleSettings;
    private handleSlippageChange;
    private handleSwap;
    private canSwap;
    private getSwapButtonText;
    private isWalletConnectedForSwap;
    private getChainDisplayName;
    render(): any;
}
//# sourceMappingURL=euclid-swap-card.d.ts.map