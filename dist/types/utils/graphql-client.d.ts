import type { EuclidChainConfig, TokenMetadata, PoolInfo, UserBalance, CrossChainUser } from './types/api.types';
/**
 * GraphQL client for Euclid Protocol
 * Handles all GraphQL queries to the Euclid API
 */
export declare class EuclidGraphQLClient {
    private endpoint;
    constructor(endpoint?: string);
    /**
     * Execute a GraphQL query
     */
    private query;
    /**
     * Get all supported chains
     */
    getChains(variables?: {
        showAllChains?: boolean;
        type?: string;
    }): Promise<EuclidChainConfig[]>;
    /**
     * Get token metadata
     */
    getTokenMetadata(variables?: {
        limit?: number;
        offset?: number;
        verified?: boolean;
        dex?: string[];
        chainUids?: string[];
        showVolume?: boolean;
        search?: string;
    }): Promise<TokenMetadata[]>;
    /**
     * Get all liquidity pools with proper TVL and APR data
     * @param chainUid - Optional chain filter (unused for now)
     * @param onlyVerified - Whether to show only verified pools (default: true)
     */
    getAllPools(_chainUid?: string, onlyVerified?: boolean): Promise<PoolInfo[]>; /**
     * Get user balances across all chains
     */
    getUserBalances(user: CrossChainUser): Promise<UserBalance[]>;
    /**
     * Get pool information for a specific pair
     */
    getPoolInfo(token1: string, token2: string): Promise<PoolInfo | null>;
    /**
     * Search tokens by symbol or name
     */
    searchTokens(searchTerm: string, chainUID?: string): Promise<TokenMetadata[]>;
    /**
     * Get token by symbol and chain
     */
    getTokenBySymbol(symbol: string, chainUID: string): Promise<TokenMetadata | null>;
}
export declare const euclidGraphQLClient: EuclidGraphQLClient;
//# sourceMappingURL=graphql-client.d.ts.map