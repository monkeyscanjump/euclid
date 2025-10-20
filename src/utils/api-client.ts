import type { ApiResponse } from './types';
import type {
  ChainsResponse,
  TokensResponse,
  TokenDenomsGraphQLResponse,
  EscrowsResponse,
  RouteResponse,
  TransactionResponse
} from './types';
import { apiConfig } from './env';

export interface ApiClientConfig {
  baseUrl?: string;
  graphqlEndpoint?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || apiConfig.restEndpoint,
      graphqlEndpoint: config.graphqlEndpoint || apiConfig.graphqlEndpoint,
      timeout: config.timeout || apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(endpoint, options);
  }

  private async requestWithRetry<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeRequest<T>(endpoint, options, attempt);
        if (result.success) {
          return result;
        }

        // If it's a client error (4xx), don't retry
        if (result.error && result.error.includes('HTTP 4')) {
          return result;
        }

        lastError = new Error(result.error || 'Request failed');
      } catch (error) {
        lastError = error as Error;

        // Don't retry client errors
        if (error.name === 'AbortError' || error.message.includes('4')) {
          break;
        }

        if (attempt === maxRetries) break;

        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 0.1 * baseDelay;
        const delay = baseDelay + jitter;

        console.log(`🔄 Retrying API request (${attempt}/${maxRetries}) after ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`❌ API request failed after ${maxRetries} attempts:`, lastError.message);
    return {
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError.message}`
    };
  }

  private async executeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();

    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-Request-Attempt': attempt.toString(),
          'X-Request-ID': this.generateRequestId(),
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : { message: response.statusText };
        console.warn(`⚠️ API ${options.method || 'GET'} ${endpoint} - ${response.status} [attempt ${attempt}]`);
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      const data = isJson ? await response.json() : await response.text();
      console.log(`✅ API ${options.method || 'GET'} ${endpoint} - ${response.status} [attempt ${attempt}]`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`⏱️ API timeout: ${endpoint} [attempt ${attempt}]`);
          return {
            success: false,
            error: 'Request timeout',
          };
        }

        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.error(`🌐 Network error: ${endpoint} [attempt ${attempt}]`);
          return {
            success: false,
            error: 'Network connection failed - please check your internet connection',
          };
        }

        console.error(`❌ API error: ${endpoint} [attempt ${attempt}]:`, error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // GraphQL support for Euclid Protocol
  async graphql<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const url = this.config.graphqlEndpoint;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();

      if (result.errors?.length) {
        return {
          success: false,
          error: result.errors[0]?.message || 'GraphQL error',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown GraphQL error occurred',
      };
    }
  }

  // Update configuration
  updateConfig(config: Partial<ApiClientConfig>) {
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
    };
  }

  // Euclid Protocol specific methods

  // Get all supported chains
  async getAllChains(showAllChains = false, type?: string): Promise<ApiResponse<ChainsResponse>> {
    return this.graphql(`
      query Chains($showAllChains: Boolean, $type: String) {
        chains {
          all_chains(show_all_chains: $showAllChains, type: $type) {
            chain_id
            factory_address
            token_factory_address
            display_name
            explorer_url
            chain_uid
            logo
            type
          }
        }
      }
    `, { showAllChains, type });
  }

  // Get all available tokens
  async getAllTokens(options?: { max?: string; min?: string; skip?: number; limit?: number }): Promise<ApiResponse<TokensResponse>> {
    return this.graphql(`
      query All_tokens($max: String, $min: String, $skip: Int, $limit: Int) {
        router {
          all_tokens(max: $max, min: $min, skip: $skip, limit: $limit) {
            tokens
          }
        }
      }
    `, options);
  }

  // Get token denominations for a specific token
  async getTokenDenoms(token: string): Promise<ApiResponse<TokenDenomsGraphQLResponse>> {
    return this.graphql(`
      query Router($token: String!) {
        router {
          token_denoms(token: $token) {
            denoms {
              chain_uid
              token_type {
                ... on NativeTokenType {
                  native {
                    denom
                  }
                }
                ... on SmartTokenType {
                  smart {
                    contract_address
                  }
                }
                ... on VoucherTokenType {
                  voucher
                }
              }
            }
          }
        }
      }
    `, { token });
  }

  // Get escrows for a token
  async getEscrows(token: string): Promise<ApiResponse<EscrowsResponse>> {
    return this.graphql(`
      query Escrows($token: String!) {
        router {
          escrows(token: $token) {
            chain_uid
            balance
            chain_id
          }
        }
      }
    `, { token });
  }

  // Simulate a swap
  async simulateSwap(params: {
    assetIn: string;
    amountIn: string;
    assetOut: string;
    minAmountOut: string;
    swaps: string[];
  }) {
    return this.graphql(`
      query Simulate_swap($assetIn: String!, $amountIn: String!, $assetOut: String!, $minAmountOut: String!, $swaps: [String!]) {
        router {
          simulate_swap(asset_in: $assetIn, amount_in: $amountIn, asset_out: $assetOut, min_amount_out: $minAmountOut, swaps: $swaps) {
            amount_out
            asset_out
          }
        }
      }
    `, params);
  }

  // Get user's pools
  async getMyPools(userAddress: string, chainUid?: string) {
    return this.graphql(`
      query Pool($userAddress: String!, $chainUid: String) {
        pool {
          my_pools(user_address: $userAddress, chain_uid: $chainUid) {
            height
            vlp
            user {
              chain_uid
              address
            }
            pair {
              token_1
              token_2
            }
          }
        }
      }
    `, { userAddress, chainUid });
  }

  // REST API Methods

  // Get swap routes
  async getRoutes(params: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }): Promise<ApiResponse<RouteResponse>> {
    return this.post('/routes', params);
  }

  // Generate swap transaction
  async createSwapTransaction(params: Record<string, unknown>): Promise<ApiResponse<TransactionResponse>> {
    return this.post('/execute/swap', params);
  }

  // Generate add liquidity transaction
  async createAddLiquidityTransaction(params: Record<string, unknown>) {
    return this.post('/execute/liquidity/add', params);
  }

  // Generate remove liquidity transaction
  async createRemoveLiquidityTransaction(params: Record<string, unknown>) {
    return this.post('/execute/liquidity/remove', params);
  }

  // Get user balance
  async getBalance(address: string, _chainUID?: string): Promise<ApiResponse<unknown>> {
    return this.graphql(`
      query GetBalance($address: String!) {
        balance(user_address: $address) {
          all {
            denom
            amount
          }
        }
      }
    `, { address });
  }

  // Get user pools/liquidity positions
  async getUserPools(address: string): Promise<ApiResponse<unknown>> {
    return this.graphql(`
      query GetUserPools($address: String!) {
        factory {
          my_pools(user_address: $address) {
            pools {
              pool_id
              pair
              total_lp_tokens
            }
          }
        }
      }
    `, { address });
  }

  // Track transaction status
  async trackTransaction(txHash: string, chainUID?: string): Promise<ApiResponse<{ status: string; blockHeight?: number }>> {
    // Stub implementation - in a real app this would call the blockchain explorer API
    console.log(`Tracking transaction ${txHash} on chain ${chainUID}`);

    // Simulate successful tracking
    return {
      success: true,
      data: {
        status: Math.random() > 0.5 ? 'confirmed' : 'pending',
        blockHeight: Math.floor(Math.random() * 1000000)
      },
      error: null
    };
  }
}

// Default instance
export const apiClient = new ApiClient();
