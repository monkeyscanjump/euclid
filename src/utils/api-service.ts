/**
 * Unified Euclid API Service
 * Uses the endpoint factory system for automatic caching, retry logic, and type safety
 */

import { createEndpointRegistry, type EndpointRegistry } from './endpoint-factory';
import { ALL_ENDPOINTS } from './endpoint-definitions';
import { DEFAULT_CONFIG } from './env';
import type { EuclidConfig } from './env';
import type {
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest
} from './types/api.types';

/**
 * Enhanced Euclid API Service with endpoint factory integration
 */
export class EuclidAPIService {
  private registry: EndpointRegistry;

  constructor(config?: Partial<EuclidConfig>) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Create endpoint registry with configured endpoints
    this.registry = createEndpointRegistry(
      finalConfig.graphqlEndpoint,
      finalConfig.restEndpoint
    );

    // Register all predefined endpoints
    this.registry.registerBatch(ALL_ENDPOINTS);
  }

  /**
   * Get chains data with automatic caching
   */
  async getChains(options?: { showAllChains?: boolean; type?: string }) {
    const endpoint = this.registry.getEndpoint('getChains');
    return endpoint({ variables: options });
  }

  /**
   * Get token metadata with automatic caching
   */
  async getTokenMetadata(options?: {
    limit?: number;
    offset?: number;
    verified?: boolean;
    dex?: string[];
    chainUids?: string[];
    showVolume?: boolean;
    search?: string;
  }) {
    const endpoint = this.registry.getEndpoint('getTokenMetadata');
    return endpoint({ variables: options });
  }

  /**
   * Get token by ID with caching
   */
  async getTokenById(tokenId: string) {
    const endpoint = this.registry.getEndpoint('getTokenById');
    return endpoint({ variables: { tokenId } });
  }

  /**
   * Get token price history with minimal caching
   */
  async getTokenPriceHistory(tokenId: string, period: '1h' | '24h' | '7d' | '30d' | '1y' = '24h') {
    const endpoint = this.registry.getEndpoint('getTokenPriceHistory');
    return endpoint({ variables: { tokenId, period } });
  }

  /**
   * Get all pools with caching
   */
  async getAllPools(onlyVerified: boolean = true, limit: number = 1000) {
    const endpoint = this.registry.getEndpoint('getAllPools');
    return endpoint({ variables: { limit, onlyShowVerified: onlyVerified } });
  }

  /**
   * Get pool by ID with caching
   */
  async getPoolById(poolId: string) {
    const endpoint = this.registry.getEndpoint('getPoolById');
    return endpoint({ variables: { poolId } });
  }

  /**
   * Get pool statistics with minimal caching
   */
  async getPoolStatistics(poolId: string, timeframe: '24h' | '7d' | '30d' = '24h') {
    const endpoint = this.registry.getEndpoint('getPoolStatistics');
    return endpoint({ variables: { poolId, timeframe } });
  }

  /**
   * Get user balances with minimal caching
   */
  async getUserBalances(user: { address: string; chain_uid: string }) {
    const endpoint = this.registry.getEndpoint('getUserBalances');
    return endpoint({ variables: { user } });
  }

  /**
   * Get routes with minimal caching (high priority)
   */
  async getRoutes(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }) {
    const endpoint = this.registry.getEndpoint('getRoutes');
    return endpoint({ variables: request });
  }

  /**
   * Get optimal route with minimal caching
   */
  async getOptimalRoute(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }) {
    const endpoint = this.registry.getEndpoint('getOptimalRoute');
    return endpoint({ variables: request });
  }

  /**
   * Get multiple routes with different strategies
   */
  async getMultiRoutes(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    strategies?: string[];
    chain_uids?: string[];
  }) {
    const endpoint = this.registry.getEndpoint('getMultiRoutes');
    return endpoint({ variables: request });
  }

  /**
   * Get route statistics with moderate caching
   */
  async getRouteStatistics(timeframe?: '24h' | '7d' | '30d') {
    const endpoint = this.registry.getEndpoint('getRouteStatistics');
    return endpoint({ variables: { timeframe } });
  }

  /**
   * Get route fees with minimal caching
   */
  async getRouteFees(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uids?: string[];
  }) {
    const endpoint = this.registry.getEndpoint('getRouteFees');
    return endpoint({ variables: request });
  }

  /**
   * Simulate route (no caching)
   */
  async simulateRoute(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uids?: string[];
  }) {
    const endpoint = this.registry.getEndpoint('simulateRoute');
    return endpoint({ variables: request });
  }

  /**
   * Build swap transaction (no caching)
   */
  async buildSwapTransaction(request: SwapRequest) {
    const endpoint = this.registry.getEndpoint('buildSwapTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Build add liquidity transaction (no caching)
   */
  async buildAddLiquidityTransaction(request: AddLiquidityRequest) {
    const endpoint = this.registry.getEndpoint('buildAddLiquidityTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Build remove liquidity transaction (no caching)
   */
  async buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest) {
    const endpoint = this.registry.getEndpoint('buildRemoveLiquidityTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Broadcast transaction (no caching)
   */
  async broadcastTransaction(signedTx: string, chainUID: string) {
    const endpoint = this.registry.getEndpoint('broadcastTransaction');
    return endpoint({ variables: { tx: signedTx, chain_uid: chainUID } });
  }

  /**
   * Get transaction status with minimal caching
   */
  async getTransactionStatus(txHash: string, chainUID: string) {
    const endpoint = this.registry.getEndpoint('getTransactionStatus');
    return endpoint({ variables: { txHash, chain_uid: chainUID } });
  }

  /**
   * Get transaction details with moderate caching
   */
  async getTransactionDetails(txHash: string, chainUID: string) {
    const endpoint = this.registry.getEndpoint('getTransactionDetails');
    return endpoint({ variables: { txHash, chain_uid: chainUID } });
  }

  /**
   * Estimate transaction fees with minimal caching
   */
  async estimateTransactionFees(transaction: object, chainUID: string) {
    const endpoint = this.registry.getEndpoint('estimateTransactionFees');
    return endpoint({ variables: { transaction, chain_uid: chainUID } });
  }

  /**
   * Simulate transaction (no caching)
   */
  async simulateTransaction(transaction: object, chainUID: string) {
    const endpoint = this.registry.getEndpoint('simulateTransaction');
    return endpoint({ variables: { transaction, chain_uid: chainUID } });
  }

  /**
   * Get user transactions with moderate caching
   */
  async getUserTransactions(address: string, chainUID: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: 'success' | 'failed';
  }) {
    const endpoint = this.registry.getEndpoint('getUserTransactions');
    return endpoint({
      variables: {
        address,
        chain_uid: chainUID,
        ...options
      }
    });
  }

  /**
   * Get pending transactions with minimal caching
   */
  async getPendingTransactions(address: string, chainUID: string) {
    const endpoint = this.registry.getEndpoint('getPendingTransactions');
    return endpoint({ variables: { address, chain_uid: chainUID } });
  }

  /**
   * Batch transactions (no caching)
   */
  async batchTransactions(transactions: Array<{
    transaction: object;
    chain_uid: string;
  }>) {
    const endpoint = this.registry.getEndpoint('batchTransactions');
    return endpoint({ variables: { transactions } });
  }

  /**
   * Get endpoint registry for advanced usage
   */
  getRegistry(): EndpointRegistry {
    return this.registry;
  }

  /**
   * Register a custom endpoint
   */
  registerCustomEndpoint(config: import('./endpoint-factory').EndpointConfig): void {
    this.registry.register(config);
  }

  /**
   * Get all registered endpoints
   */
  getAllEndpoints(): import('./endpoint-factory').EndpointConfig[] {
    return this.registry.getAllEndpoints();
  }
}

// Export default instance
export const euclidAPIService = new EuclidAPIService();

// Export factory function for custom configurations
export const createEuclidAPIService = (config?: Partial<EuclidConfig>) => {
  return new EuclidAPIService(config);
};
