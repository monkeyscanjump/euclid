/**
 * Smart Euclid API Service
 * Lazy-loading API service that only loads endpoints when needed
 */

import { createDynamicRegistry, type DynamicEndpointRegistry } from './endpoints/registry';
import { DEFAULT_CONFIG } from './env';
import type { EuclidConfig } from './env';
import type {
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest
} from './types/api.types';

/**
 * Smart API Service with lazy-loading endpoints
 * Only loads endpoint definitions when methods are actually called
 */
export class SmartEuclidAPIService {
  private registry: DynamicEndpointRegistry;

  constructor(config?: Partial<EuclidConfig>) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Create dynamic registry - no endpoints loaded yet!
    this.registry = createDynamicRegistry(
      finalConfig.graphqlEndpoint,
      finalConfig.restEndpoint
    );
  }

  // ============================================================================
  // CHAIN ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Get chains data - automatically loads chain endpoints on first call
   */
  async getChains(options?: { showAllChains?: boolean; type?: string }) {
    const endpoint = await this.registry.getEndpoint('getChains');
    return endpoint({ variables: options });
  }

  // ============================================================================
  // TOKEN ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Get token metadata - automatically loads token endpoints on first call
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
    const endpoint = await this.registry.getEndpoint('getTokenMetadata');
    return endpoint({ variables: options });
  }

  /**
   * Get token by ID - loads token endpoints if needed
   */
  async getTokenById(tokenId: string) {
    const endpoint = await this.registry.getEndpoint('getTokenById');
    return endpoint({ variables: { tokenId } });
  }

  /**
   * Get token price history - loads token endpoints if needed
   */
  async getTokenPriceHistory(tokenId: string, period: '1h' | '24h' | '7d' | '30d' | '1y' = '24h') {
    const endpoint = await this.registry.getEndpoint('getTokenPriceHistory');
    return endpoint({ variables: { tokenId, period } });
  }

  // ============================================================================
  // POOL ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Get all pools - automatically loads pool endpoints on first call
   */
  async getAllPools(onlyVerified: boolean = true, limit: number = 1000) {
    const endpoint = await this.registry.getEndpoint('getAllPools');
    return endpoint({ variables: { limit, onlyShowVerified: onlyVerified } });
  }

  /**
   * Get pool by ID - loads pool endpoints if needed
   */
  async getPoolById(poolId: string) {
    const endpoint = await this.registry.getEndpoint('getPoolById');
    return endpoint({ variables: { poolId } });
  }

  /**
   * Get pool statistics - loads pool endpoints if needed
   */
  async getPoolStatistics(poolId: string, timeframe: '24h' | '7d' | '30d' = '24h') {
    const endpoint = await this.registry.getEndpoint('getPoolStatistics');
    return endpoint({ variables: { poolId, timeframe } });
  }

  // ============================================================================
  // USER ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Get user balances - automatically loads user endpoints on first call
   */
  async getUserBalances(user: { address: string; chain_uid: string }) {
    const endpoint = await this.registry.getEndpoint('getUserBalances');
    return endpoint({ variables: { user } });
  }

  // ============================================================================
  // ROUTING ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Get routes - automatically loads routing endpoints on first call
   */
  async getRoutes(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }) {
    const endpoint = await this.registry.getEndpoint('getRoutes');
    return endpoint({ variables: request });
  }

  /**
   * Get optimal route - loads routing endpoints if needed
   */
  async getOptimalRoute(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }) {
    const endpoint = await this.registry.getEndpoint('getOptimalRoute');
    return endpoint({ variables: request });
  }

  /**
   * Get multiple routes - loads routing endpoints if needed
   */
  async getMultiRoutes(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    strategies?: string[];
    chain_uids?: string[];
  }) {
    const endpoint = await this.registry.getEndpoint('getMultiRoutes');
    return endpoint({ variables: request });
  }

  /**
   * Get route statistics - loads routing endpoints if needed
   */
  async getRouteStatistics(timeframe?: '24h' | '7d' | '30d') {
    const endpoint = await this.registry.getEndpoint('getRouteStatistics');
    return endpoint({ variables: { timeframe } });
  }

  /**
   * Get route fees - loads routing endpoints if needed
   */
  async getRouteFees(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uids?: string[];
  }) {
    const endpoint = await this.registry.getEndpoint('getRouteFees');
    return endpoint({ variables: request });
  }

  /**
   * Simulate route - loads routing endpoints if needed
   */
  async simulateRoute(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uids?: string[];
  }) {
    const endpoint = await this.registry.getEndpoint('simulateRoute');
    return endpoint({ variables: request });
  }

  // ============================================================================
  // TRANSACTION ENDPOINTS - Loaded only when called
  // ============================================================================

  /**
   * Build swap transaction - automatically loads transaction endpoints on first call
   */
  async buildSwapTransaction(request: SwapRequest) {
    const endpoint = await this.registry.getEndpoint('buildSwapTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Build add liquidity transaction - loads transaction endpoints if needed
   */
  async buildAddLiquidityTransaction(request: AddLiquidityRequest) {
    const endpoint = await this.registry.getEndpoint('buildAddLiquidityTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Build remove liquidity transaction - loads transaction endpoints if needed
   */
  async buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest) {
    const endpoint = await this.registry.getEndpoint('buildRemoveLiquidityTransaction');
    return endpoint({ variables: request as unknown as Record<string, unknown> });
  }

  /**
   * Broadcast transaction - loads transaction endpoints if needed
   */
  async broadcastTransaction(signedTx: string, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('broadcastTransaction');
    return endpoint({ variables: { tx: signedTx, chain_uid: chainUID } });
  }

  /**
   * Get transaction status - loads transaction endpoints if needed
   */
  async getTransactionStatus(txHash: string, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('getTransactionStatus');
    return endpoint({ variables: { txHash, chain_uid: chainUID } });
  }

  /**
   * Get transaction details - loads transaction endpoints if needed
   */
  async getTransactionDetails(txHash: string, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('getTransactionDetails');
    return endpoint({ variables: { txHash, chain_uid: chainUID } });
  }

  /**
   * Estimate transaction fees - loads transaction endpoints if needed
   */
  async estimateTransactionFees(transaction: object, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('estimateTransactionFees');
    return endpoint({ variables: { transaction, chain_uid: chainUID } });
  }

  /**
   * Simulate transaction - loads transaction endpoints if needed
   */
  async simulateTransaction(transaction: object, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('simulateTransaction');
    return endpoint({ variables: { transaction, chain_uid: chainUID } });
  }

  /**
   * Get user transactions - loads transaction endpoints if needed
   */
  async getUserTransactions(address: string, chainUID: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: 'success' | 'failed';
  }) {
    const endpoint = await this.registry.getEndpoint('getUserTransactions');
    return endpoint({
      variables: {
        address,
        chain_uid: chainUID,
        ...options
      }
    });
  }

  /**
   * Get pending transactions - loads transaction endpoints if needed
   */
  async getPendingTransactions(address: string, chainUID: string) {
    const endpoint = await this.registry.getEndpoint('getPendingTransactions');
    return endpoint({ variables: { address, chain_uid: chainUID } });
  }

  /**
   * Batch transactions - loads transaction endpoints if needed
   */
  async batchTransactions(transactions: Array<{
    transaction: object;
    chain_uid: string;
  }>) {
    const endpoint = await this.registry.getEndpoint('batchTransactions');
    return endpoint({ variables: { transactions } });
  }

  // ============================================================================
  // PERFORMANCE OPTIMIZATION METHODS
  // ============================================================================

  /**
   * Pre-load endpoints for a specific category to improve performance
   * Use this when you know you'll need multiple endpoints from a category
   */
  async preloadCategory(categoryName: 'chains' | 'tokens' | 'pools' | 'routing' | 'transactions' | 'user'): Promise<void> {
    await this.registry.preloadCategory(categoryName);
  }

  /**
   * Pre-load specific endpoints in batch
   * Use this when you know exactly which endpoints you'll need
   */
  async preloadEndpoints(endpointIds: string[]): Promise<void> {
    await this.registry.preloadEndpoints(endpointIds);
  }

  /**
   * Get performance and loading statistics
   */
  getPerformanceStats(): {
    loader: ReturnType<DynamicEndpointRegistry['getStats']>['loader'];
    registry: ReturnType<DynamicEndpointRegistry['getStats']>['registry'];
  } {
    return this.registry.getStats();
  }

  /**
   * Check if an endpoint is available without loading it
   */
  isEndpointAvailable(endpointId: string): boolean {
    return this.registry.isEndpointAvailable(endpointId);
  }

  /**
   * Check if an endpoint is loaded and ready
   */
  isEndpointLoaded(endpointId: string): boolean {
    return this.registry.isEndpointLoaded(endpointId);
  }

  /**
   * Get all available endpoint IDs
   */
  getAllEndpointIds(): string[] {
    return this.registry.getAllEndpointIds();
  }

  /**
   * Get endpoint IDs for a specific category
   */
  getEndpointIdsForCategory(categoryName: string): string[] {
    return this.registry.getEndpointIdsForCategory(categoryName);
  }

  /**
   * Get the underlying registry for advanced usage
   */
  getRegistry(): DynamicEndpointRegistry {
    return this.registry;
  }
}

// Export default instance with smart lazy loading
export const smartEuclidAPIService = new SmartEuclidAPIService();

// Export factory function for custom configurations
export const createSmartEuclidAPIService = (config?: Partial<EuclidConfig>) => {
  return new SmartEuclidAPIService(config);
};
