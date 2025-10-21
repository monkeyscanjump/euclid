/**
 * Unified API Client for Euclid Protocol
 * Combines GraphQL and REST clients for a single interface
 */
import { euclidGraphQLClient } from "./graphql-client";
import { euclidRESTClient } from "./rest-client";
/**
 * Main API client that provides a unified interface to Euclid Protocol
 * Uses dedicated GraphQL and REST clients under the hood
 */
export class EuclidAPIClient {
    constructor() {
        this.graphql = euclidGraphQLClient;
        this.rest = euclidRESTClient;
    }
    // ============================================================================
    // CHAIN & TOKEN METADATA (GraphQL)
    // ============================================================================
    /**
     * Get all supported blockchain networks
     */
    async getChains(options) {
        return this.graphql.getChains(options);
    }
    /**
     * Get token metadata information
     */
    async getTokenMetadata(options) {
        return this.graphql.getTokenMetadata(options);
    }
    /**
     * Search for tokens by symbol or name
     */
    async searchTokens(searchTerm, chainUID) {
        return this.graphql.searchTokens(searchTerm, chainUID);
    }
    /**
     * Get a specific token by symbol and chain
     */
    async getTokenBySymbol(symbol, chainUID) {
        return this.graphql.getTokenBySymbol(symbol, chainUID);
    }
    // ============================================================================
    // LIQUIDITY POOLS (GraphQL)
    // ============================================================================
    /**
     * Get all liquidity pools
     * @param onlyVerified - Whether to show only verified pools (default: true)
     */
    async getAllPools(onlyVerified = true) {
        try {
            const data = await this.graphql.getAllPools(undefined, onlyVerified);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get pools' };
        }
    }
    /**
     * Get pool information for a specific token pair
     */
    async getPoolInfo(token1, token2) {
        return this.graphql.getPoolInfo(token1, token2);
    }
    // ============================================================================
    // LEGACY METHOD ALIASES FOR BACKWARD COMPATIBILITY
    // ============================================================================
    /**
     * @deprecated Use getChains() instead
     */
    async getAllChains(showAllChains) {
        try {
            const data = await this.getChains({ showAllChains });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get chains' };
        }
    }
    /**
     * @deprecated Use getTokenMetadata() instead
     */
    async getAllTokens() {
        try {
            const data = await this.getTokenMetadata();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get tokens' };
        }
    }
    /**
     * Get token denominations for a token ID (placeholder - not implemented in Euclid API)
     */
    async getTokenDenoms(tokenId) {
        // This method doesn't exist in the real Euclid API
        console.warn(`getTokenDenoms(${tokenId}) is not implemented in Euclid API`);
        return { success: true, data: { router: { token_denoms: { denoms: [] } } } };
    }
    /**
     * Get escrow information for a token (placeholder - not implemented in Euclid API)
     */
    async getEscrows(tokenId) {
        // This method doesn't exist in the real Euclid API
        console.warn(`getEscrows(${tokenId}) is not implemented in Euclid API`);
        return { success: true, data: { router: { escrows: [] } } };
    }
    /**
     * Get balance for a specific address and chain (legacy compatibility)
     */
    async getBalance(address, chainUID) {
        try {
            const balances = await this.getUserBalances({ address, chain_uid: chainUID });
            const data = {
                balance: {
                    all: balances.map(b => ({
                        denom: b.token,
                        amount: b.balance
                    }))
                }
            };
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get balance' };
        }
    }
    // ============================================================================
    // USER DATA (GraphQL)
    // ============================================================================
    /**
     * Get user token balances across all chains
     */
    async getUserBalances(user) {
        return this.graphql.getUserBalances(user);
    }
    // ============================================================================
    // ROUTING & SWAPS (REST)
    // ============================================================================
    /**
     * Get routing paths for a swap
     */
    async getRoutes(request) {
        return this.rest.getRoutes(request);
    }
    /**
     * Legacy method that returns wrapped response format (used by swap controller)
     */
    async getRoutesWrapped(request) {
        try {
            const paths = await this.getRoutes(request);
            return { success: true, data: { paths } };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get routes' };
        }
    }
    /**
     * Override getRoutes to return wrapped format by default for backward compatibility
     */
    async getRoutesLegacy(request) {
        return this.getRoutesWrapped(request);
    }
    /**
     * Get the optimal route for a swap
     */
    async getBestRoute(request) {
        return this.rest.getBestRoute(request);
    }
    /**
     * Simulate a swap to get expected output
     */
    async simulateSwap(request) {
        return this.rest.simulateSwap(request);
    }
    // ============================================================================
    // TRANSACTION BUILDING (REST)
    // ============================================================================
    /**
     * Create a swap transaction
     */
    async createSwapTransaction(request) {
        return this.rest.buildSwapTransaction(request);
    }
    /**
     * Create a swap transaction with wrapped response
     */
    async createSwapTransactionWrapped(request) {
        try {
            const data = await this.createSwapTransaction(request);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create swap transaction' };
        }
    }
    /**
     * Create a swap transaction (legacy method name)
     */
    async buildSwapTransaction(request) {
        return this.createSwapTransaction(request);
    }
    /**
     * Create add liquidity transaction (legacy method name)
     */
    async createAddLiquidityTransaction(request) {
        return this.rest.buildAddLiquidityTransaction(request);
    }
    /**
     * Create add liquidity transaction with wrapped response
     */
    async createAddLiquidityTransactionWrapped(request) {
        try {
            const data = await this.createAddLiquidityTransaction(request);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create add liquidity transaction' };
        }
    }
    /**
     * Create remove liquidity transaction (legacy method name)
     */
    async createRemoveLiquidityTransaction(request) {
        return this.rest.buildRemoveLiquidityTransaction(request);
    }
    /**
     * Create remove liquidity transaction with wrapped response
     */
    async createRemoveLiquidityTransactionWrapped(request) {
        try {
            const data = await this.createRemoveLiquidityTransaction(request);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create remove liquidity transaction' };
        }
    }
    /**
     * Track transaction status (placeholder - not implemented in Euclid API)
     */
    async trackTransaction(txHash, chainUID) {
        // This would typically query blockchain for transaction status
        console.warn(`trackTransaction(${txHash}, ${chainUID}) not implemented`);
        return { status: 'pending' };
    }
    /**
     * Track transaction status with wrapped response
     */
    async trackTransactionWrapped(txHash, chainUID) {
        try {
            const data = await this.trackTransaction(txHash, chainUID);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to track transaction' };
        }
    }
    /**
     * Build an add liquidity transaction
     */
    async buildAddLiquidityTransaction(request) {
        return this.rest.buildAddLiquidityTransaction(request);
    }
    /**
     * Build a remove liquidity transaction
     */
    async buildRemoveLiquidityTransaction(request) {
        return this.rest.buildRemoveLiquidityTransaction(request);
    }
    // ============================================================================
    // TRANSACTION STATUS & GAS ESTIMATION (REST)
    // ============================================================================
    /**
     * Get transaction status
     */
    async getTransactionStatus(txHash, chainUID) {
        return this.rest.getTransactionStatus(txHash, chainUID);
    }
    /**
     * Estimate gas for a transaction
     */
    async estimateGas(transaction) {
        return this.rest.estimateGas(transaction);
    }
    // ============================================================================
    // CONVENIENCE METHODS
    // ============================================================================
    /**
     * Get comprehensive market data
     */
    async getMarketData() {
        const [chains, tokens, poolsResult] = await Promise.all([
            this.getChains(),
            this.getTokenMetadata(),
            this.getAllPools(),
        ]);
        const pools = poolsResult.success ? (poolsResult.data || []) : [];
        return { chains, tokens, pools };
    }
    /**
     * Get user's complete portfolio
     */
    async getUserPortfolio(user) {
        const [balances, chains, tokens] = await Promise.all([
            this.getUserBalances(user),
            this.getChains(),
            this.getTokenMetadata(),
        ]);
        return { balances, chains, tokens };
    }
    /**
     * Get quote for a swap with the best route
     */
    async getSwapQuote(tokenIn, tokenOut, amountIn, chainUIDs) {
        const routeRequest = {
            amount_in: amountIn,
            token_in: tokenIn,
            token_out: tokenOut,
            chain_uids: chainUIDs,
        };
        const [route, simulation] = await Promise.all([
            this.getBestRoute(routeRequest),
            this.simulateSwap({
                amount_in: amountIn,
                token_in: tokenIn,
                token_out: tokenOut,
            }).catch(() => ({ amount_out: '0', price_impact: '0' })),
        ]);
        return {
            route,
            expectedOutput: simulation.amount_out,
            priceImpact: simulation.price_impact,
        };
    }
}
// Export the default instance
export const apiClient = new EuclidAPIClient();
//# sourceMappingURL=api-client.js.map
