/**
 * Lazy Factory Module - COMPLETE GraphQL Factory Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED FACTORY ENDPOINTS:
 * ✅ getAllPools (all_pools)
 * ✅ getAllTokens (all_tokens)
 * ✅ getAllowedDenoms (allowed_denoms)
 * ✅ getEscrow (escrow)
 * ✅ getTokenAddress (get_token_address)
 * ✅ getPartnerFeesCollected (partner_fees_collected)
 * ✅ getState (state)
 * ✅ getVLP (vlp)
 */

import { DEFAULT_CONFIG } from '../env';

interface FactoryConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for factory operations
 */
async function executeFactoryQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<FactoryConfig>): Promise<T> {
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
    throw new Error(`Factory query failed: ${baseMessage}`);
  }
}

/**
 * Get all pools for a factory - NEW IMPLEMENTATION
 */
export async function getAllPoolsImpl(chainUid: string, limit?: number, offset?: number) {
  const query = `
    query All_pools($chainUid: String!, $limit: Int, $offset: Int) {
      factory(chainUid: $chainUid) {
        all_pools(limit: $limit, offset: $offset) {
          pagination {
            total_count
            limit
            offset
          }
          pools {
            pair {
              token_1
              token_2
            }
            vlp
          }
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      all_pools: {
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
        pools: Array<{
          pair: {
            token_1: string;
            token_2: string;
          };
          vlp: string;
        }>;
      };
    };
  }>(query, { chainUid, limit, offset });

  return result.factory.all_pools;
}

/**
 * Get all tokens for a factory - NEW IMPLEMENTATION
 */
export async function getAllTokensImpl(chainUid: string, limit?: number, offset?: number) {
  const query = `
    query All_tokens($chainUid: String!, $limit: Int, $offset: Int) {
      factory(chainUid: $chainUid) {
        all_tokens(limit: $limit, offset: $offset) {
          tokens
          pagination {
            total_count
            limit
            offset
          }
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      all_tokens: {
        tokens: string[];
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, limit, offset });

  return result.factory.all_tokens;
}

/**
 * Get allowed denominations for a factory - NEW IMPLEMENTATION
 */
export async function getAllowedDenomsImpl(chainUid: string) {
  const query = `
    query Allowed_denoms($chainUid: String!) {
      factory(chainUid: $chainUid) {
        allowed_denoms {
          denoms
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      allowed_denoms: {
        denoms: string[];
      };
    };
  }>(query, { chainUid });

  return result.factory.allowed_denoms;
}

/**
 * Get escrow information for a token - NEW IMPLEMENTATION
 */
export async function getEscrowImpl(chainUid: string, tokenId: string) {
  const query = `
    query Escrow($chainUid: String!, $tokenId: String!) {
      factory(chainUid: $chainUid) {
        escrow(token_id: $tokenId) {
          escrow_address
          token_id
          chainUid
          denoms
          balance
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      escrow: {
        escrow_address: string;
        token_id: string;
        chainUid: string;
        denoms: string[];
        balance: string;
      };
    };
  }>(query, { chainUid, tokenId });

  return result.factory.escrow;
}

/**
 * Get token address for a token ID - NEW IMPLEMENTATION
 */
export async function getTokenAddressImpl(chainUid: string, tokenId: string) {
  const query = `
    query Get_token_address($chainUid: String!, $tokenId: String!) {
      factory(chainUid: $chainUid) {
        get_token_address(token_id: $tokenId) {
          token_address
          token_id
          chainUid
          token_type
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      get_token_address: {
        token_address: string;
        token_id: string;
        chainUid: string;
        token_type: string;
      };
    };
  }>(query, { chainUid, tokenId });

  return result.factory.get_token_address;
}

/**
 * Get partner fees collected - NEW IMPLEMENTATION
 */
export async function getPartnerFeesCollectedImpl(chainUid: string, partner: string) {
  const query = `
    query Partner_fees_collected($chainUid: String!, $partner: String!) {
      factory(chainUid: $chainUid) {
        partner_fees_collected(partner: $partner) {
          partner
          total_fees
          fees_by_token {
            token_id
            amount
          }
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      partner_fees_collected: {
        partner: string;
        total_fees: string;
        fees_by_token: Array<{
          token_id: string;
          amount: string;
        }>;
      };
    };
  }>(query, { chainUid, partner });

  return result.factory.partner_fees_collected;
}

/**
 * Get factory state - NEW IMPLEMENTATION
 */
/**
 * Get factory state - FIXED TO MATCH DOCUMENTATION
 */
export async function getStateImpl(chainUid: string) {
  const query = `
    query Factory($chainUid: String!) {
      factory(chainUid: $chainUid) {
        state {
          chainUid
          router_contract
          hub_channel
          admin
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      state: {
        chainUid: string;
        router_contract: string;
        hub_channel: string;
        admin: string;
      };
    };
  }>(query, { chainUid });

  return result.factory.state;
}

/**
 * Get VLP information for a token pair - NEW IMPLEMENTATION
 */
export async function getVLPImpl(chainUid: string, pair: { token_1: string; token_2: string }) {
  const query = `
    query VLP($chainUid: String!, $pair: PairInput!) {
      factory(chainUid: $chainUid) {
        vlp(pair: $pair) {
          vlp_address
          pair {
            token_1
            token_2
          }
          total_liquidity
          volume_24h
          fees_24h
          apr
          created_at
        }
      }
    }
  `;

  const result = await executeFactoryQuery<{
    factory: {
      vlp: {
        vlp_address: string;
        pair: {
          token_1: string;
          token_2: string;
        };
        total_liquidity: string;
        volume_24h: string;
        fees_24h: string;
        apr: string;
        created_at: string;
      };
    };
  }>(query, { chainUid, pair });

  return result.factory.vlp;
}
