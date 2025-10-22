/**
 * Lazy Pool Module - COMPLETE GraphQL Pool Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED POOL ENDPOINTS:
 * ✅ getPool (pool)
 * ✅ getPoolFees (pool_fees)
 * ✅ getSimulateJoinPool (simulate_join_pool)
 * ✅ getSimulateExitPool (simulate_exit_pool)
 */

import { DEFAULT_CONFIG } from '../env';

interface PoolConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for Pool operations
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
 * Get pool information - NEW IMPLEMENTATION
 */
export async function getPoolImpl(
  chainUid: string,
  poolAddress: string,
  pair: { token_1: string; token_2: string }
) {
  const query = `
    query Pool($chainUid: String!, $poolAddress: String!, $pair: PairInput!) {
      pool(chain_uid: $chainUid, pool_address: $poolAddress, pair: $pair) {
        pool_id
        pair {
          token_1
          token_2
        }
        total_liquidity
        reserves {
          token_1_reserve
          token_2_reserve
        }
        volume_24h
        volume_7d
        volume_30d
        fees_collected_24h
        fees_collected_7d
        fees_collected_30d
        fee_tier
        apy
        price_ratio
        pool_type
        status
        created_at
        last_updated
      }
    }
  `;

  const result = await executePoolQuery<{
    pool: {
      pool_id: string;
      pair: {
        token_1: string;
        token_2: string;
      };
      total_liquidity: string;
      reserves: {
        token_1_reserve: string;
        token_2_reserve: string;
      };
      volume_24h: string;
      volume_7d: string;
      volume_30d: string;
      fees_collected_24h: string;
      fees_collected_7d: string;
      fees_collected_30d: string;
      fee_tier: string;
      apy: string;
      price_ratio: string;
      pool_type: string;
      status: string;
      created_at: string;
      last_updated: string;
    };
  }>(query, { chainUid, poolAddress, pair });

  return result.pool;
}

/**
 * Get pool fees information - NEW IMPLEMENTATION
 */
export async function getPoolFeesImpl(
  chainUid: string,
  poolAddress: string,
  timeframe?: string
) {
  const query = `
    query Pool_fees($chainUid: String!, $poolAddress: String!, $timeframe: String) {
      pool(chain_uid: $chainUid, pool_address: $poolAddress) {
        pool_fees(timeframe: $timeframe) {
          total_fees_collected
          fees_by_token {
            token_id
            amount
            value_usd
          }
          fee_percentage
          timeframe
          collection_period {
            start_date
            end_date
          }
          historical_data {
            date
            fees_collected
            volume
          }
        }
      }
    }
  `;

  const result = await executePoolQuery<{
    pool: {
      pool_fees: {
        total_fees_collected: string;
        fees_by_token: Array<{
          token_id: string;
          amount: string;
          value_usd: string;
        }>;
        fee_percentage: string;
        timeframe: string;
        collection_period: {
          start_date: string;
          end_date: string;
        };
        historical_data: Array<{
          date: string;
          fees_collected: string;
          volume: string;
        }>;
      };
    };
  }>(query, { chainUid, poolAddress, timeframe });

  return result.pool.pool_fees;
}

/**
 * Simulate joining a pool - NEW IMPLEMENTATION
 */
export async function getSimulateJoinPoolImpl(
  chainUid: string,
  poolAddress: string,
  tokenAmounts: Array<{ token_id: string; amount: string }>
) {
  const query = `
    query Simulate_join_pool($chainUid: String!, $poolAddress: String!, $tokenAmounts: [TokenAmountInput!]!) {
      pool(chain_uid: $chainUid, pool_address: $poolAddress) {
        simulate_join_pool(token_amounts: $tokenAmounts) {
          liquidity_tokens_out
          price_impact
          minimum_liquidity_out
          gas_estimate
          fees_paid
          slippage_tolerance
          success
          error_message
        }
      }
    }
  `;

  const result = await executePoolQuery<{
    pool: {
      simulate_join_pool: {
        liquidity_tokens_out: string;
        price_impact: string;
        minimum_liquidity_out: string;
        gas_estimate: string;
        fees_paid: string;
        slippage_tolerance: string;
        success: boolean;
        error_message?: string;
      };
    };
  }>(query, { chainUid, poolAddress, tokenAmounts });

  return result.pool.simulate_join_pool;
}

/**
 * Simulate exiting a pool - NEW IMPLEMENTATION
 */
export async function getSimulateExitPoolImpl(
  chainUid: string,
  poolAddress: string,
  liquidityAmount: string,
  exitType?: string
) {
  const query = `
    query Simulate_exit_pool($chainUid: String!, $poolAddress: String!, $liquidityAmount: String!, $exitType: String) {
      pool(chain_uid: $chainUid, pool_address: $poolAddress) {
        simulate_exit_pool(liquidity_amount: $liquidityAmount, exit_type: $exitType) {
          tokens_out {
            token_id
            amount
            value_usd
          }
          price_impact
          minimum_tokens_out {
            token_id
            minimum_amount
          }
          gas_estimate
          fees_paid
          slippage_tolerance
          success
          error_message
        }
      }
    }
  `;

  const result = await executePoolQuery<{
    pool: {
      simulate_exit_pool: {
        tokens_out: Array<{
          token_id: string;
          amount: string;
          value_usd: string;
        }>;
        price_impact: string;
        minimum_tokens_out: Array<{
          token_id: string;
          minimum_amount: string;
        }>;
        gas_estimate: string;
        fees_paid: string;
        slippage_tolerance: string;
        success: boolean;
        error_message?: string;
      };
    };
  }>(query, { chainUid, poolAddress, liquidityAmount, exitType });

  return result.pool.simulate_exit_pool;
}
