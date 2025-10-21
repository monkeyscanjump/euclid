export interface CrossChainUser {
    address: string | null;
    chain_uid: string | null;
}
export interface CrossChainUserInput {
    address?: string | null;
    chain_uid?: string | null;
}
export interface CrossChainUserWithLimit {
    limit?: Limit | null;
    user: CrossChainUser;
}
export type Limit = {
    less_than_or_equal: string;
} | {
    equal: string;
} | {
    greater_than_or_equal: string;
};
export type TokenType = {
    native: {
        denom: string;
    };
} | {
    smart: {
        contract_address: string;
    };
} | {
    voucher: Record<string, never>;
};
export interface TokenWithDenom {
    token: string;
    token_type: TokenType;
}
export interface TokenWithDenomAndAmount {
    token: string;
    amount: string;
    token_type: TokenType;
}
export interface PairWithDenomAndAmount {
    token_1: TokenWithDenomAndAmount;
    token_2: TokenWithDenomAndAmount;
}
export interface EuclidChainConfig {
    chain_id: string;
    chain_uid: string;
    display_name: string;
    factory_address: string;
    token_factory_address: string;
    explorer_url: string;
    logo: string;
    type: 'EVM' | 'Cosmwasm';
}
export interface GetRoutesRequest {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
}
export interface RouteStep {
    route: string[];
    dex: string;
    amount_in: string;
    amount_out: string;
    chain_uid: string;
    amount_out_for_hops: string[];
}
export interface RoutePath {
    path: RouteStep[];
    total_price_impact: string;
    id?: string;
    outputAmount?: string;
}
export interface GetRoutesResponse {
    paths: RoutePath[];
}
export interface SwapPath {
    path: Array<{
        route: string[];
        dex: string;
        chain_uid?: string;
        amount_in?: string;
        amount_out?: string;
    }>;
}
export interface PartnerFee {
    partner_fee_bps: number;
    recipient: string;
}
export interface SwapRequest {
    amount_in: string;
    asset_in: TokenWithDenom;
    slippage: string;
    minimum_receive?: string;
    cross_chain_addresses?: CrossChainUserWithLimit[];
    partnerFee?: PartnerFee;
    sender: CrossChainUser;
    swap_path: SwapPath;
    timeout?: string;
}
export interface AddLiquidityRequest {
    slippage_tolerance_bps: number;
    timeout?: string;
    pair_info: PairWithDenomAndAmount;
    sender: CrossChainUser;
}
export interface RemoveLiquidityRequest {
    slippage_tolerance_bps: number;
    timeout?: string;
    lp_token_amount: string;
    sender: CrossChainUser;
}
export interface CosmWasmMessage {
    contractAddress: string;
    msg: Record<string, unknown>;
    funds?: Array<{
        denom: string;
        amount: string;
    }>;
}
export interface EVMMessage {
    chainId: string;
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
}
export interface CosmWasmTransactionResponse {
    type: 'cosmwasm';
    sender: CrossChainUser;
    contract: string;
    chain_id: string;
    rpc_url: string;
    rest_url: string;
    msgs: CosmWasmMessage[];
    meta?: string;
}
export interface EVMTransactionResponse {
    type: 'evm';
    sender: CrossChainUser;
    contract: string;
    chain_id: string;
    rpc_url: string;
    rest_url: string;
    msgs: EVMMessage[];
    meta?: string;
}
export type TransactionResponse = CosmWasmTransactionResponse | EVMTransactionResponse;
export interface ChainsQueryVariables {
    showAllChains?: boolean;
    type?: string;
}
export interface ChainsQueryResponse {
    chains: {
        all_chains: EuclidChainConfig[];
    };
}
export interface TokenMetadataQueryVariables {
    token?: string;
    chain_uid?: string;
}
export interface TokenMetadata {
    coinDecimal: number;
    displayName: string;
    tokenId: string;
    description?: string;
    image?: string;
    price?: string;
    price_change_24h?: number;
    price_change_7d?: number;
    dex?: string[];
    chain_uids?: string[];
    total_volume?: number;
    total_volume_24h?: number;
    tags?: string[];
    min_swap_value?: number;
    social?: Record<string, unknown>;
    is_verified?: boolean;
    id?: string;
    symbol?: string;
    name?: string;
    decimals?: number;
    logo?: string;
    chain_uid?: string;
    chainUID?: string;
    address?: string;
    token_type?: TokenType;
    coingecko_id?: string;
}
export interface TokenMetadataQueryResponse {
    token: {
        token_metadatas: TokenMetadata[];
    };
}
export interface PoolInfo {
    pool_id: string;
    id?: string;
    token_1: string;
    token_2: string;
    token1?: string;
    token2?: string;
    total_liquidity: string;
    volume_24h?: string;
    fees_24h?: string;
    apr?: string;
}
export type TokenInfo = TokenMetadata;
export type ChainConfig = EuclidChainConfig;
export type SwapRoute = RoutePath;
export type TokenBalance = UserBalance;
export interface LiquidityPosition {
    poolId: string;
    lpTokenAmount: string;
    token1Amount: string;
    token2Amount: string;
    userShare: string;
}
export interface Transaction {
    hash: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
    type: 'swap' | 'add_liquidity' | 'remove_liquidity';
    chainUID: string;
}
export interface AllPoolsQueryResponse {
    factory: {
        all_pools: PoolInfo[];
    };
}
export interface UserBalanceQueryVariables {
    user: CrossChainUserInput;
}
export interface UserBalance {
    amount: string;
    token_id: string;
    token?: string;
    balance?: string;
    chain_uid?: string;
    token_type?: TokenType;
}
export interface UserBalanceQueryResponse {
    vcoin: {
        user_balance: {
            balances: UserBalance[];
        };
    };
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
//# sourceMappingURL=api.types.d.ts.map