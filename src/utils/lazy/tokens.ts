/**
 * Lazy Tokens Module - GraphQL Token Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 */

import { DEFAULT_CONFIG } from '../env';

interface TokenConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for tokens
 */
async function executeTokenQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<TokenConfig>): Promise<T> {
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
    throw new Error(`Token query failed: ${baseMessage}`);
  }
}

/**
 * Get token metadata - extracted implementation
 */
export async function getTokenMetadataImpl(options?: {
  limit?: number;
  offset?: number;
  verified?: boolean;
  dex?: string[];
  chainUids?: string[];
  showVolume?: boolean;
  search?: string;
}) {
  const query = `
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
          chainUids: $chainUids,
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
          chainUids
          total_volume
          total_volume_24h
          tags
          min_swap_value
          social
          is_verified
        }
      }
    }
  `;

  const result = await executeTokenQuery<{
    token: {
      token_metadatas: Array<{
        coinDecimal: number;
        displayName: string;
        tokenId: string;
        description: string;
        image: string;
        price: number;
        price_change_24h: number;
        price_change_7d: number;
        dex: string[];
        chainUids: string[];
        total_volume: string;
        total_volume_24h: string;
        tags: string[];
        min_swap_value: string;
        social: Record<string, string>;
        is_verified: boolean;
      }>;
    };
  }>(query, options);

  // Convert string fields to numbers as expected by TypeScript interfaces
  return result.token.token_metadatas.map(token => ({
    ...token,
    price: token.price.toString(),
    total_volume: parseFloat(token.total_volume) || 0,
    total_volume_24h: parseFloat(token.total_volume_24h) || 0,
    min_swap_value: parseFloat(token.min_swap_value) || 0,
  }));
}

/**
 * Get token by ID - extracted implementation
 */
export async function getTokenByIdImpl(tokenId: string) {
  const query = `
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
          chainUids
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
  `;

  const result = await executeTokenQuery<{
    token: {
      token_metadata: {
        coinDecimal: number;
        displayName: string;
        tokenId: string;
        description: string;
        image: string;
        price: string;
        price_change_24h: number;
        price_change_7d: number;
        dex: string[];
        chainUids: string[];
        total_volume: string;
        total_volume_24h: string;
        tags: string[];
        min_swap_value: string;
        social: Record<string, string>;
        is_verified: boolean;
        market_cap: string;
        circulating_supply: string;
        total_supply: string;
        max_supply: string;
        holders_count: number;
      } | null;
    };
  }>(query, { tokenId });

  const token = result.token.token_metadata;
  if (!token) return null;

  // Convert string fields to numbers as expected by TypeScript interfaces
  return {
    ...token,
    total_volume: parseFloat(token.total_volume) || 0,
    total_volume_24h: parseFloat(token.total_volume_24h) || 0,
    min_swap_value: parseFloat(token.min_swap_value) || 0,
    market_cap: parseFloat(token.market_cap) || 0,
    circulating_supply: parseFloat(token.circulating_supply) || 0,
    total_supply: parseFloat(token.total_supply) || 0,
    max_supply: parseFloat(token.max_supply) || 0,
  };
}

/**
 * Search tokens - extracted implementation
 */
export async function searchTokensImpl(searchTerm: string, chainUID?: string) {
  const variables: Record<string, unknown> = { search: searchTerm };
  if (chainUID) {
    variables.chainUids = [chainUID];
  }

  return getTokenMetadataImpl(variables);
}

/**
 * Get token by symbol - extracted implementation
 */
export async function getTokenBySymbolImpl(symbol: string, chainUID: string) {
  const results = await getTokenMetadataImpl({
    search: symbol,
    chainUids: [chainUID],
    limit: 1
  });

  return results.length > 0 ? results[0] : null;
}

/**
 * Get token price - NEW IMPLEMENTATION
 */
export async function getTokenPriceImpl(tokenId: string) {
  const query = `
    query Token_price($tokenId: String!) {
      token {
        token_price(token_id: $tokenId) {
          token_id
          price_usd
          price_change_24h
          price_change_7d
          price_change_30d
          market_cap
          volume_24h
          last_updated
        }
      }
    }
  `;

  const result = await executeTokenQuery<{
    token: {
      token_price: {
        token_id: string;
        price_usd: string;
        price_change_24h: string;
        price_change_7d: string;
        price_change_30d: string;
        market_cap: string;
        volume_24h: string;
        last_updated: string;
      };
    };
  }>(query, { tokenId });

  return result.token.token_price;
}

/**
 * Get token history - NEW IMPLEMENTATION
 */
export async function getTokenHistoryImpl(tokenId: string, timeframe?: string, limit?: number) {
  const query = `
    query Token_history($tokenId: String!, $timeframe: String, $limit: Int) {
      token {
        token_history(token_id: $tokenId, timeframe: $timeframe, limit: $limit) {
          historical_data {
            timestamp
            price_usd
            volume_24h
            market_cap
          }
          timeframe
          token_id
        }
      }
    }
  `;

  const result = await executeTokenQuery<{
    token: {
      token_history: {
        historical_data: Array<{
          timestamp: string;
          price_usd: string;
          volume_24h: string;
          market_cap: string;
        }>;
        timeframe: string;
        token_id: string;
      };
    };
  }>(query, { tokenId, timeframe, limit });

  return result.token.token_history;
}

/**
 * Get token supply - NEW IMPLEMENTATION
 */
export async function getTokenSupplyImpl(tokenId: string) {
  const query = `
    query Token_supply($tokenId: String!) {
      token {
        token_supply(token_id: $tokenId) {
          token_id
          total_supply
          circulating_supply
          max_supply
          holders_count
          supply_type
          last_updated
        }
      }
    }
  `;

  const result = await executeTokenQuery<{
    token: {
      token_supply: {
        token_id: string;
        total_supply: string;
        circulating_supply: string;
        max_supply: string;
        holders_count: number;
        supply_type: string;
        last_updated: string;
      };
    };
  }>(query, { tokenId });

  return result.token.token_supply;
}

/**
 * Get token transfers - NEW IMPLEMENTATION
 */
export async function getTokenTransfersImpl(tokenId: string, limit?: number, offset?: number) {
  const query = `
    query Token_transfers($tokenId: String!, $limit: Int, $offset: Int) {
      token {
        token_transfers(token_id: $tokenId, limit: $limit, offset: $offset) {
          transfers {
            tx_hash
            from_address
            to_address
            amount
            timestamp
            block_height
            chainUid
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

  const result = await executeTokenQuery<{
    token: {
      token_transfers: {
        transfers: Array<{
          tx_hash: string;
          from_address: string;
          to_address: string;
          amount: string;
          timestamp: string;
          block_height: number;
          chainUid: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { tokenId, limit, offset });

  return result.token.token_transfers;
}

/**
 * Get token holders - NEW IMPLEMENTATION
 */
export async function getTokenHoldersImpl(tokenId: string, limit?: number, offset?: number) {
  const query = `
    query Token_holders($tokenId: String!, $limit: Int, $offset: Int) {
      token {
        token_holders(token_id: $tokenId, limit: $limit, offset: $offset) {
          holders {
            address
            balance
            percentage
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

  const result = await executeTokenQuery<{
    token: {
      token_holders: {
        holders: Array<{
          address: string;
          balance: string;
          percentage: string;
          chainUid: string;
          last_updated: string;
        }>;
        pagination: {
          total_count: number;
          limit: number;
          offset: number;
        };
      };
    };
  }>(query, { tokenId, limit, offset });

  return result.token.token_holders;
}

/**
 * Get top tokens - NEW IMPLEMENTATION
 */
export async function getTopTokensImpl(sortBy?: string, limit?: number, timeframe?: string) {
  const query = `
    query Top_tokens($sortBy: String, $limit: Int, $timeframe: String) {
      token {
        top_tokens(sort_by: $sortBy, limit: $limit, timeframe: $timeframe) {
          tokens {
            token_id
            display_name
            symbol
            price_usd
            market_cap
            volume_24h
            price_change_24h
            rank
          }
          sort_criteria
          timeframe
        }
      }
    }
  `;

  const result = await executeTokenQuery<{
    token: {
      top_tokens: {
        tokens: Array<{
          token_id: string;
          display_name: string;
          symbol: string;
          price_usd: string;
          market_cap: string;
          volume_24h: string;
          price_change_24h: string;
          rank: number;
        }>;
        sort_criteria: string;
        timeframe: string;
      };
    };
  }>(query, { sortBy, limit, timeframe });

  return result.token.top_tokens;
}
