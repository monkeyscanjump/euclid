/**
 * Unified API Client for Euclid Protocol
 * Combines GraphQL and REST clients for a single interface
 */
import type { EuclidChainConfig, TokenMetadata, PoolInfo, UserBalance, RoutePath, SwapRequest, AddLiquidityRequest, RemoveLiquidityRequest, TransactionResponse, CrossChainUser, GetRoutesRequest } from './types/api.types';
/**
 * Main API client that provides a unified interface to Euclid Protocol
 * Uses dedicated GraphQL and REST clients under the hood
 */
export declare class EuclidAPIClient {
    private graphql;
    private rest;
    /**
     * Get all supported blockchain networks
     */
    getChains(options?: {
        showAllChains?: boolean;
        type?: string;
    }): Promise<EuclidChainConfig[]>;
    /**
     * Get token metadata information
     */
    getTokenMetadata(options?: {
        limit?: number;
        offset?: number;
        verified?: boolean;
        dex?: string[];
        chainUids?: string[];
        showVolume?: boolean;
        search?: string;
    }): Promise<TokenMetadata[]>;
    /**
     * Search for tokens by symbol or name
     */
    searchTokens(searchTerm: string, chainUID?: string): Promise<TokenMetadata[]>;
    /**
     * Get a specific token by symbol and chain
     */
    getTokenBySymbol(symbol: string, chainUID: string): Promise<TokenMetadata | null>;
    /**
     * Get all liquidity pools
     * @param onlyVerified - Whether to show only verified pools (default: true)
     */
    getAllPools(onlyVerified?: boolean): Promise<{
        success: boolean;
        data?: PoolInfo[];
        error?: string;
    }>;
    /**
     * Get pool information for a specific token pair
     */
    getPoolInfo(token1: string, token2: string): Promise<PoolInfo | null>;
    /**
     * @deprecated Use getChains() instead
     */
    getAllChains(showAllChains?: boolean): Promise<{
        success: boolean;
        data?: EuclidChainConfig[];
        error?: string;
    }>;
    /**
     * @deprecated Use getTokenMetadata() instead
     */
    getAllTokens(): Promise<{
        success: boolean;
        data?: TokenMetadata[];
        error?: string;
    }>;
    /**
     * Get token denominations for a token ID (placeholder - not implemented in Euclid API)
     */
    getTokenDenoms(tokenId: string): Promise<{
        success: boolean;
        data?: {
            router: {
                token_denoms: {
                    denoms: string[];
                };
            };
        };
        error?: string;
    }>;
    /**
     * Get escrow information for a token (placeholder - not implemented in Euclid API)
     */
    getEscrows(tokenId: string): Promise<{
        success: boolean;
        data?: {
            router: {
                escrows: unknown[];
            };
        };
        error?: string;
    }>;
    /**
     * Get balance for a specific address and chain (legacy compatibility)
     */
    getBalance(address: string, chainUID: string): Promise<{
        success: boolean;
        data?: {
            balance?: {
                all?: Array<{
                    denom: string;
                    amount: string;
                }>;
            };
        };
        error?: string;
    }>;
    /**
     * Get user token balances across all chains
     */
    getUserBalances(user: CrossChainUser): Promise<UserBalance[]>;
    /**
     * Get routing paths for a swap
     */
    getRoutes(request: GetRoutesRequest): Promise<RoutePath[]>;
    /**
     * Legacy method that returns wrapped response format (used by swap controller)
     */
    getRoutesWrapped(request: GetRoutesRequest): Promise<{
        success: boolean;
        data?: {
            paths: RoutePath[];
        };
        error?: string;
    }>;
    /**
     * Override getRoutes to return wrapped format by default for backward compatibility
     */
    getRoutesLegacy(request: GetRoutesRequest): Promise<{
        success: boolean;
        data?: {
            paths: RoutePath[];
        };
        error?: string;
    }>;
    /**
     * Get the optimal route for a swap
     */
    getBestRoute(request: GetRoutesRequest): Promise<RoutePath | null>;
    /**
     * Simulate a swap to get expected output
     */
    simulateSwap(request: {
        amount_in: string;
        token_in: string;
        token_out: string;
        chain_uid?: string;
    }): Promise<{
        amount_out: string;
        price_impact: string;
    }>;
    /**
     * Create a swap transaction
     */
    createSwapTransaction(request: SwapRequest): Promise<TransactionResponse>;
    /**
     * Create a swap transaction with wrapped response
     */
    createSwapTransactionWrapped(request: SwapRequest): Promise<{
        success: boolean;
        data?: TransactionResponse;
        error?: string;
    }>;
    /**
     * Create a swap transaction (legacy method name)
     */
    buildSwapTransaction(request: SwapRequest): Promise<TransactionResponse>;
    /**
     * Create add liquidity transaction (legacy method name)
     */
    createAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse>;
    /**
     * Create add liquidity transaction with wrapped response
     */
    createAddLiquidityTransactionWrapped(request: AddLiquidityRequest): Promise<{
        success: boolean;
        data?: TransactionResponse;
        error?: string;
    }>;
    /**
     * Create remove liquidity transaction (legacy method name)
     */
    createRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse>;
    /**
     * Create remove liquidity transaction with wrapped response
     */
    createRemoveLiquidityTransactionWrapped(request: RemoveLiquidityRequest): Promise<{
        success: boolean;
        data?: TransactionResponse;
        error?: string;
    }>;
    /**
     * Track transaction status (placeholder - not implemented in Euclid API)
     */
    trackTransaction(txHash: string, chainUID: string): Promise<{
        status: 'pending' | 'confirmed' | 'failed';
    }>;
    /**
     * Track transaction status with wrapped response
     */
    trackTransactionWrapped(txHash: string, chainUID: string): Promise<{
        success: boolean;
        data?: {
            status: 'pending' | 'confirmed' | 'failed';
        };
        error?: string;
    }>;
    /**
     * Build an add liquidity transaction
     */
    buildAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse>;
    /**
     * Build a remove liquidity transaction
     */
    buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse>;
    /**
     * Get transaction status
     */
    getTransactionStatus(txHash: string, chainUID: string): Promise<{
        status: 'pending' | 'success' | 'failed';
        blockHeight?: number;
        gasUsed?: string;
        fee?: string;
    }>;
    /**
     * Estimate gas for a transaction
     */
    estimateGas(transaction: TransactionResponse): Promise<{
        gasLimit: string;
        gasPrice: string;
    }>;
    /**
     * Get comprehensive market data
     */
    getMarketData(): Promise<{
        chains: EuclidChainConfig[];
        tokens: TokenMetadata[];
        pools: PoolInfo[];
    }>;
    /**
     * Get user's complete portfolio
     */
    getUserPortfolio(user: CrossChainUser): Promise<{
        balances: UserBalance[];
        chains: EuclidChainConfig[];
        tokens: TokenMetadata[];
    }>;
    /**
     * Get quote for a swap with the best route
     */
    getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string, chainUIDs?: string[]): Promise<{
        route: RoutePath | null;
        expectedOutput: string;
        priceImpact: string;
    }>;
}
export declare const apiClient: EuclidAPIClient;
export type { EuclidChainConfig, TokenMetadata, PoolInfo, UserBalance, RoutePath, SwapRequest, AddLiquidityRequest, RemoveLiquidityRequest, TransactionResponse, CrossChainUser, GetRoutesRequest } from './types/api.types';
//# sourceMappingURL=api-client.d.ts.map