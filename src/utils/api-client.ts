/**
 * Unified API Client for Euclid Protocol
 * Combines GraphQL and REST clients for a single interface
 */

import { EuclidGraphQLClient, createGraphQLClient } from './graphql-client';
import { EuclidRESTClient, createRESTClient } from './rest-client';
import type { EuclidConfig } from './env';
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
  private graphql: EuclidGraphQLClient;
  private rest: EuclidRESTClient;

  constructor(config?: Partial<EuclidConfig>) {
    this.graphql = createGraphQLClient(config);
    this.rest = createRESTClient(config);
  }

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
   * Get detailed token information by ID
   */
  async getTokenById(tokenId: string): Promise<TokenMetadata | null> {
    return this.graphql.getTokenById(tokenId);
  }

  /**
   * Get token price history
   */
  async getTokenPriceHistory(tokenId: string, period: '1h' | '24h' | '7d' | '30d' | '1y' = '24h'): Promise<Array<{
    timestamp: string;
    price: string;
    volume: string;
  }>> {
    return this.graphql.getTokenPriceHistory(tokenId, period);
  }

  /**
   * Get token holders information
   */
  async getTokenHolders(tokenId: string, limit: number = 100, offset: number = 0): Promise<{
    holders: Array<{
      address: string;
      balance: string;
      percentage: string;
      chain_uid: string;
    }>;
    total_holders: number;
  }> {
    return this.graphql.getTokenHolders(tokenId, limit, offset);
  }

  /**
   * Get token transfer history
   */
  async getTokenTransfers(tokenId: string, limit: number = 50, offset: number = 0): Promise<{
    transfers: Array<{
      tx_hash: string;
      from: string;
      to: string;
      amount: string;
      timestamp: string;
      block_height: number;
      chain_uid: string;
    }>;
    total_transfers: number;
  }> {
    return this.graphql.getTokenTransfers(tokenId, limit, offset);
  }

  /**
   * Get token supply information
   */
  async getTokenSupply(tokenId: string): Promise<{
    total_supply: string;
    circulating_supply: string;
    max_supply?: string;
    burned_supply?: string;
    locked_supply?: string;
  }> {
    return this.graphql.getTokenSupply(tokenId);
  }

  /**
   * Get token market data and analytics
   */
  async getTokenMarketData(tokenId: string): Promise<{
    price: string;
    price_change_24h: string;
    price_change_7d: string;
    market_cap: string;
    volume_24h: string;
    liquidity: string;
    fdv: string;
    high_24h: string;
    low_24h: string;
    ath: string;
    ath_date: string;
    atl: string;
    atl_date: string;
  }> {
    return this.graphql.getTokenMarketData(tokenId);
  }

  /**
   * Get token social information
   */
  async getTokenSocial(tokenId: string): Promise<{
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
    reddit?: string;
    coingecko?: string;
    coinmarketcap?: string;
  }> {
    return this.graphql.getTokenSocial(tokenId);
  }

  /**
   * Get token pairs and trading information
   */
  async getTokenPairs(tokenId: string): Promise<Array<{
    pair_id: string;
    token_1: string;
    token_2: string;
    pool_address: string;
    liquidity_usd: string;
    volume_24h: string;
    apr: string;
    dex: string;
    chain_uid: string;
  }>> {
    return this.graphql.getTokenPairs(tokenId);
  }

  /**
   * Get verified tokens list
   */
  async getVerifiedTokens(chainUids?: string[]): Promise<TokenMetadata[]> {
    return this.graphql.getVerifiedTokens(chainUids);
  }

  /**
   * Get token analytics and metrics
   */
  async getTokenAnalytics(tokenId: string, timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    price_metrics: {
      current_price: string;
      price_change: string;
      price_change_percentage: string;
      high: string;
      low: string;
    };
    volume_metrics: {
      volume: string;
      volume_change: string;
      volume_change_percentage: string;
    };
    liquidity_metrics: {
      total_liquidity: string;
      liquidity_change: string;
      liquidity_change_percentage: string;
    };
    trading_metrics: {
      trades_count: number;
      unique_traders: number;
      avg_trade_size: string;
    };
  }> {
    return this.graphql.getTokenAnalytics(tokenId, timeframe);
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
   * Get pool information for a specific pair
   */
  async getPoolInfo(token1: string, token2: string): Promise<PoolInfo | null> {
    return this.graphql.getPoolInfo(token1, token2);
  }

  /**
   * Get detailed pool information by ID
   */
  async getPoolById(poolId: string): Promise<{
    pool_id: string;
    token_1: string;
    token_2: string;
    total_liquidity: string;
    volume_24h: string;
    volume_7d: string;
    fees_24h: string;
    apr: string;
    apy: string;
    tvl_change_24h: string;
    volume_change_24h: string;
    pool_address: string;
    dex: string;
    chain_uid: string;
    created_at: string;
    fee_rate: string;
    tags: string[];
  } | null> {
    return this.graphql.getPoolById(poolId);
  }

  /**
   * Get pool statistics and analytics
   */
  async getPoolStatistics(poolId: string, timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    liquidity_metrics: {
      current_liquidity: string;
      liquidity_change: string;
      liquidity_change_percentage: string;
      token_1_reserve: string;
      token_2_reserve: string;
    };
    volume_metrics: {
      volume: string;
      volume_change: string;
      volume_change_percentage: string;
      trade_count: number;
    };
    fee_metrics: {
      fees_collected: string;
      fee_rate: string;
      protocol_fees: string;
      lp_fees: string;
    };
    price_metrics: {
      current_price: string;
      price_change: string;
      price_change_percentage: string;
      high: string;
      low: string;
    };
  }> {
    return this.graphql.getPoolStatistics(poolId, timeframe);
  }

  /**
   * Get pool liquidity providers
   */
  async getPoolLiquidityProviders(poolId: string, limit: number = 50, offset: number = 0): Promise<{
    providers: Array<{
      address: string;
      liquidity_provided: string;
      percentage_share: string;
      token_1_amount: string;
      token_2_amount: string;
      rewards_earned: string;
      joined_at: string;
      chain_uid: string;
    }>;
    total_providers: number;
  }> {
    return this.graphql.getPoolLiquidityProviders(poolId, limit, offset);
  }

  /**
   * Get pool transaction history
   */
  async getPoolTransactions(poolId: string, limit: number = 50, offset: number = 0, type?: 'swap' | 'add' | 'remove'): Promise<{
    transactions: Array<{
      tx_hash: string;
      type: 'swap' | 'add_liquidity' | 'remove_liquidity';
      user: string;
      token_in?: string;
      token_out?: string;
      amount_in?: string;
      amount_out?: string;
      token_1_amount?: string;
      token_2_amount?: string;
      liquidity_amount?: string;
      fee_paid: string;
      timestamp: string;
      block_height: number;
      chain_uid: string;
    }>;
    total_transactions: number;
  }> {
    return this.graphql.getPoolTransactions(poolId, limit, offset, type);
  }

  /**
   * Get pool volume data
   */
  async getPoolVolume(poolId: string, period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    volume_data: Array<{
      timestamp: string;
      volume: string;
      trade_count: number;
      unique_traders: number;
    }>;
    total_volume: string;
    average_volume: string;
  }> {
    return this.graphql.getPoolVolume(poolId, period);
  }

  /**
   * Get pool fees collected
   */
  async getPoolFees(poolId: string, period: '24h' | '7d' | '30d' = '24h'): Promise<{
    fees_data: Array<{
      timestamp: string;
      fees_collected: string;
      protocol_fees: string;
      lp_fees: string;
    }>;
    total_fees: string;
    fee_rate: string;
  }> {
    return this.graphql.getPoolFees(poolId, period);
  }

  /**
   * Get pool APR/APY information
   */
  async getPoolAPR(poolId: string): Promise<{
    current_apr: string;
    current_apy: string;
    apr_7d_avg: string;
    apr_30d_avg: string;
    fee_apr: string;
    reward_apr: string;
    breakdown: Array<{
      component: string;
      apr: string;
      description: string;
    }>;
  }> {
    return this.graphql.getPoolAPR(poolId);
  }

  /**
   * Get pool TVL history
   */
  async getPoolTVL(poolId: string, period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    tvl_data: Array<{
      timestamp: string;
      tvl: string;
      token_1_reserve: string;
      token_2_reserve: string;
    }>;
    current_tvl: string;
    tvl_change: string;
    tvl_change_percentage: string;
  }> {
    return this.graphql.getPoolTVL(poolId, period);
  }

  /**
   * Get pool composition and token distribution
   */
  async getPoolComposition(poolId: string): Promise<{
    token_1: {
      symbol: string;
      amount: string;
      value_usd: string;
      percentage: string;
    };
    token_2: {
      symbol: string;
      amount: string;
      value_usd: string;
      percentage: string;
    };
    total_value: string;
    price_ratio: string;
  }> {
    return this.graphql.getPoolComposition(poolId);
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
   * Get the optimal single route for a swap
   */
  async getOptimalRoute(request: GetRoutesRequest): Promise<RoutePath | null> {
    return this.rest.getOptimalRoute(request);
  }

  /**
   * Get multiple routing options with different strategies
   */
  async getMultiRoutes(request: GetRoutesRequest & { strategies?: string[] }): Promise<RoutePath[]> {
    return this.rest.getMultiRoutes(request);
  }

  /**
   * Get routing statistics and performance metrics
   */
  async getRouteStatistics(timeframe?: '24h' | '7d' | '30d'): Promise<{
    totalRoutes: number;
    successRate: number;
    averageResponseTime: number;
    popularPairs: Array<{ token_in: string; token_out: string; count: number }>;
  }> {
    return this.rest.getRouteStatistics(timeframe);
  }

  /**
   * Get fee estimation for a specific route
   */
  async getRouteFees(request: GetRoutesRequest): Promise<{
    protocolFee: string;
    gasFee: string;
    totalFee: string;
    feeBreakdown: Array<{ step: number; fee: string; description: string }>;
  }> {
    return this.rest.getRouteFees(request);
  }

  /**
   * Simulate a route to get detailed execution information
   */
  async simulateRoute(request: GetRoutesRequest): Promise<{
    success: boolean;
    expectedOutput: string;
    priceImpact: string;
    minimumOutput: string;
    executionSteps: Array<{
      step: number;
      pool: string;
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      amountOut: string;
      priceImpact: string;
    }>;
    gasEstimate: string;
    warnings: string[];
  }> {
    return this.rest.simulateRoute(request);
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
   * Get detailed transaction information
   */
  async getTransactionDetails(txHash: string, chainUID: string): Promise<{
    hash: string;
    status: 'pending' | 'success' | 'failed';
    blockHeight?: number;
    blockHash?: string;
    timestamp?: string;
    gasUsed?: string;
    gasLimit?: string;
    fee?: string;
    events?: Array<{ type: string; attributes: Record<string, string> }>;
    logs?: string[];
  }> {
    return this.rest.getTransactionDetails(txHash, chainUID);
  }

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(signedTx: string, chainUID: string): Promise<{
    txHash: string;
    success: boolean;
    code?: number;
    log?: string;
  }> {
    return this.rest.broadcastTransaction(signedTx, chainUID);
  }

  /**
   * Estimate fees for a transaction
   */
  async estimateTransactionFees(transaction: object, chainUID: string): Promise<{
    gasLimit: string;
    gasPrice: string;
    totalFee: string;
    feeBreakdown: Array<{ component: string; amount: string; denom: string }>;
  }> {
    return this.rest.estimateTransactionFees(transaction, chainUID);
  }

  /**
   * Simulate a transaction before execution
   */
  async simulateTransaction(transaction: object, chainUID: string): Promise<{
    success: boolean;
    gasUsed: string;
    events?: Array<{ type: string; attributes: Record<string, string> }>;
    logs?: string[];
    error?: string;
  }> {
    return this.rest.simulateTransaction(transaction, chainUID);
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(address: string, chainUID: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: 'success' | 'failed';
  }): Promise<{
    transactions: Array<{
      hash: string;
      status: 'pending' | 'success' | 'failed';
      type: string;
      timestamp: string;
      blockHeight: number;
      fee: string;
      amount?: string;
      token?: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    return this.rest.getUserTransactions(address, chainUID, options);
  }

  /**
   * Get pending transactions for a user
   */
  async getPendingTransactions(address: string, chainUID: string): Promise<Array<{
    hash: string;
    type: string;
    timestamp: string;
    amount?: string;
    token?: string;
  }>> {
    return this.rest.getPendingTransactions(address, chainUID);
  }

  /**
   * Batch multiple transactions
   */
  async batchTransactions(transactions: Array<{
    transaction: object;
    chain_uid: string;
  }>): Promise<{
    batchId: string;
    transactions: Array<{
      index: number;
      txHash?: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    return this.rest.batchTransactions(transactions);
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
// Export default instance with default configuration
export const apiClient = new EuclidAPIClient();

// Export factory function for creating configured clients
export const createAPIClient = (config?: Partial<EuclidConfig>) => {
  return new EuclidAPIClient(config);
};

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
