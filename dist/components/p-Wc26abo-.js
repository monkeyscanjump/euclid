// GraphQL endpoint for Euclid testnet
const EUCLID_GRAPHQL_ENDPOINT = 'https://testnet.api.euclidprotocol.com/graphql';
/**
 * GraphQL client for Euclid Protocol
 * Handles all GraphQL queries to the Euclid API
 */
class EuclidGraphQLClient {
    constructor(endpoint = EUCLID_GRAPHQL_ENDPOINT) {
        this.endpoint = endpoint;
    }
    /**
     * Execute a GraphQL query
     */
    async query(query, variables) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: variables || {},
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.errors) {
                throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            return {
                success: true,
                data: result.data,
            };
        }
        catch (error) {
            console.error('GraphQL query failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Get all supported chains
     */
    async getChains(variables) {
        const query = `
      query Chains($showAllChains: Boolean, $type: String) {
        chains {
          all_chains(show_all_chains: $showAllChains, type: $type) {
            chain_id
            chain_uid
            display_name
            factory_address
            token_factory_address
            explorer_url
            logo
            type
          }
        }
      }
    `;
        const result = await this.query(query, variables);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch chains');
        }
        return result.data.chains.all_chains;
    }
    /**
     * Get token metadata
     */
    async getTokenMetadata(variables) {
        const query = `
      query Token(
        $limit: Int,
        $offset: Int,
        $verified: Boolean,
        $dex: [String!],
        $chainUids: [String!],
        $showVolume: Boolean,
        $search: String
      ) {
        token {
          token_metadatas(
            limit: $limit,
            offset: $offset,
            verified: $verified,
            dex: $dex,
            chain_uids: $chainUids,
            show_volume: $showVolume,
            search: $search
          ) {
            coinDecimal
            displayName
            tokenId
            description
            image
            price
            price_change_24h
            price_change_7d
            dex
            chain_uids
            total_volume
            total_volume_24h
            tags
            min_swap_value
            social
            is_verified
          }
        }
      }
    `;
        const result = await this.query(query, variables);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch token metadata');
        }
        return result.data.token.token_metadatas;
    }
    /**
     * Get all liquidity pools with proper TVL and APR data
     * @param chainUid - Optional chain filter (unused for now)
     * @param onlyVerified - Whether to show only verified pools (default: true)
     */
    async getAllPools(_chainUid, onlyVerified = true) {
        try {
            const query = `
        query Token_pair_with_liquidity($limit: Int, $onlyShowVerified: Boolean) {
          pool {
            token_pair_with_liquidity(limit: $limit, only_show_verified: $onlyShowVerified) {
              results {
                pair {
                  token_1
                  token_2
                }
                vlp
                total_liquidity
                apr
                tags
                created_at
              }
              pagination {
                total_count
                limit
                offset
              }
            }
          }
        }
      `;
            const result = await this.query(query, {
                limit: 1000,
                onlyShowVerified: onlyVerified
            });
            if (!result.success || !result.data?.pool?.token_pair_with_liquidity?.results) {
                throw new Error(result.error || 'Failed to fetch pools with liquidity data');
            }
            // Transform the API response to our PoolInfo interface
            const pools = result.data.pool.token_pair_with_liquidity.results.map((pool) => {
                return {
                    pool_id: `${pool.pair.token_1}-${pool.pair.token_2}`,
                    token_1: pool.pair.token_1,
                    token_2: pool.pair.token_2,
                    total_liquidity: pool.total_liquidity,
                    volume_24h: '0', // This API doesn't provide volume data
                    fees_24h: '0', // This API doesn't provide fees data
                    apr: pool.apr,
                };
            });
            console.log(`✅ Loaded ${pools.length} pools with real liquidity and APR data from official API`);
            return pools;
        }
        catch (error) {
            console.error('Failed to fetch pools with liquidity data:', error);
            return [];
        }
    } /**
     * Get user balances across all chains
     */
    async getUserBalances(user) {
        const query = `
      query Vcoin($user: CrossChainUserInput) {
        vcoin {
          user_balance(user: $user) {
            balances {
              amount
              token_id
            }
          }
        }
      }
    `;
        const variables = {
            user: {
                address: user.address,
                chain_uid: user.chain_uid,
            },
        };
        const result = await this.query(query, variables);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch user balances');
        }
        return result.data.vcoin.user_balance.balances;
    }
    /**
     * Get pool information for a specific pair
     */
    async getPoolInfo(token1, token2) {
        const pools = await this.getAllPools();
        return pools.find(pool => (pool.token_1 === token1 && pool.token_2 === token2) ||
            (pool.token_1 === token2 && pool.token_2 === token1)) || null;
    }
    /**
     * Search tokens by symbol or name
     */
    async searchTokens(searchTerm, chainUID) {
        const options = { search: searchTerm };
        if (chainUID) {
            options.chainUids = [chainUID];
        }
        const tokens = await this.getTokenMetadata(options);
        const lowerSearchTerm = searchTerm.toLowerCase();
        return tokens.filter(token => token.displayName?.toLowerCase().includes(lowerSearchTerm) ||
            token.tokenId?.toLowerCase().includes(lowerSearchTerm) ||
            token.description?.toLowerCase().includes(lowerSearchTerm) ||
            // Legacy field fallbacks
            token.symbol?.toLowerCase().includes(lowerSearchTerm) ||
            token.name?.toLowerCase().includes(lowerSearchTerm));
    }
    /**
     * Get token by symbol and chain
     */
    async getTokenBySymbol(symbol, chainUID) {
        const tokens = await this.getTokenMetadata({ chainUids: [chainUID] });
        // Use displayName (symbol equivalent) for comparison, with fallback to legacy fields
        return tokens.find(token => token.displayName?.toLowerCase() === symbol.toLowerCase() ||
            token.symbol?.toLowerCase() === symbol.toLowerCase()) || null;
    }
}
// Export a default instance
const euclidGraphQLClient = new EuclidGraphQLClient();

// REST API endpoint for Euclid testnet
const EUCLID_REST_ENDPOINT = 'https://testnet.api.euclidprotocol.com/api/v1';
/**
 * REST client for Euclid Protocol
 * Handles all REST API calls for transactions, routing, and operations
 */
class EuclidRESTClient {
    constructor(endpoint = EUCLID_REST_ENDPOINT) {
        this.endpoint = endpoint;
    }
    /**
     * Execute a REST API request
     */
    async request(path, options = {}) {
        try {
            const { method = 'GET', body, headers = {} } = options;
            const response = await fetch(`${this.endpoint}${path}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...headers,
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error(`REST API request failed (${path}):`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Get routing paths for a swap
     */
    async getRoutes(request) {
        const queryParams = new URLSearchParams({
            amount_in: request.amount_in,
            token_in: request.token_in,
            token_out: request.token_out,
        });
        if (request.external !== undefined) {
            queryParams.append('external', request.external.toString());
        }
        if (request.chain_uids && request.chain_uids.length > 0) {
            request.chain_uids.forEach(chainUID => {
                queryParams.append('chain_uids', chainUID);
            });
        }
        const result = await this.request(`/routes?${queryParams}`);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch routes');
        }
        return result.data.paths;
    }
    /**
     * Build a swap transaction
     */
    async buildSwapTransaction(request) {
        const result = await this.request('/swap', {
            method: 'POST',
            body: request,
        });
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to build swap transaction');
        }
        return result.data;
    }
    /**
     * Build an add liquidity transaction
     */
    async buildAddLiquidityTransaction(request) {
        const result = await this.request('/add_liquidity', {
            method: 'POST',
            body: request,
        });
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to build add liquidity transaction');
        }
        return result.data;
    }
    /**
     * Build a remove liquidity transaction
     */
    async buildRemoveLiquidityTransaction(request) {
        const result = await this.request('/remove_liquidity', {
            method: 'POST',
            body: request,
        });
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to build remove liquidity transaction');
        }
        return result.data;
    }
    /**
     * Simulate a swap to get expected output
     */
    async simulateSwap(request) {
        const queryParams = new URLSearchParams({
            amount_in: request.amount_in,
            token_in: request.token_in,
            token_out: request.token_out,
        });
        if (request.chain_uid) {
            queryParams.append('chain_uid', request.chain_uid);
        }
        const result = await this.request(`/simulate_swap?${queryParams}`);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to simulate swap');
        }
        return result.data;
    }
    /**
     * Get optimal route for a swap with the best price
     */
    async getBestRoute(request) {
        const routes = await this.getRoutes(request);
        if (routes.length === 0) {
            return null;
        }
        // Sort by total price impact (lower is better)
        return routes.sort((a, b) => parseFloat(a.total_price_impact) - parseFloat(b.total_price_impact))[0];
    }
    /**
     * Get transaction status
     */
    async getTransactionStatus(txHash, chainUID) {
        const result = await this.request(`/transaction/${txHash}?chain_uid=${chainUID}`);
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to get transaction status');
        }
        return result.data;
    }
    /**
     * Get gas estimate for a transaction
     */
    async estimateGas(transaction) {
        const result = await this.request('/estimate_gas', {
            method: 'POST',
            body: transaction,
        });
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to estimate gas');
        }
        return result.data;
    }
}
// Export a default instance
const euclidRESTClient = new EuclidRESTClient();

/**
 * Unified API Client for Euclid Protocol
 * Combines GraphQL and REST clients for a single interface
 */
/**
 * Main API client that provides a unified interface to Euclid Protocol
 * Uses dedicated GraphQL and REST clients under the hood
 */
class EuclidAPIClient {
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
const apiClient = new EuclidAPIClient();

export { apiClient as a };
//# sourceMappingURL=p-Wc26abo-.js.map

//# sourceMappingURL=p-Wc26abo-.js.map