/**
 * Lazy Router Module - COMPLETE GraphQL Router Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED ROUTER ENDPOINTS:
 * ✅ getAllChains (all_chains)
 * ✅ getAllEscrows (all_escrows)
 * ✅ getAllTokens (all_tokens)
 * ✅ getAllVLPs (all_vlps)
 * ✅ getChain (chain)
 * ✅ getEscrows (escrows)
 * ✅ simulateEscrowRelease (simulate_escrow_release)
 * ✅ simulateSwap (simulate_swap)
 * ✅ getState (state)
 * ✅ getTokenDenoms (token_denoms)
 * ✅ getTokenPairFromVLP (token_pair_from_vlp)
 * ✅ getVLP (vlp)
 */

import { DEFAULT_CONFIG } from '../env';

interface RouterConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for router operations
 */
async function executeRouterQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<RouterConfig>): Promise<T> {
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
    throw new Error(`Router query failed: ${baseMessage}`);
  }
}

/**
 * Get all chains from router - FIXED TO MATCH DOCUMENTATION
 */
export async function getAllChainsImpl() {
  const query = `
    query Router {
      router {
        all_chains {
          factory_address
          chain_id
          chain_uid
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      all_chains: Array<{
        factory_address: string;
        chain_id: string;
        chain_uid: string;
      }>;
    };
  }>(query);

  return result.router.all_chains;
}

/**
 * Get all escrows - NEW IMPLEMENTATION
 */
export async function getAllEscrowsImpl(limit?: number, offset?: number) {
  const query = `
    query All_escrows($limit: Int, $offset: Int) {
      router {
        all_escrows(limit: $limit, offset: $offset) {
          escrows {
            escrow_address
            token_id
            chain_uid
            balance
            denoms
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

  const result = await executeRouterQuery<{
    router: {
      all_escrows: {
        escrows: Array<{
          escrow_address: string;
          token_id: string;
          chain_uid: string;
          balance: string;
          denoms: string[];
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { limit, offset });

  return result.router.all_escrows;
}

/**
 * Get all tokens from router - NEW IMPLEMENTATION
 */
export async function getAllTokensImpl(limit?: number, offset?: number) {
  const query = `
    query All_tokens($limit: Int, $offset: Int) {
      router {
        all_tokens(limit: $limit, offset: $offset) {
          tokens {
            token_id
            display_name
            type
            denoms
            chains
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

  const result = await executeRouterQuery<{
    router: {
      all_tokens: {
        tokens: Array<{
          token_id: string;
          display_name: string;
          type: string;
          denoms: string[];
          chains: string[];
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { limit, offset });

  return result.router.all_tokens;
}

/**
 * Get all VLPs from router - NEW IMPLEMENTATION
 */
export async function getAllVLPsImpl(limit?: number, offset?: number) {
  const query = `
    query All_vlps($limit: Int, $offset: Int) {
      router {
        all_vlps(limit: $limit, offset: $offset) {
          vlps {
            vlp_address
            pair {
              token_1
              token_2
            }
            total_liquidity
            chains
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

  const result = await executeRouterQuery<{
    router: {
      all_vlps: {
        vlps: Array<{
          vlp_address: string;
          pair: {
            token_1: string;
            token_2: string;
          };
          total_liquidity: string;
          chains: string[];
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { limit, offset });

  return result.router.all_vlps;
}

/**
 * Get specific chain info from router - NEW IMPLEMENTATION
 */
export async function getChainImpl(chainUid: string) {
  const query = `
    query Chain($chainUid: String!) {
      router {
        chain(chain_uid: $chainUid) {
          chain_uid
          display_name
          type
          status
          router_address
          factory_address
          supported_tokens
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      chain: {
        chain_uid: string;
        display_name: string;
        type: string;
        status: string;
        router_address: string;
        factory_address: string;
        supported_tokens: string[];
      };
    };
  }>(query, { chainUid });

  return result.router.chain;
}

/**
 * Get escrows for a specific chain - NEW IMPLEMENTATION
 */
export async function getEscrowsImpl(chainUid: string, limit?: number, offset?: number) {
  const query = `
    query Escrows($chainUid: String!, $limit: Int, $offset: Int) {
      router {
        escrows(chain_uid: $chainUid, limit: $limit, offset: $offset) {
          escrows {
            escrow_address
            token_id
            balance
            denoms
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

  const result = await executeRouterQuery<{
    router: {
      escrows: {
        escrows: Array<{
          escrow_address: string;
          token_id: string;
          balance: string;
          denoms: string[];
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { chainUid, limit, offset });

  return result.router.escrows;
}

/**
 * Simulate escrow release - NEW IMPLEMENTATION
 */
export async function simulateEscrowReleaseImpl(escrowId: string, recipient: string) {
  const query = `
    query Simulate_escrow_release($escrowId: String!, $recipient: String!) {
      router {
        simulate_escrow_release(escrow_id: $escrowId, recipient: $recipient) {
          amount_released
          fees_paid
          gas_estimate
          success
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      simulate_escrow_release: {
        amount_released: string;
        fees_paid: string;
        gas_estimate: string;
        success: boolean;
      };
    };
  }>(query, { escrowId, recipient });

  return result.router.simulate_escrow_release;
}

/**
 * Simulate swap through router - NEW IMPLEMENTATION
 */
export async function simulateSwapImpl(
  assetIn: string,
  amountIn: string,
  assetOut: string,
  minAmountOut: string,
  swaps: string[]
) {
  const query = `
    query Simulate_swap($assetIn: String!, $amountIn: String!, $assetOut: String!, $minAmountOut: String!, $swaps: [String!]) {
      router {
        simulate_swap(asset_in: $assetIn, amount_in: $amountIn, asset_out: $assetOut, min_amount_out: $minAmountOut, swaps: $swaps) {
          amount_out
          asset_out
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      simulate_swap: {
        amount_out: string;
        asset_out: string;
      };
    };
  }>(query, { assetIn, amountIn, assetOut, minAmountOut, swaps });

  return result.router.simulate_swap;
}

/**
 * Get router state - FIXED TO MATCH ACTUAL SCHEMA
 */
export async function getStateImpl() {
  const query = `
    query State {
      router {
        state {
          admin
          vlp_code_id
          virtual_balance_address
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      state: {
        admin: string;
        vlp_code_id: number;
        virtual_balance_address: string;
      };
    };
  }>(query);

  return result.router.state;
}

/**
 * Get token denominations - FIXED TO MATCH ACTUAL SCHEMA
 */
export async function getTokenDenomsImpl(tokenId: string) {
  const query = `
    query Token_denoms($token: String!) {
      router {
        token_denoms(token: $token) {
          denoms {
            chain_uid
            token_type {
              __typename
            }
          }
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      token_denoms: {
        denoms: Array<{
          chain_uid: string;
          token_type: {
            __typename: string;
          };
        }>;
      };
    };
  }>(query, { token: tokenId });

  return result.router.token_denoms;
}

/**
 * Get token pair from VLP - FIXED FIELD NAME
 */
export async function getTokenPairFromVLPImpl(vlp: string) {
  const query = `
    query Token_pairs_from_vlp($vlp: String!) {
      router {
        token_pairs_from_vlp(vlp: $vlp) {
          pair {
            token_1
            token_2
          }
          vlp_address
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      token_pairs_from_vlp: {
        pair: {
          token_1: string;
          token_2: string;
        };
        vlp_address: string;
      };
    };
  }>(query, { vlp });

  return result.router.token_pairs_from_vlp;
}

/**
 * Get VLP info from router - NEW IMPLEMENTATION
 */
export async function getVLPImpl(pair: { token_1: string; token_2: string }) {
  const query = `
    query VLP($pair: PairInput!) {
      router {
        vlp(pair: $pair) {
          vlp_address
          pair {
            token_1
            token_2
          }
          total_liquidity
          chains
          status
        }
      }
    }
  `;

  const result = await executeRouterQuery<{
    router: {
      vlp: {
        vlp_address: string;
        pair: {
          token_1: string;
          token_2: string;
        };
        total_liquidity: string;
        chains: string[];
        status: string;
      };
    };
  }>(query, { pair });

  return result.router.vlp;
}
