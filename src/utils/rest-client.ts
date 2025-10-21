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
