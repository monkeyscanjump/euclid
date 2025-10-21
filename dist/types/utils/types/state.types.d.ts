import type { ChainConfig, TokenInfo, TokenBalance, PoolInfo, SwapRoute } from './api.types';
export interface WalletInfo {
    address: string;
    chainUID: string;
    name?: string;
    type: 'keplr' | 'metamask' | 'walletconnect' | 'other';
    isConnected: boolean;
    balances: TokenBalance[];
}
export interface WalletState {
    wallets: Map<string, WalletInfo>;
    isInitialized: boolean;
}
export interface MarketState {
    chains: ChainConfig[];
    tokens: TokenInfo[];
    pools: PoolInfo[];
    isLoading: boolean;
    lastUpdated?: number;
}
export interface AppState {
    walletModalOpen: boolean;
    walletModalFilter?: string | null;
    tokenModalOpen: boolean;
    isInitialized: boolean;
    theme: 'light' | 'dark' | 'auto';
}
export interface SwapState {
    fromToken?: TokenInfo;
    toToken?: TokenInfo;
    fromAmount: string;
    toAmount: string;
    routes: SwapRoute[];
    selectedRoute?: SwapRoute;
    isLoadingRoutes: boolean;
    slippage: number;
    isSwapping: boolean;
    lastRouteUpdate?: number;
}
export interface LiquidityPosition {
    poolId: string;
    pool: PoolInfo;
    lpTokenBalance: string;
    token1Amount: string;
    token2Amount: string;
    sharePercentage: string;
    usdValue?: string;
}
export interface LiquidityState {
    positions: LiquidityPosition[];
    selectedPool?: PoolInfo;
    token1?: TokenInfo;
    token2?: TokenInfo;
    token1Amount: string;
    token2Amount: string;
    isAddingLiquidity: boolean;
    isRemovingLiquidity: boolean;
}
//# sourceMappingURL=state.types.d.ts.map