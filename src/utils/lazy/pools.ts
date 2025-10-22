/**
 * Lazy Pools Module - GraphQL Pool Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 */

import { DEFAULT_CONFIG } from '../env';

interface PoolConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for pools
 */
async function executePoolQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<PoolConfig>): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.apiTimeout);

  try {
    const response = await fetch(finalConfig.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Pool query failed: ${baseMessage}`);
  }
}

/**
 * Get all pools - extracted implementation
 */
export async function getAllPoolsImpl(onlyVerified: boolean = true) {
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

  try {
    const result = await executePoolQuery<{
      pool: {
        token_pair_with_liquidity: {
          results: Array<{
            pair: { token_1: string; token_2: string };
            vlp: string;
            total_liquidity: string;
            apr: string;
            tags: string[];
            created_at: string;
          }>;
          pagination: {
            total_count: number;
            limit: number;
            offset: number;
          };
        };
      };
    }>(query, { onlyShowVerified: onlyVerified });

    const pools = result.pool.token_pair_with_liquidity.results.map((item) => ({
      // Map the actual API response structure to PoolInfo interface
      pool_id: item.vlp, // Use VLP address as pool_id
      token_1: item.pair.token_1,
      token_2: item.pair.token_2,
      total_liquidity: item.total_liquidity,
      volume_24h: '0', // Not provided by this query
      fees_24h: '0', // Not provided by this query
      apr: item.apr,
      // Legacy compatibility aliases for backward compatibility
      id: item.vlp,
      token1: item.pair.token_1,
      token2: item.pair.token_2,
      tvl: item.total_liquidity,
      vlp: item.vlp,
      tags: item.tags,
      createdAt: item.created_at,
    }));

    return { success: true, data: pools };
  } catch (error) {
    console.error('Error fetching pools:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get pool by ID - extracted implementation
 */
export async function getPoolByIdImpl(poolId: string) {
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

  const result = await executePoolQuery<{
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
      } | null;
    };
  }>(query, { poolId });

  return result.pool.pool_by_id;
}

/**
 * Get pool info for a pair - extracted implementation
 */
export async function getPoolInfoImpl(token1: string, token2: string) {
  // This would need to be implemented based on the specific GraphQL schema
  // For now, return null as a placeholder
  console.warn(`getPoolInfo for ${token1}/${token2} not yet implemented in lazy module`);
  return null;
}
