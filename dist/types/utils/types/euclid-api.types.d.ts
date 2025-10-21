import type { TokenWithDenom, TokenWithDenomAndAmount, CrossChainUser, EuclidChainConfig, TokenMetadata, PoolInfo, UserBalance, SwapPath, RoutePath, TransactionResponse } from './api.types';
export type { RoutePath } from './api.types';
export type ChainInfo = EuclidChainConfig;
export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: string | null;
    chainUID: string | null;
    walletType: 'metamask' | 'keplr' | 'phantom' | null;
    balances: UserBalance[];
    loading: boolean;
    error: string | null;
}
export interface WalletInfo {
    address: string;
    chainUID: string;
    isConnected: boolean;
    walletType: 'metamask' | 'keplr' | 'phantom';
    type?: 'metamask' | 'keplr' | 'phantom';
    name?: string;
    balances: UserBalance[];
}
export interface SwapState {
    tokenIn: TokenMetadata | null;
    tokenOut: TokenMetadata | null;
    fromToken: TokenMetadata | null;
    toToken: TokenMetadata | null;
    amountIn: string;
    amountOut: string;
    fromAmount: string;
    toAmount: string;
    routes: RoutePath[];
    selectedRoute: RoutePath | null;
    slippage: number;
    loading: boolean;
    error: string | null;
}
export interface LiquidityState {
    token1: TokenMetadata | null;
    token2: TokenMetadata | null;
    amount1: string;
    amount2: string;
    token1Amount: string;
    token2Amount: string;
    pool: PoolInfo | null;
    selectedPool: PoolInfo | null;
    userLpBalance: string;
    loading: boolean;
    error: string | null;
}
export interface MarketState {
    chains: EuclidChainConfig[];
    tokens: TokenMetadata[];
    pools: PoolInfo[];
    prices: Record<string, number>;
    loading: boolean;
    error: string | null;
    lastUpdated: number;
}
export interface TokenInputProps {
    label: string;
    value: string;
    token: TokenMetadata | null;
    balances: UserBalance[];
    onValueChange: (value: string) => void;
    onTokenSelect: () => void;
    disabled?: boolean;
    showBalance?: boolean;
    showMax?: boolean;
}
export interface PoolCardProps {
    pool: PoolInfo;
    token1Metadata: TokenMetadata;
    token2Metadata: TokenMetadata;
    userLpBalance?: string;
    onAddLiquidity: () => void;
    onRemoveLiquidity: () => void;
}
export interface EuclidGraphQLClient {
    getChains(variables?: {
        showAllChains?: boolean;
        type?: string;
    }): Promise<EuclidChainConfig[]>;
    getTokenMetadata(variables?: {
        token?: string;
        chain_uid?: string;
    }): Promise<TokenMetadata[]>;
    getAllPools(): Promise<PoolInfo[]>;
    getUserBalances(user: CrossChainUser): Promise<UserBalance[]>;
}
export interface EuclidRESTClient {
    getRoutes(request: {
        amount_in: string;
        token_in: string;
        token_out: string;
        external?: boolean;
        chain_uids?: string[];
    }): Promise<RoutePath[]>;
    buildSwapTransaction(request: {
        amount_in: string;
        asset_in: TokenWithDenom;
        slippage: string;
        sender: CrossChainUser;
        swap_path: SwapPath;
    }): Promise<TransactionResponse>;
    buildAddLiquidityTransaction(request: {
        slippage_tolerance_bps: number;
        pair_info: {
            token_1: TokenWithDenomAndAmount;
            token_2: TokenWithDenomAndAmount;
        };
        sender: CrossChainUser;
    }): Promise<TransactionResponse>;
    buildRemoveLiquidityTransaction(request: {
        slippage_tolerance_bps: number;
        lp_token_amount: string;
        sender: CrossChainUser;
    }): Promise<TransactionResponse>;
}
export interface WalletAdapter {
    type: 'metamask' | 'keplr' | 'phantom';
    isAvailable(): boolean;
    connect(chainId?: string): Promise<{
        address: string;
        chainId: string;
    }>;
    disconnect(): Promise<void>;
    getBalance(address: string): Promise<string>;
    signAndBroadcast(transaction: TransactionResponse): Promise<string>;
    switchChain(chainId: string): Promise<void>;
    addChain(config: EuclidChainConfig): Promise<void>;
}
export interface WalletConnectedEvent {
    address: string;
    chainId: string;
    chainUID: string;
    walletType: 'metamask' | 'keplr' | 'phantom';
}
export interface SwapCompletedEvent {
    txHash: string;
    tokenIn: TokenWithDenomAndAmount;
    tokenOut: TokenWithDenomAndAmount;
    route: RoutePath;
}
export interface LiquidityAddedEvent {
    txHash: string;
    token1: TokenWithDenomAndAmount;
    token2: TokenWithDenomAndAmount;
    lpTokenAmount: string;
}
export interface LiquidityRemovedEvent {
    txHash: string;
    lpTokenAmount: string;
    token1Amount: string;
    token2Amount: string;
}
export type ChainType = 'EVM' | 'Cosmwasm';
export interface FormattedBalance {
    raw: string;
    formatted: string;
    symbol: string;
    usdValue?: number;
}
export interface PriceInfo {
    tokenId: string;
    price: number;
    change24h: number;
    marketCap?: number;
    volume24h?: number;
}
export interface TransactionStatus {
    hash: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
    chainUID: string;
    blockHeight?: number;
    gasUsed?: string;
    fee?: string;
}
//# sourceMappingURL=euclid-api.types.d.ts.map