import type {
  EuclidChainConfig,
  TokenMetadata,
  PoolInfo,
  UserBalance,
  CrossChainUser,
  ChainsQueryResponse,
  TokenMetadataQueryResponse,
  UserBalanceQueryResponse,
  ApiResponse
} from './types/api.types';

// GraphQL endpoint for Euclid testnet
const EUCLID_GRAPHQL_ENDPOINT = 'https://testnet.api.euclidprotocol.com/graphql';

/**
 * GraphQL client for Euclid Protocol
 * Handles all GraphQL queries to the Euclid API
 */
export class EuclidGraphQLClient {
  private endpoint: string;

  constructor(endpoint: string = EUCLID_GRAPHQL_ENDPOINT) {
    this.endpoint = endpoint;
  }

  /**
   * Execute a GraphQL query
   */
  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('GraphQL query failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all supported chains
   */
  async getChains(variables?: { showAllChains?: boolean; type?: string }): Promise<EuclidChainConfig[]> {
    const query = `
      query Chains($showAllChains: Boolean, $type: String) {
        chains {
          all_chains(show_all_chains: $showAllChains, type: $type) {
            chain_id
            chain_uid
            display_name
            factory_address
            token_factory_address
            explorer_url
            logo
            type
          }
        }
      }
    `;

    const result = await this.query<ChainsQueryResponse>(query, variables);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch chains');
    }

    return result.data.chains.all_chains;
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(variables?: {
    limit?: number;
    offset?: number;
    verified?: boolean;
    dex?: string[];
    chainUids?: string[];
    showVolume?: boolean;
    search?: string;
  }): Promise<TokenMetadata[]> {
    const query = `
      query Token(
        $limit: Int,
        $offset: Int,
        $verified: Boolean,
        $dex: [String!],
        $chainUids: [String!],
        $showVolume: Boolean,
        $search: String
      ) {
        token {
          token_metadatas(
            limit: $limit,
            offset: $offset,
            verified: $verified,
            dex: $dex,
            chain_uids: $chainUids,
            show_volume: $showVolume,
            search: $search
          ) {
            coinDecimal
            displayName
            tokenId
            description
            image
            price
            price_change_24h
            price_change_7d
            dex
            chain_uids
            total_volume
            total_volume_24h
            tags
            min_swap_value
            social
            is_verified
          }
        }
      }
    `;

    const result = await this.query<TokenMetadataQueryResponse>(query, variables);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch token metadata');
    }

    return result.data.token.token_metadatas;
  }

  /**
   * Get all liquidity pools with proper TVL and APR data
   * @param chainUid - Optional chain filter (unused for now)
   * @param onlyVerified - Whether to show only verified pools (default: true)
   */
  async getAllPools(_chainUid?: string, onlyVerified: boolean = true): Promise<PoolInfo[]> {
    try {
      const query = `
        query Token_pair_with_liquidity($limit: Int, $onlyShowVerified: Boolean) {
          pool {
            token_pair_with_liquidity(limit: $limit, only_show_verified: $onlyShowVerified) {
              results {
                pair {
                  token_1
                  token_2
                }
                vlp
                total_liquidity
                apr
                tags
                created_at
              }
              pagination {
                total_count
                limit
                offset
              }
            }
          }
        }
      `;

      const result = await this.query<{
        pool: {
          token_pair_with_liquidity: {
            results: Array<{
              pair: { token_1: string; token_2: string };
              vlp: string;
              total_liquidity: string;
              apr: string;
              tags: string[] | null;
              created_at: string;
            }>;
            pagination: {
              total_count: number;
              limit: number;
              offset: number;
            };
          };
        };
      }>(query, {
        limit: 1000,
        onlyShowVerified: onlyVerified
      });

      if (!result.success || !result.data?.pool?.token_pair_with_liquidity?.results) {
        throw new Error(result.error || 'Failed to fetch pools with liquidity data');
      }

      // Transform the API response to our PoolInfo interface
      const pools = result.data.pool.token_pair_with_liquidity.results.map((pool) => {
        return {
          pool_id: `${pool.pair.token_1}-${pool.pair.token_2}`,
          token_1: pool.pair.token_1,
          token_2: pool.pair.token_2,
          total_liquidity: pool.total_liquidity,
          volume_24h: '0', // This API doesn't provide volume data
          fees_24h: '0', // This API doesn't provide fees data
          apr: pool.apr,
        } satisfies PoolInfo;
      });

      console.log(`✅ Loaded ${pools.length} pools with real liquidity and APR data from official API`);
      return pools;

    } catch (error) {
      console.error('Failed to fetch pools with liquidity data:', error);
      return [];
    }
  }  /**
   * Get user balances across all chains
   */
  async getUserBalances(user: CrossChainUser): Promise<UserBalance[]> {
    const query = `
      query Vcoin($user: CrossChainUserInput) {
        vcoin {
          user_balance(user: $user) {
            balances {
              amount
              token_id
            }
          }
        }
      }
    `;

    const variables = {
      user: {
        address: user.address,
        chain_uid: user.chain_uid,
      },
    };

    const result = await this.query<UserBalanceQueryResponse>(query, variables);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch user balances');
    }

    return result.data.vcoin.user_balance.balances;
  }

  /**
   * Get pool information for a specific pair
   */
  async getPoolInfo(token1: string, token2: string): Promise<PoolInfo | null> {
    const pools = await this.getAllPools();
    return pools.find(pool =>
      (pool.token_1 === token1 && pool.token_2 === token2) ||
      (pool.token_1 === token2 && pool.token_2 === token1)
    ) || null;
  }

  /**
   * Search tokens by symbol or name
   */
    async searchTokens(searchTerm: string, chainUID?: string): Promise<TokenMetadata[]> {
    const options: Parameters<typeof this.getTokenMetadata>[0] = { search: searchTerm };
    if (chainUID) {
      options.chainUids = [chainUID];
    }
    const tokens = await this.getTokenMetadata(options);

    const lowerSearchTerm = searchTerm.toLowerCase();
    return tokens.filter(token =>
      token.displayName?.toLowerCase().includes(lowerSearchTerm) ||
      token.tokenId?.toLowerCase().includes(lowerSearchTerm) ||
      token.description?.toLowerCase().includes(lowerSearchTerm) ||
      // Legacy field fallbacks
      token.symbol?.toLowerCase().includes(lowerSearchTerm) ||
      token.name?.toLowerCase().includes(lowerSearchTerm)
    );
  }

  /**
   * Get token by symbol and chain
   */
  async getTokenBySymbol(symbol: string, chainUID: string): Promise<TokenMetadata | null> {
    const tokens = await this.getTokenMetadata({ chainUids: [chainUID] });
    // Use displayName (symbol equivalent) for comparison, with fallback to legacy fields
    return tokens.find(token =>
      token.displayName?.toLowerCase() === symbol.toLowerCase() ||
      token.symbol?.toLowerCase() === symbol.toLowerCase()
    ) || null;
  }
}

// Export a default instance
export const euclidGraphQLClient = new EuclidGraphQLClient();
