/**
 * Lazy CW Module - COMPLETE GraphQL CosmWasm Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED CW ENDPOINTS:
 * ✅ getContractInfo (contract_info)
 * ✅ getContractState (contract_state)
 */

import { DEFAULT_CONFIG } from '../env';

interface CWConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for CosmWasm operations
 */
async function executeCWQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<CWConfig>): Promise<T> {
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
    throw new Error(`CW query failed: ${baseMessage}`);
  }
}

/**
 * Get contract information - NEW IMPLEMENTATION
 */
export async function getContractInfoImpl(chainUid: string, contractAddress: string) {
  const query = `
    query Contract_info($chainUid: String!, $contractAddress: String!) {
      cw(chain_uid: $chainUid, contract_address: $contractAddress) {
        contract_info {
          contract_address
          code_id
          creator
          admin
          label
          created_at
          init_msg
          contract_type
          instantiated_by
          last_updated
        }
      }
    }
  `;

  const result = await executeCWQuery<{
    cw: {
      contract_info: {
        contract_address: string;
        code_id: number;
        creator: string;
        admin: string;
        label: string;
        created_at: string;
        init_msg: Record<string, unknown>;
        contract_type: string;
        instantiated_by: string;
        last_updated: string;
      };
    };
  }>(query, { chainUid, contractAddress });

  return result.cw.contract_info;
}

/**
 * Get contract state - NEW IMPLEMENTATION
 */
export async function getContractStateImpl(
  chainUid: string,
  contractAddress: string,
  queryMsg?: Record<string, unknown>
) {
  const query = `
    query Contract_state($chainUid: String!, $contractAddress: String!, $queryMsg: JSON) {
      cw(chain_uid: $chainUid, contract_address: $contractAddress) {
        contract_state(query_msg: $queryMsg) {
          state_data
          last_updated
          block_height
          query_result
        }
      }
    }
  `;

  const result = await executeCWQuery<{
    cw: {
      contract_state: {
        state_data: Record<string, unknown>;
        last_updated: string;
        block_height: number;
        query_result: Record<string, unknown>;
      };
    };
  }>(query, { chainUid, contractAddress, queryMsg });

  return result.cw.contract_state;
}
