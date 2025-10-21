// REST API endpoint for Euclid testnet
const EUCLID_REST_ENDPOINT = 'https://testnet.api.euclidprotocol.com/api/v1';
/**
 * REST client for Euclid Protocol
 * Handles all REST API calls for transactions, routing, and operations
 */
export class EuclidRESTClient {
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
export const euclidRESTClient = new EuclidRESTClient();
//# sourceMappingURL=rest-client.js.map
