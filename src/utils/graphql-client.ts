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
import type { EuclidConfig } from './env';
import { DEFAULT_CONFIG } from './env';
import { logger } from './logger';

/**
 * GraphQL client for Euclid Protocol
 * Handles all GraphQL queries to the Euclid API
 */
export class EuclidGraphQLClient {
  private endpoint: string;
  private timeout: number;

  constructor(config?: Partial<EuclidConfig>) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.endpoint = finalConfig.graphqlEndpoint;
    this.timeout = finalConfig.apiTimeout;
  }

  /**
   * Execute a GraphQL query
   */
  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
      logger.error('Utils', 'GraphQL query failed:', error);
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

      logger.info('Utils', `✅ Loaded ${pools.length} pools with real liquidity and APR data from official API`);
      return pools;

    } catch (error) {
      logger.error('Utils', 'Failed to fetch pools with liquidity data:', error);
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
    const query = `
      query Pool($poolId: String!) {
        pool {
          pool_by_id(pool_id: $poolId) {
            pool_id
            token_1
            token_2
            total_liquidity
            volume_24h
            volume_7d
            fees_24h
            apr
            apy
            tvl_change_24h
            volume_change_24h
            pool_address
            dex
            chain_uid
            created_at
            fee_rate
            tags
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        pool_by_id: {
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
        };
      };
    }>(query, { poolId });

    if (!result.success || !result.data?.pool?.pool_by_id) {
      return null;
    }

    return result.data.pool.pool_by_id;
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
    const query = `
      query Pool($poolId: String!, $timeframe: String!) {
        pool {
          statistics(pool_id: $poolId, timeframe: $timeframe) {
            liquidity_metrics {
              current_liquidity
              liquidity_change
              liquidity_change_percentage
              token_1_reserve
              token_2_reserve
            }
            volume_metrics {
              volume
              volume_change
              volume_change_percentage
              trade_count
            }
            fee_metrics {
              fees_collected
              fee_rate
              protocol_fees
              lp_fees
            }
            price_metrics {
              current_price
              price_change
              price_change_percentage
              high
              low
            }
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        statistics: {
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
        };
      };
    }>(query, { poolId, timeframe });

    if (!result.success || !result.data?.pool?.statistics) {
      throw new Error(result.error || 'Failed to fetch pool statistics');
    }

    return result.data.pool.statistics;
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
    const query = `
      query Pool($poolId: String!, $limit: Int, $offset: Int) {
        pool {
          liquidity_providers(pool_id: $poolId, limit: $limit, offset: $offset) {
            providers {
              address
              liquidity_provided
              percentage_share
              token_1_amount
              token_2_amount
              rewards_earned
              joined_at
              chain_uid
            }
            total_providers
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        liquidity_providers: {
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
        };
      };
    }>(query, { poolId, limit, offset });

    if (!result.success || !result.data?.pool?.liquidity_providers) {
      throw new Error(result.error || 'Failed to fetch pool liquidity providers');
    }

    return result.data.pool.liquidity_providers;
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
    const query = `
      query Pool($poolId: String!, $limit: Int, $offset: Int, $type: String) {
        pool {
          transactions(pool_id: $poolId, limit: $limit, offset: $offset, type: $type) {
            transactions {
              tx_hash
              type
              user
              token_in
              token_out
              amount_in
              amount_out
              token_1_amount
              token_2_amount
              liquidity_amount
              fee_paid
              timestamp
              block_height
              chain_uid
            }
            total_transactions
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        transactions: {
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
        };
      };
    }>(query, { poolId, limit, offset, type });

    if (!result.success || !result.data?.pool?.transactions) {
      throw new Error(result.error || 'Failed to fetch pool transactions');
    }

    return result.data.pool.transactions;
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
    const query = `
      query Pool($poolId: String!, $period: String!) {
        pool {
          volume(pool_id: $poolId, period: $period) {
            volume_data {
              timestamp
              volume
              trade_count
              unique_traders
            }
            total_volume
            average_volume
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        volume: {
          volume_data: Array<{
            timestamp: string;
            volume: string;
            trade_count: number;
            unique_traders: number;
          }>;
          total_volume: string;
          average_volume: string;
        };
      };
    }>(query, { poolId, period });

    if (!result.success || !result.data?.pool?.volume) {
      throw new Error(result.error || 'Failed to fetch pool volume');
    }

    return result.data.pool.volume;
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
    const query = `
      query Pool($poolId: String!, $period: String!) {
        pool {
          fees(pool_id: $poolId, period: $period) {
            fees_data {
              timestamp
              fees_collected
              protocol_fees
              lp_fees
            }
            total_fees
            fee_rate
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        fees: {
          fees_data: Array<{
            timestamp: string;
            fees_collected: string;
            protocol_fees: string;
            lp_fees: string;
          }>;
          total_fees: string;
          fee_rate: string;
        };
      };
    }>(query, { poolId, period });

    if (!result.success || !result.data?.pool?.fees) {
      throw new Error(result.error || 'Failed to fetch pool fees');
    }

    return result.data.pool.fees;
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
    const query = `
      query Pool($poolId: String!) {
        pool {
          apr(pool_id: $poolId) {
            current_apr
            current_apy
            apr_7d_avg
            apr_30d_avg
            fee_apr
            reward_apr
            breakdown {
              component
              apr
              description
            }
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        apr: {
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
        };
      };
    }>(query, { poolId });

    if (!result.success || !result.data?.pool?.apr) {
      throw new Error(result.error || 'Failed to fetch pool APR');
    }

    return result.data.pool.apr;
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
    const query = `
      query Pool($poolId: String!, $period: String!) {
        pool {
          tvl(pool_id: $poolId, period: $period) {
            tvl_data {
              timestamp
              tvl
              token_1_reserve
              token_2_reserve
            }
            current_tvl
            tvl_change
            tvl_change_percentage
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        tvl: {
          tvl_data: Array<{
            timestamp: string;
            tvl: string;
            token_1_reserve: string;
            token_2_reserve: string;
          }>;
          current_tvl: string;
          tvl_change: string;
          tvl_change_percentage: string;
        };
      };
    }>(query, { poolId, period });

    if (!result.success || !result.data?.pool?.tvl) {
      throw new Error(result.error || 'Failed to fetch pool TVL');
    }

    return result.data.pool.tvl;
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
    const query = `
      query Pool($poolId: String!) {
        pool {
          composition(pool_id: $poolId) {
            token_1 {
              symbol
              amount
              value_usd
              percentage
            }
            token_2 {
              symbol
              amount
              value_usd
              percentage
            }
            total_value
            price_ratio
          }
        }
      }
    `;

    const result = await this.query<{
      pool: {
        composition: {
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
        };
      };
    }>(query, { poolId });

    if (!result.success || !result.data?.pool?.composition) {
      throw new Error(result.error || 'Failed to fetch pool composition');
    }

    return result.data.pool.composition;
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

  /**
   * Get detailed token information by ID
   */
  async getTokenById(tokenId: string): Promise<TokenMetadata | null> {
    const query = `
      query Token($tokenId: String!) {
        token {
          token_metadata(token_id: $tokenId) {
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
            market_cap
            circulating_supply
            total_supply
            max_supply
            holders_count
          }
        }
      }
    `;

    const result = await this.query<{ token: { token_metadata: TokenMetadata } }>(query, { tokenId });

    if (!result.success || !result.data?.token?.token_metadata) {
      return null;
    }

    return result.data.token.token_metadata;
  }

  /**
   * Get token price history
   */
  async getTokenPriceHistory(tokenId: string, period: '1h' | '24h' | '7d' | '30d' | '1y' = '24h'): Promise<Array<{
    timestamp: string;
    price: string;
    volume: string;
  }>> {
    const query = `
      query Token($tokenId: String!, $period: String!) {
        token {
          price_history(token_id: $tokenId, period: $period) {
            data {
              timestamp
              price
              volume
            }
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        price_history: {
          data: Array<{ timestamp: string; price: string; volume: string }>;
        };
      };
    }>(query, { tokenId, period });

    if (!result.success || !result.data?.token?.price_history?.data) {
      throw new Error(result.error || 'Failed to fetch token price history');
    }

    return result.data.token.price_history.data;
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
    const query = `
      query Token($tokenId: String!, $limit: Int, $offset: Int) {
        token {
          holders(token_id: $tokenId, limit: $limit, offset: $offset) {
            holders {
              address
              balance
              percentage
              chain_uid
            }
            total_holders
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        holders: {
          holders: Array<{
            address: string;
            balance: string;
            percentage: string;
            chain_uid: string;
          }>;
          total_holders: number;
        };
      };
    }>(query, { tokenId, limit, offset });

    if (!result.success || !result.data?.token?.holders) {
      throw new Error(result.error || 'Failed to fetch token holders');
    }

    return result.data.token.holders;
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
    const query = `
      query Token($tokenId: String!, $limit: Int, $offset: Int) {
        token {
          transfers(token_id: $tokenId, limit: $limit, offset: $offset) {
            transfers {
              tx_hash
              from
              to
              amount
              timestamp
              block_height
              chain_uid
            }
            total_transfers
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        transfers: {
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
        };
      };
    }>(query, { tokenId, limit, offset });

    if (!result.success || !result.data?.token?.transfers) {
      throw new Error(result.error || 'Failed to fetch token transfers');
    }

    return result.data.token.transfers;
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
    const query = `
      query Token($tokenId: String!) {
        token {
          supply(token_id: $tokenId) {
            total_supply
            circulating_supply
            max_supply
            burned_supply
            locked_supply
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        supply: {
          total_supply: string;
          circulating_supply: string;
          max_supply?: string;
          burned_supply?: string;
          locked_supply?: string;
        };
      };
    }>(query, { tokenId });

    if (!result.success || !result.data?.token?.supply) {
      throw new Error(result.error || 'Failed to fetch token supply');
    }

    return result.data.token.supply;
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
    const query = `
      query Token($tokenId: String!) {
        token {
          market_data(token_id: $tokenId) {
            price
            price_change_24h
            price_change_7d
            market_cap
            volume_24h
            liquidity
            fdv
            high_24h
            low_24h
            ath
            ath_date
            atl
            atl_date
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        market_data: {
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
        };
      };
    }>(query, { tokenId });

    if (!result.success || !result.data?.token?.market_data) {
      throw new Error(result.error || 'Failed to fetch token market data');
    }

    return result.data.token.market_data;
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
    const query = `
      query Token($tokenId: String!) {
        token {
          social(token_id: $tokenId) {
            website
            twitter
            telegram
            discord
            github
            reddit
            coingecko
            coinmarketcap
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        social: {
          website?: string;
          twitter?: string;
          telegram?: string;
          discord?: string;
          github?: string;
          reddit?: string;
          coingecko?: string;
          coinmarketcap?: string;
        };
      };
    }>(query, { tokenId });

    if (!result.success || !result.data?.token?.social) {
      throw new Error(result.error || 'Failed to fetch token social data');
    }

    return result.data.token.social;
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
    const query = `
      query Token($tokenId: String!) {
        token {
          pairs(token_id: $tokenId) {
            pair_id
            token_1
            token_2
            pool_address
            liquidity_usd
            volume_24h
            apr
            dex
            chain_uid
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        pairs: Array<{
          pair_id: string;
          token_1: string;
          token_2: string;
          pool_address: string;
          liquidity_usd: string;
          volume_24h: string;
          apr: string;
          dex: string;
          chain_uid: string;
        }>;
      };
    }>(query, { tokenId });

    if (!result.success || !result.data?.token?.pairs) {
      throw new Error(result.error || 'Failed to fetch token pairs');
    }

    return result.data.token.pairs;
  }

  /**
   * Get verified tokens list
   */
  async getVerifiedTokens(chainUids?: string[]): Promise<TokenMetadata[]> {
    return this.getTokenMetadata({
      verified: true,
      chainUids,
      limit: 1000
    });
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
    const query = `
      query Token($tokenId: String!, $timeframe: String!) {
        token {
          analytics(token_id: $tokenId, timeframe: $timeframe) {
            price_metrics {
              current_price
              price_change
              price_change_percentage
              high
              low
            }
            volume_metrics {
              volume
              volume_change
              volume_change_percentage
            }
            liquidity_metrics {
              total_liquidity
              liquidity_change
              liquidity_change_percentage
            }
            trading_metrics {
              trades_count
              unique_traders
              avg_trade_size
            }
          }
        }
      }
    `;

    const result = await this.query<{
      token: {
        analytics: {
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
        };
      };
    }>(query, { tokenId, timeframe });

    if (!result.success || !result.data?.token?.analytics) {
      throw new Error(result.error || 'Failed to fetch token analytics');
    }

    return result.data.token.analytics;
  }
}

// Export a default instance with default config
export const euclidGraphQLClient = new EuclidGraphQLClient();

// Export factory function for creating configured clients
export const createGraphQLClient = (config?: Partial<EuclidConfig>) => {
  return new EuclidGraphQLClient(config);
};
