/**
 * Unified API Client for Euclid Protocol
 * Combines GraphQL and REST clients for a single interface
 */

import { euclidGraphQLClient } from './graphql-client';
import { euclidRESTClient } from './rest-client';
import type {
  EuclidChainConfig,
  TokenMetadata,
  PoolInfo,
  UserBalance,
  RoutePath,
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest,
  TransactionResponse,
  CrossChainUser,
  GetRoutesRequest
} from './types/api.types';

/**
 * Main API client that provides a unified interface to Euclid Protocol
 * Uses dedicated GraphQL and REST clients under the hood
 */
export class EuclidAPIClient {
  private graphql = euclidGraphQLClient;
  private rest = euclidRESTClient;

  // ============================================================================
  // CHAIN & TOKEN METADATA (GraphQL)
  // ============================================================================

  /**
   * Get all supported blockchain networks
   */
  async getChains(options?: { showAllChains?: boolean; type?: string }): Promise<EuclidChainConfig[]> {
    return this.graphql.getChains(options);
  }

  /**
   * Get token metadata information
   */
  async getTokenMetadata(options?: {
    limit?: number;
    offset?: number;
    verified?: boolean;
    dex?: string[];
    chainUids?: string[];
    showVolume?: boolean;
    search?: string;
  }): Promise<TokenMetadata[]> {
    return this.graphql.getTokenMetadata(options);
  }

  /**
   * Search for tokens by symbol or name
   */
  async searchTokens(searchTerm: string, chainUID?: string): Promise<TokenMetadata[]> {
    return this.graphql.searchTokens(searchTerm, chainUID);
  }

  /**
   * Get a specific token by symbol and chain
   */
  async getTokenBySymbol(symbol: string, chainUID: string): Promise<TokenMetadata | null> {
    return this.graphql.getTokenBySymbol(symbol, chainUID);
  }

  // ============================================================================
  // LIQUIDITY POOLS (GraphQL)
  // ============================================================================

  /**
   * Get all liquidity pools
   * @param onlyVerified - Whether to show only verified pools (default: true)
   */
  async getAllPools(onlyVerified: boolean = true): Promise<{ success: boolean; data?: PoolInfo[]; error?: string }> {
    try {
      const data = await this.graphql.getAllPools(undefined, onlyVerified);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get pools' };
    }
  }

  /**
   * Get pool information for a specific token pair
   */
  async getPoolInfo(token1: string, token2: string): Promise<PoolInfo | null> {
    return this.graphql.getPoolInfo(token1, token2);
  }

  // ============================================================================
  // LEGACY METHOD ALIASES FOR BACKWARD COMPATIBILITY
  // ============================================================================

  /**
   * @deprecated Use getChains() instead
   */
  async getAllChains(showAllChains?: boolean): Promise<{ success: boolean; data?: EuclidChainConfig[]; error?: string }> {
    try {
      const data = await this.getChains({ showAllChains });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get chains' };
    }
  }

  /**
   * @deprecated Use getTokenMetadata() instead
   */
  async getAllTokens(): Promise<{ success: boolean; data?: TokenMetadata[]; error?: string }> {
    try {
      const data = await this.getTokenMetadata();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get tokens' };
    }
  }

  /**
   * Get token denominations for a token ID (placeholder - not implemented in Euclid API)
   */
  async getTokenDenoms(tokenId: string): Promise<{ success: boolean; data?: { router: { token_denoms: { denoms: string[] } } }; error?: string }> {
    // This method doesn't exist in the real Euclid API
    console.warn(`getTokenDenoms(${tokenId}) is not implemented in Euclid API`);
    return { success: true, data: { router: { token_denoms: { denoms: [] } } } };
  }

  /**
   * Get escrow information for a token (placeholder - not implemented in Euclid API)
   */
  async getEscrows(tokenId: string): Promise<{ success: boolean; data?: { router: { escrows: unknown[] } }; error?: string }> {
    // This method doesn't exist in the real Euclid API
    console.warn(`getEscrows(${tokenId}) is not implemented in Euclid API`);
    return { success: true, data: { router: { escrows: [] } } };
  }

  /**
   * Get balance for a specific address and chain (legacy compatibility)
   */
  async getBalance(address: string, chainUID: string): Promise<{ success: boolean; data?: { balance?: { all?: Array<{ denom: string; amount: string }> } }; error?: string }> {
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
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get balance' };
    }
  }

  // ============================================================================
  // USER DATA (GraphQL)
  // ============================================================================

  /**
   * Get user token balances across all chains
   */
  async getUserBalances(user: CrossChainUser): Promise<UserBalance[]> {
    return this.graphql.getUserBalances(user);
  }

  // ============================================================================
  // ROUTING & SWAPS (REST)
  // ============================================================================

  /**
   * Get routing paths for a swap
   */
  async getRoutes(request: GetRoutesRequest): Promise<RoutePath[]> {
    return this.rest.getRoutes(request);
  }

  /**
   * Legacy method that returns wrapped response format (used by swap controller)
   */
  async getRoutesWrapped(request: GetRoutesRequest): Promise<{ success: boolean; data?: { paths: RoutePath[] }; error?: string }> {
    try {
      const paths = await this.getRoutes(request);
      return { success: true, data: { paths } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get routes' };
    }
  }

  /**
   * Override getRoutes to return wrapped format by default for backward compatibility
   */
  async getRoutesLegacy(request: GetRoutesRequest): Promise<{ success: boolean; data?: { paths: RoutePath[] }; error?: string }> {
    return this.getRoutesWrapped(request);
  }

  /**
   * Get the optimal route for a swap
   */
  async getBestRoute(request: GetRoutesRequest): Promise<RoutePath | null> {
    return this.rest.getBestRoute(request);
  }

  /**
   * Simulate a swap to get expected output
   */
  async simulateSwap(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uid?: string;
  }): Promise<{ amount_out: string; price_impact: string }> {
    return this.rest.simulateSwap(request);
  }

  // ============================================================================
  // TRANSACTION BUILDING (REST)
  // ============================================================================

  /**
   * Create a swap transaction
   */
  async createSwapTransaction(request: SwapRequest): Promise<TransactionResponse> {
    return this.rest.buildSwapTransaction(request);
  }

  /**
   * Create a swap transaction with wrapped response
   */
  async createSwapTransactionWrapped(request: SwapRequest): Promise<{ success: boolean; data?: TransactionResponse; error?: string }> {
    try {
      const data = await this.createSwapTransaction(request);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create swap transaction' };
    }
  }

  /**
   * Create a swap transaction (legacy method name)
   */
  async buildSwapTransaction(request: SwapRequest): Promise<TransactionResponse> {
    return this.createSwapTransaction(request);
  }

  /**
   * Create add liquidity transaction (legacy method name)
   */
  async createAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse> {
    return this.rest.buildAddLiquidityTransaction(request);
  }

  /**
   * Create add liquidity transaction with wrapped response
   */
  async createAddLiquidityTransactionWrapped(request: AddLiquidityRequest): Promise<{ success: boolean; data?: TransactionResponse; error?: string }> {
    try {
      const data = await this.createAddLiquidityTransaction(request);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create add liquidity transaction' };
    }
  }

  /**
   * Create remove liquidity transaction (legacy method name)
   */
  async createRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse> {
    return this.rest.buildRemoveLiquidityTransaction(request);
  }

  /**
   * Create remove liquidity transaction with wrapped response
   */
  async createRemoveLiquidityTransactionWrapped(request: RemoveLiquidityRequest): Promise<{ success: boolean; data?: TransactionResponse; error?: string }> {
    try {
      const data = await this.createRemoveLiquidityTransaction(request);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create remove liquidity transaction' };
    }
  }

  /**
   * Track transaction status (placeholder - not implemented in Euclid API)
   */
  async trackTransaction(txHash: string, chainUID: string): Promise<{ status: 'pending' | 'confirmed' | 'failed' }> {
    // This would typically query blockchain for transaction status
    console.warn(`trackTransaction(${txHash}, ${chainUID}) not implemented`);
    return { status: 'pending' };
  }

  /**
   * Track transaction status with wrapped response
   */
  async trackTransactionWrapped(txHash: string, chainUID: string): Promise<{ success: boolean; data?: { status: 'pending' | 'confirmed' | 'failed' }; error?: string }> {
    try {
      const data = await this.trackTransaction(txHash, chainUID);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to track transaction' };
    }
  }

  /**
   * Build an add liquidity transaction
   */
  async buildAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse> {
    return this.rest.buildAddLiquidityTransaction(request);
  }

  /**
   * Build a remove liquidity transaction
   */
  async buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse> {
    return this.rest.buildRemoveLiquidityTransaction(request);
  }

  // ============================================================================
  // TRANSACTION STATUS & GAS ESTIMATION (REST)
  // ============================================================================

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string, chainUID: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    blockHeight?: number;
    gasUsed?: string;
    fee?: string;
  }> {
    return this.rest.getTransactionStatus(txHash, chainUID);
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: TransactionResponse): Promise<{ gasLimit: string; gasPrice: string }> {
    return this.rest.estimateGas(transaction);
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Get comprehensive market data
   */
  async getMarketData(): Promise<{
    chains: EuclidChainConfig[];
    tokens: TokenMetadata[];
    pools: PoolInfo[];
  }> {
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
  async getUserPortfolio(user: CrossChainUser): Promise<{
    balances: UserBalance[];
    chains: EuclidChainConfig[];
    tokens: TokenMetadata[];
  }> {
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
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    chainUIDs?: string[]
  ): Promise<{
    route: RoutePath | null;
    expectedOutput: string;
    priceImpact: string;
  }> {
    const routeRequest: GetRoutesRequest = {
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

// Re-export types for convenience
export type {
  EuclidChainConfig,
  TokenMetadata,
  PoolInfo,
  UserBalance,
  RoutePath,
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest,
  TransactionResponse,
  CrossChainUser,
  GetRoutesRequest
} from './types/api.types';
