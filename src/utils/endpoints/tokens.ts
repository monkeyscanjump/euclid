/**
 * Token Endpoints - Lazy Loaded
 * Token metadata, pricing, and market data endpoints
 */

import type { EndpointCategory } from './base';

export const TOKEN_ENDPOINTS: EndpointCategory = {
  name: 'tokens',
  endpoints: [
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
      cacheTTL: 60000,
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
  ],
};

export default TOKEN_ENDPOINTS;
