/**
 * Lazy VLP Module - COMPLETE GraphQL VLP Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED VLP ENDPOINTS:
 * ✅ getAllPools (all_pools)
 * ✅ getAllPositions (all_positions)
 * ✅ getAssetList (asset_list)
 * ✅ getMyPositions (my_positions)
 * ✅ getPool (pool)
 * ✅ getPosition (position)
 * ✅ getTotalFeesCollected (total_fees_collected)
 */

import { DEFAULT_CONFIG } from '../env';

interface VLPConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for VLP operations
 */
async function executeVLPQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<VLPConfig>): Promise<T> {
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
    throw new Error(`VLP query failed: ${baseMessage}`);
  }
}

/**
 * Get all pools from VLP - NEW IMPLEMENTATION
 */
export async function getAllPoolsImpl(
  chainUid: string,
  vlpAddress: string,
  limit?: number,
  offset?: number
) {
  const query = `
    query All_pools($chainUid: String!, $vlpAddress: String!, $limit: Int, $offset: Int) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        all_pools(limit: $limit, offset: $offset) {
          pools {
            pool_id
            pair {
              token_1
              token_2
            }
            total_liquidity
            fees_collected
            volume_24h
            apy
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

  const result = await executeVLPQuery<{
    vlp: {
      all_pools: {
        pools: Array<{
          pool_id: string;
          pair: {
            token_1: string;
            token_2: string;
          };
          total_liquidity: string;
          fees_collected: string;
          volume_24h: string;
          apy: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, vlpAddress, limit, offset });

  return result.vlp.all_pools;
}

/**
 * Get all positions from VLP - NEW IMPLEMENTATION
 */
export async function getAllPositionsImpl(
  chainUid: string,
  vlpAddress: string,
  limit?: number,
  offset?: number
) {
  const query = `
    query All_positions($chainUid: String!, $vlpAddress: String!, $limit: Int, $offset: Int) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        all_positions(limit: $limit, offset: $offset) {
          positions {
            position_id
            owner
            pool_id
            liquidity_amount
            fees_earned
            created_at
            status
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

  const result = await executeVLPQuery<{
    vlp: {
      all_positions: {
        positions: Array<{
          position_id: string;
          owner: string;
          pool_id: string;
          liquidity_amount: string;
          fees_earned: string;
          created_at: string;
          status: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, vlpAddress, limit, offset });

  return result.vlp.all_positions;
}

/**
 * Get asset list from VLP - NEW IMPLEMENTATION
 */
export async function getAssetListImpl(chainUid: string, vlpAddress: string) {
  const query = `
    query Asset_list($chainUid: String!, $vlpAddress: String!) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        asset_list {
          assets {
            asset_id
            symbol
            name
            decimals
            total_supply
            price_usd
          }
        }
      }
    }
  `;

  const result = await executeVLPQuery<{
    vlp: {
      asset_list: {
        assets: Array<{
          asset_id: string;
          symbol: string;
          name: string;
          decimals: number;
          total_supply: string;
          price_usd: string;
        }>;
      };
    };
  }>(query, { chainUid, vlpAddress });

  return result.vlp.asset_list;
}

/**
 * Get user's positions from VLP - NEW IMPLEMENTATION
 */
export async function getMyPositionsImpl(
  chainUid: string,
  vlpAddress: string,
  userAddress: string,
  limit?: number,
  offset?: number
) {
  const query = `
    query My_positions($chainUid: String!, $vlpAddress: String!, $userAddress: String!, $limit: Int, $offset: Int) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        my_positions(user_address: $userAddress, limit: $limit, offset: $offset) {
          positions {
            position_id
            pool_id
            liquidity_amount
            fees_earned
            current_value
            pnl
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

  const result = await executeVLPQuery<{
    vlp: {
      my_positions: {
        positions: Array<{
          position_id: string;
          pool_id: string;
          liquidity_amount: string;
          fees_earned: string;
          current_value: string;
          pnl: string;
          created_at: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, vlpAddress, userAddress, limit, offset });

  return result.vlp.my_positions;
}

/**
 * Get specific pool from VLP - NEW IMPLEMENTATION
 */
export async function getPoolImpl(
  chainUid: string,
  vlpAddress: string,
  poolId: string
) {
  const query = `
    query Pool($chainUid: String!, $vlpAddress: String!, $poolId: String!) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        pool(pool_id: $poolId) {
          pool_id
          pair {
            token_1
            token_2
          }
          total_liquidity
          fees_collected
          volume_24h
          volume_7d
          volume_30d
          apy
          fee_tier
          reserves {
            token_1_reserve
            token_2_reserve
          }
          price_ratio
          status
        }
      }
    }
  `;

  const result = await executeVLPQuery<{
    vlp: {
      pool: {
        pool_id: string;
        pair: {
          token_1: string;
          token_2: string;
        };
        total_liquidity: string;
        fees_collected: string;
        volume_24h: string;
        volume_7d: string;
        volume_30d: string;
        apy: string;
        fee_tier: string;
        reserves: {
          token_1_reserve: string;
          token_2_reserve: string;
        };
        price_ratio: string;
        status: string;
      };
    };
  }>(query, { chainUid, vlpAddress, poolId });

  return result.vlp.pool;
}

/**
 * Get specific position from VLP - NEW IMPLEMENTATION
 */
export async function getPositionImpl(
  chainUid: string,
  vlpAddress: string,
  positionId: string
) {
  const query = `
    query Position($chainUid: String!, $vlpAddress: String!, $positionId: String!) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        position(position_id: $positionId) {
          position_id
          owner
          pool_id
          liquidity_amount
          fees_earned
          current_value
          initial_value
          pnl
          pnl_percentage
          created_at
          last_updated
          status
        }
      }
    }
  `;

  const result = await executeVLPQuery<{
    vlp: {
      position: {
        position_id: string;
        owner: string;
        pool_id: string;
        liquidity_amount: string;
        fees_earned: string;
        current_value: string;
        initial_value: string;
        pnl: string;
        pnl_percentage: string;
        created_at: string;
        last_updated: string;
        status: string;
      };
    };
  }>(query, { chainUid, vlpAddress, positionId });

  return result.vlp.position;
}

/**
 * Get total fees collected from VLP - NEW IMPLEMENTATION
 */
export async function getTotalFeesCollectedImpl(
  chainUid: string,
  vlpAddress: string,
  timeframe?: string
) {
  const query = `
    query Total_fees_collected($chainUid: String!, $vlpAddress: String!, $timeframe: String) {
      vlp(chain_uid: $chainUid, vlp_address: $vlpAddress) {
        total_fees_collected(timeframe: $timeframe) {
          total_fees
          fees_by_token {
            token_id
            amount
            value_usd
          }
          timeframe
          collection_period {
            start_date
            end_date
          }
        }
      }
    }
  `;

  const result = await executeVLPQuery<{
    vlp: {
      total_fees_collected: {
        total_fees: string;
        fees_by_token: Array<{
          token_id: string;
          amount: string;
          value_usd: string;
        }>;
        timeframe: string;
        collection_period: {
          start_date: string;
          end_date: string;
        };
      };
    };
  }>(query, { chainUid, vlpAddress, timeframe });

  return result.vlp.total_fees_collected;
}
