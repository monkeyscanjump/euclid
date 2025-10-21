import { EventEmitter } from '../../../stencil-public-runtime';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';
export interface LiquidityToken {
    symbol: string;
    name: string;
    address: string;
    chainUID: string;
    decimals: number;
    logoUrl?: string;
    balance?: string;
    price?: number;
}
export interface LiquidityPoolInfo {
    address: string;
    tokenA: LiquidityToken;
    tokenB: LiquidityToken;
    reserveA: string;
    reserveB: string;
    totalSupply: string;
    lpTokenSymbol: string;
    fee: number;
    apy: number;
    tvl: number;
}
export interface LiquidityPosition {
    poolAddress: string;
    lpTokenBalance: string;
    shareOfPool: number;
    tokenAAmount: string;
    tokenBAmount: string;
    value: number;
}
export interface LiquidityQuote {
    tokenAAmount: string;
    tokenBAmount: string;
    lpTokensReceived: string;
    shareOfPool: number;
    priceImpact: number;
    minimumLpReceived: string;
}
export interface RemoveLiquidityQuote {
    lpTokenAmount: string;
    tokenAReceived: string;
    tokenBReceived: string;
    shareRemoved: number;
    minimumTokenAReceived: string;
    minimumTokenBReceived: string;
}
export declare class EuclidLiquidityCard {
    element: HTMLElement;
    /**
     * Available tokens for liquidity provision (legacy - use store instead)
     * @deprecated Use marketStore instead
     */
    tokens: LiquidityToken[];
    /**
     * Available pools (legacy - use store instead)
     * @deprecated Use marketStore instead
     */
    pools: LiquidityPoolInfo[];
    /**
     * User's liquidity positions
     */
    positions: LiquidityPosition[];
    storePools: PoolInfo[];
    storeTokens: TokenMetadata[];
    storeLoading: boolean;
    selectedStorePool: PoolInfo | null;
    /**
     * Selected pool for liquidity operations
     */
    selectedPool: LiquidityPoolInfo | null;
    /**
     * Current mode: 'add' or 'remove'
     */
    mode: 'add' | 'remove';
    /**
     * Token A amount input
     */
    tokenAAmount: string;
    /**
     * Token B amount input
     */
    tokenBAmount: string;
    /**
     * LP token amount for removal
     */
    lpTokenAmount: string;
    /**
     * Whether the component is in loading state
     */
    loading: boolean;
    /**
     * Whether the liquidity functionality is disabled
     */
    disabled: boolean;
    /**
     * Connected wallet address
     */
    walletAddress: string;
    /**
     * Default slippage tolerance (0.5 = 0.5%)
     */
    defaultSlippage: number;
    /**
     * Card title
     */
    cardTitle: string;
    isPoolSelectorOpen: boolean;
    currentQuote: LiquidityQuote | null;
    removeQuote: RemoveLiquidityQuote | null;
    isQuoting: boolean;
    slippage: number;
    isAdvancedOpen: boolean;
    lpPercentage: number;
    liquidityAdded: EventEmitter<{
        pool: LiquidityPoolInfo;
        tokenAAmount: string;
        tokenBAmount: string;
        expectedLpTokens: string;
        slippage: number;
    }>;
    liquidityRemoved: EventEmitter<{
        pool: LiquidityPoolInfo;
        lpTokenAmount: string;
        expectedTokenA: string;
        expectedTokenB: string;
        slippage: number;
    }>;
    poolSelected: EventEmitter<PoolInfo>;
    quoteRequested: EventEmitter<{
        pool: PoolInfo;
        tokenAAmount?: string;
        tokenBAmount?: string;
        lpTokenAmount?: string;
        mode: 'add' | 'remove';
    }>;
    private quoteTimer;
    componentWillLoad(): void;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    private syncWithStore;
    handleInputChange(event: CustomEvent): void;
    handleModalClose(): void;
    private calculateTokenBFromA;
    private calculateTokenAFromB;
    private startQuoteTimer;
    private shouldRequestQuote;
    private requestQuote;
    private handleModeChange;
    private resetAmounts;
    private openPoolSelector;
    private selectStorePool;
    private handleMaxClick;
    private handlePercentageClick;
    private getUserPosition;
    private handleLiquidity;
    private getFirstDisconnectedChain;
    private canExecute;
    private getButtonText;
    private isWalletConnectedForLiquidity;
    private getRequiredChainName;
    private getChainDisplayName;
    render(): any;
    private renderAddLiquidity;
    private renderRemoveLiquidity;
}
//# sourceMappingURL=euclid-liquidity-card.d.ts.map