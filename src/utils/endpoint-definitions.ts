/**
 * Euclid API Endpoint Definitions
 * Centralized configuration for all API endpoints with proper caching and priority settings
 */

import type { EndpointConfig } from './endpoint-factory';

/**
 * GraphQL Endpoint Configurations
 */
export const GRAPHQL_ENDPOINTS: EndpointConfig[] = [
  // ============================================================================
  // CHAIN ENDPOINTS
  // ============================================================================
  {
    id: 'getChains',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'aggressive',
    cacheTTL: 300000, // 5 minutes
    priority: 'high',
  },

  // ============================================================================
  // TOKEN ENDPOINTS
  // ============================================================================
  {
    id: 'getTokenMetadata',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'moderate',
    cacheTTL: 60000, // 1 minute
    priority: 'high',
  },

  {
    id: 'getTokenById',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'moderate',
    priority: 'normal',
  },

  {
    id: 'getTokenPriceHistory',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'minimal',
    priority: 'normal',
  },

  {
    id: 'getTokenHolders',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'moderate',
    priority: 'low',
  },

  // ============================================================================
  // POOL ENDPOINTS
  // ============================================================================
  {
    id: 'getAllPools',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'moderate',
    priority: 'high',
  },

  {
    id: 'getPoolById',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'moderate',
    priority: 'normal',
  },

  {
    id: 'getPoolStatistics',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'minimal',
    priority: 'normal',
  },

  // ============================================================================
  // USER DATA ENDPOINTS
  // ============================================================================
  {
    id: 'getUserBalances',
    method: 'POST',
    path: '/graphql',
    type: 'graphql',
    query: `
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
    `,
    cacheStrategy: 'minimal',
    priority: 'high',
  },
];

/**
 * REST Endpoint Configurations
 */
export const REST_ENDPOINTS: EndpointConfig[] = [
  // ============================================================================
  // ROUTING ENDPOINTS
  // ============================================================================
  {
    id: 'getRoutes',
    method: 'GET',
    path: '/routes',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'high',
  },

  {
    id: 'getOptimalRoute',
    method: 'POST',
    path: '/routes/optimal',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'high',
  },

  {
    id: 'getMultiRoutes',
    method: 'POST',
    path: '/routes/multi',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'high',
  },

  {
    id: 'getRouteStatistics',
    method: 'GET',
    path: '/routes/statistics',
    type: 'rest',
    cacheStrategy: 'moderate',
    priority: 'low',
  },

  {
    id: 'getRouteFees',
    method: 'POST',
    path: '/routes/fees',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'normal',
  },

  {
    id: 'simulateRoute',
    method: 'POST',
    path: '/routes/simulate',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'normal',
  },

  // ============================================================================
  // TRANSACTION ENDPOINTS
  // ============================================================================
  {
    id: 'buildSwapTransaction',
    method: 'POST',
    path: '/swap',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'high',
  },

  {
    id: 'buildAddLiquidityTransaction',
    method: 'POST',
    path: '/add_liquidity',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'high',
  },

  {
    id: 'buildRemoveLiquidityTransaction',
    method: 'POST',
    path: '/remove_liquidity',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'high',
  },

  {
    id: 'broadcastTransaction',
    method: 'POST',
    path: '/transactions/broadcast',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'high',
  },

  {
    id: 'getTransactionStatus',
    method: 'GET',
    path: '/transaction',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'high',
  },

  {
    id: 'getTransactionDetails',
    method: 'GET',
    path: '/transactions',
    type: 'rest',
    cacheStrategy: 'moderate',
    priority: 'normal',
  },

  {
    id: 'estimateTransactionFees',
    method: 'POST',
    path: '/transactions/estimate_fees',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'normal',
  },

  {
    id: 'simulateTransaction',
    method: 'POST',
    path: '/transactions/simulate',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'normal',
  },

  {
    id: 'getUserTransactions',
    method: 'GET',
    path: '/transactions/user',
    type: 'rest',
    cacheStrategy: 'moderate',
    priority: 'normal',
  },

  {
    id: 'getPendingTransactions',
    method: 'GET',
    path: '/transactions/pending',
    type: 'rest',
    cacheStrategy: 'minimal',
    priority: 'normal',
  },

  {
    id: 'batchTransactions',
    method: 'POST',
    path: '/transactions/batch',
    type: 'rest',
    cacheStrategy: 'none',
    priority: 'normal',
  },
];

/**
 * All endpoint configurations combined
 */
export const ALL_ENDPOINTS: EndpointConfig[] = [
  ...GRAPHQL_ENDPOINTS,
  ...REST_ENDPOINTS,
];

/**
 * Endpoint configuration by ID for quick lookup
 */
export const ENDPOINT_CONFIG_MAP = new Map<string, EndpointConfig>(
  ALL_ENDPOINTS.map(endpoint => [endpoint.id, endpoint])
);

/**
 * Get endpoint configuration by ID
 */
export function getEndpointConfig(endpointId: string): EndpointConfig | undefined {
  return ENDPOINT_CONFIG_MAP.get(endpointId);
}

/**
 * Get all GraphQL endpoints
 */
export function getGraphQLEndpoints(): EndpointConfig[] {
  return GRAPHQL_ENDPOINTS;
}

/**
 * Get all REST endpoints
 */
export function getRESTEndpoints(): EndpointConfig[] {
  return REST_ENDPOINTS;
}

/**
 * Get endpoints by cache strategy
 */
export function getEndpointsByCacheStrategy(strategy: 'aggressive' | 'moderate' | 'minimal' | 'none'): EndpointConfig[] {
  return ALL_ENDPOINTS.filter(endpoint => endpoint.cacheStrategy === strategy);
}

/**
 * Get endpoints by priority
 */
export function getEndpointsByPriority(priority: 'high' | 'normal' | 'low'): EndpointConfig[] {
  return ALL_ENDPOINTS.filter(endpoint => endpoint.priority === priority);
}
