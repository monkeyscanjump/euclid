import type { GetRoutesRequest, RoutePath, SwapRequest, AddLiquidityRequest, RemoveLiquidityRequest, TransactionResponse } from './types/api.types';
/**
 * REST client for Euclid Protocol
 * Handles all REST API calls for transactions, routing, and operations
 */
export declare class EuclidRESTClient {
    private endpoint;
    constructor(endpoint?: string);
    /**
     * Execute a REST API request
     */
    private request;
    /**
     * Get routing paths for a swap
     */
    getRoutes(request: GetRoutesRequest): Promise<RoutePath[]>;
    /**
     * Build a swap transaction
     */
    buildSwapTransaction(request: SwapRequest): Promise<TransactionResponse>;
    /**
     * Build an add liquidity transaction
     */
    buildAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse>;
    /**
     * Build a remove liquidity transaction
     */
    buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse>;
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
     * Get optimal route for a swap with the best price
     */
    getBestRoute(request: GetRoutesRequest): Promise<RoutePath | null>;
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
     * Get gas estimate for a transaction
     */
    estimateGas(transaction: TransactionResponse): Promise<{
        gasLimit: string;
        gasPrice: string;
    }>;
}
export declare const euclidRESTClient: EuclidRESTClient;
//# sourceMappingURL=rest-client.d.ts.map