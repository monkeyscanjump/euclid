/**
 * Lazy VCoin Module - COMPLETE GraphQL VCoin Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED VCOIN ENDPOINTS:
 * ✅ getAllBalances (all_balances)
 * ✅ getTotalSupply (total_supply)
 * ✅ getUserBalance (user_balance)
 */

import { DEFAULT_CONFIG } from '../env';

interface VCoinConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for VCoin operations
 */
async function executeVCoinQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<VCoinConfig>): Promise<T> {
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
    throw new Error(`VCoin query failed: ${baseMessage}`);
  }
}

/**
 * Get all balances from VCoin - NEW IMPLEMENTATION
 */
export async function getAllBalancesImpl(
  chainUid: string,
  vcoinAddress: string,
  limit?: number,
  offset?: number
) {
  const query = `
    query All_balances($chainUid: String!, $vcoinAddress: String!, $limit: Int, $offset: Int) {
      vcoin(chainUid: $chainUid, vcoinAddress: $vcoinAddress) {
        all_balances(limit: $limit, offset: $offset) {
          balances {
            user_address
            balance
            chainUid
            last_updated
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

  const result = await executeVCoinQuery<{
    vcoin: {
      all_balances: {
        balances: Array<{
          user_address: string;
          balance: string;
          chain_uid: string;
          last_updated: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, vcoinAddress, limit, offset });

  return result.vcoin.all_balances;
}

/**
 * Get total supply from VCoin - NEW IMPLEMENTATION
 */
export async function getTotalSupplyImpl(chainUid: string, vcoinAddress: string) {
  const query = `
    query Total_supply($chainUid: String!, $vcoinAddress: String!) {
      vcoin(chainUid: $chainUid, vcoinAddress: $vcoinAddress) {
        total_supply {
          total_supply
          circulating_supply
          max_supply
          token_info {
            symbol
            name
            decimals
          }
          last_updated
        }
      }
    }
  `;

  const result = await executeVCoinQuery<{
    vcoin: {
      total_supply: {
        total_supply: string;
        circulating_supply: string;
        max_supply: string;
        token_info: {
          symbol: string;
          name: string;
          decimals: number;
        };
        last_updated: string;
      };
    };
  }>(query, { chainUid, vcoinAddress });

  return result.vcoin.total_supply;
}

/**
 * Get user balance from VCoin - NEW IMPLEMENTATION
 */
export async function getUserBalanceImpl(
  chainUid: string,
  vcoinAddress: string,
  userAddress: string
) {
  const query = `
    query User_balance($chainUid: String!, $vcoinAddress: String!, $userAddress: String!) {
      vcoin(chainUid: $chainUid, vcoinAddress: $vcoinAddress) {
        user_balance(user_address: $userAddress) {
          user_address
          balance
          virtual_balance
          locked_balance
          available_balance
          chainUid
          last_updated
          transaction_history {
            tx_hash
            amount
            type
            timestamp
          }
        }
      }
    }
  `;

  const result = await executeVCoinQuery<{
    vcoin: {
      user_balance: {
        user_address: string;
        balance: string;
        virtual_balance: string;
        locked_balance: string;
        available_balance: string;
        chain_uid: string;
        last_updated: string;
        transaction_history: Array<{
          tx_hash: string;
          amount: string;
          type: string;
          timestamp: string;
        }>;
      };
    };
  }>(query, { chainUid, vcoinAddress, userAddress });

  return result.vcoin.user_balance;
}
