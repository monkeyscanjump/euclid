/**
 * Pool Endpoints - Lazy Loaded
 * Liquidity pool, TVL, and APR endpoints
 */

import type { EndpointCategory } from './base';

export const POOL_ENDPOINTS: EndpointCategory = {
  name: 'pools',
  endpoints: [
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
  ],
};

export default POOL_ENDPOINTS;
