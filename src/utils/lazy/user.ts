/**
 * Lazy User Module - GraphQL User Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 */

import { DEFAULT_CONFIG } from '../env';

interface UserConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

interface CrossChainUser {
  address: string;
  chain_uid: string;
}

interface UserBalance {
  amount: string;
  token_id: string;
}

/**
 * Lightweight GraphQL query executor for user operations
 */
async function executeUserQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<UserConfig>): Promise<T> {
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
    throw new Error(`User query failed: ${baseMessage}`);
  }
}

/**
 * Get user balances - extracted implementation
 */
export async function getUserBalancesImpl(user: CrossChainUser): Promise<UserBalance[]> {
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

  const result = await executeUserQuery<{
    vcoin: {
      user_balance: {
        balances: UserBalance[];
      };
    };
  }>(query, { user });

  return result.vcoin.user_balance.balances;
}
