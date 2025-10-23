import type {
  GetRoutesRequest,
  GetRoutesResponse,
  RoutePath,
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest,
  TransactionResponse,
  ApiResponse
} from './types/api.types';
import type { EuclidConfig } from './env';
import { DEFAULT_CONFIG } from './env';
import { logger } from './logger';

/**
 * REST client for Euclid Protocol
 * Handles all REST API calls for transactions, routing, and operations
 */
export class EuclidRESTClient {
  private endpoint: string;
  private timeout: number;

  constructor(config?: Partial<EuclidConfig>) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.endpoint = finalConfig.restEndpoint;
    this.timeout = finalConfig.apiTimeout;
  }

  /**
   * Execute a REST API request
   */
  private async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error('Utils', `REST API request failed (${path}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get routing paths for a swap
   */
  async getRoutes(request: GetRoutesRequest): Promise<RoutePath[]> {
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

    const result = await this.request<GetRoutesResponse>(`/routes?${queryParams}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch routes');
    }

    return result.data.paths;
  }

  /**
   * Get the optimal single route for a swap
   */
  async getOptimalRoute(request: GetRoutesRequest): Promise<RoutePath | null> {
    const result = await this.request<{ route: RoutePath | null }>('/routes/optimal', {
      method: 'POST',
      body: request,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch optimal route');
    }

    return result.data.route;
  }

  /**
   * Get multiple routing options with different strategies
   */
  async getMultiRoutes(request: GetRoutesRequest & { strategies?: string[] }): Promise<RoutePath[]> {
    const result = await this.request<{ routes: RoutePath[] }>('/routes/multi', {
      method: 'POST',
      body: request,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch multi routes');
    }

    return result.data.routes;
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
    const queryParams = timeframe ? `?timeframe=${timeframe}` : '';
    const result = await this.request<{
      totalRoutes: number;
      successRate: number;
      averageResponseTime: number;
      popularPairs: Array<{ token_in: string; token_out: string; count: number }>;
    }>(`/routes/statistics${queryParams}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch route statistics');
    }

    return result.data;
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
    const result = await this.request<{
      protocolFee: string;
      gasFee: string;
      totalFee: string;
      feeBreakdown: Array<{ step: number; fee: string; description: string }>;
    }>('/routes/fees', {
      method: 'POST',
      body: request,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch route fees');
    }

    return result.data;
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
    const result = await this.request<{
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
    }>('/routes/simulate', {
      method: 'POST',
      body: request,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to simulate route');
    }

    return result.data;
  }

  /**
   * Build a swap transaction
   */
  async buildSwapTransaction(request: SwapRequest): Promise<TransactionResponse> {
    const result = await this.request<TransactionResponse>('/swap', {
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
  async buildAddLiquidityTransaction(request: AddLiquidityRequest): Promise<TransactionResponse> {
    const result = await this.request<TransactionResponse>('/add_liquidity', {
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
  async buildRemoveLiquidityTransaction(request: RemoveLiquidityRequest): Promise<TransactionResponse> {
    const result = await this.request<TransactionResponse>('/remove_liquidity', {
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
  async simulateSwap(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    chain_uid?: string;
  }): Promise<{ amount_out: string; price_impact: string }> {
    const queryParams = new URLSearchParams({
      amount_in: request.amount_in,
      token_in: request.token_in,
      token_out: request.token_out,
    });

    if (request.chain_uid) {
      queryParams.append('chain_uid', request.chain_uid);
    }

    const result = await this.request<{ amount_out: string; price_impact: string }>(`/simulate_swap?${queryParams}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to simulate swap');
    }

    return result.data;
  }

  /**
   * Get optimal route for a swap with the best price
   */
  async getBestRoute(request: GetRoutesRequest): Promise<RoutePath | null> {
    const routes = await this.getRoutes(request);

    if (routes.length === 0) {
      return null;
    }

    // Sort by total price impact (lower is better)
    return routes.sort((a, b) =>
      parseFloat(a.total_price_impact) - parseFloat(b.total_price_impact)
    )[0];
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string, chainUID: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    blockHeight?: number;
    gasUsed?: string;
    fee?: string;
  }> {
    const result = await this.request<{
      status: 'pending' | 'success' | 'failed';
      blockHeight?: number;
      gasUsed?: string;
      fee?: string;
    }>(`/transaction/${txHash}?chain_uid=${chainUID}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get transaction status');
    }

    return result.data;
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
    const result = await this.request<{
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
    }>(`/transactions/${txHash}?chain_uid=${chainUID}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get transaction details');
    }

    return result.data;
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
    const result = await this.request<{
      txHash: string;
      success: boolean;
      code?: number;
      log?: string;
    }>('/transactions/broadcast', {
      method: 'POST',
      body: {
        tx: signedTx,
        chain_uid: chainUID,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to broadcast transaction');
    }

    return result.data;
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
    const result = await this.request<{
      gasLimit: string;
      gasPrice: string;
      totalFee: string;
      feeBreakdown: Array<{ component: string; amount: string; denom: string }>;
    }>('/transactions/estimate_fees', {
      method: 'POST',
      body: {
        transaction,
        chain_uid: chainUID,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to estimate transaction fees');
    }

    return result.data;
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
    const result = await this.request<{
      success: boolean;
      gasUsed: string;
      events?: Array<{ type: string; attributes: Record<string, string> }>;
      logs?: string[];
      error?: string;
    }>('/transactions/simulate', {
      method: 'POST',
      body: {
        transaction,
        chain_uid: chainUID,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to simulate transaction');
    }

    return result.data;
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
    const queryParams = new URLSearchParams({
      address,
      chain_uid: chainUID,
    });

    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());
    if (options?.type) queryParams.append('type', options.type);
    if (options?.status) queryParams.append('status', options.status);

    const result = await this.request<{
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
    }>(`/transactions/user/${address}?${queryParams}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get user transactions');
    }

    return result.data;
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
    const result = await this.request<Array<{
      hash: string;
      type: string;
      timestamp: string;
      amount?: string;
      token?: string;
    }>>(`/transactions/pending?address=${address}&chain_uid=${chainUID}`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get pending transactions');
    }

    return result.data;
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
    const result = await this.request<{
      batchId: string;
      transactions: Array<{
        index: number;
        txHash?: string;
        success: boolean;
        error?: string;
      }>;
    }>('/transactions/batch', {
      method: 'POST',
      body: { transactions },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to batch transactions');
    }

    return result.data;
  }

  /**
   * Get gas estimate for a transaction
   */
  async estimateGas(transaction: TransactionResponse): Promise<{ gasLimit: string; gasPrice: string }> {
    const result = await this.request<{ gasLimit: string; gasPrice: string }>('/estimate_gas', {
      method: 'POST',
      body: transaction,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to estimate gas');
    }

    return result.data;
  }
}

// Export a default instance with default config
export const euclidRESTClient = new EuclidRESTClient();

// Export factory function for creating configured clients
export const createRESTClient = (config?: Partial<EuclidConfig>) => {
  return new EuclidRESTClient(config);
};
