import type { ApiResponse } from './types';
import type {
  ChainsResponse,
  TokensResponse,
  TokenDenomsGraphQLResponse,
  EscrowsResponse,
  SimulateSwapGraphQLResponse,
  MyPoolsResponse,
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

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();

    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
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
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      const data = isJson ? await response.json() : await response.text();

      return {
        success: true,
        data,
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
        error: 'Unknown error occurred',
      };
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
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

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // GraphQL support for Euclid Protocol
  async graphql<T = any>(query: string, variables?: Record<string, any>): Promise<ApiResponse<T>> {
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
  async createSwapTransaction(params: any): Promise<ApiResponse<TransactionResponse>> {
    return this.post('/execute/swap', params);
  }

  // Generate add liquidity transaction
  async createAddLiquidityTransaction(params: any) {
    return this.post('/execute/liquidity/add', params);
  }

  // Generate remove liquidity transaction
  async createRemoveLiquidityTransaction(params: any) {
    return this.post('/execute/liquidity/remove', params);
  }

  // Get user balance
  async getBalance(address: string, chainUID?: string): Promise<ApiResponse<any>> {
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
  async getUserPools(address: string): Promise<ApiResponse<any>> {
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
}

// Default instance
export const apiClient = new ApiClient();
