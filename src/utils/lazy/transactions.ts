/**
 * Lazy Transactions Module - REST Transaction Operations
 * Extracted from massive rest-client.ts for on-demand loading
 */

import { DEFAULT_CONFIG } from '../env';

// Import types from the main types file
import type {
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest,
  TransactionResponse,
  ApiResponse
} from '../types/api.types';

interface TransactionConfig {
  restEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight REST request executor for transactions
 */
async function executeTransactionRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
  config?: Partial<TransactionConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { method = 'GET', body, headers = {} } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.apiTimeout);

  try {
    const url = new URL(path, finalConfig.restEndpoint);

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Transaction request failed: ${baseMessage}`);
  }
}

/**
 * Build swap transaction - extracted implementation
 */
export async function buildSwapTransactionImpl(request: SwapRequest): Promise<ApiResponse<TransactionResponse>> {
  try {
    const result = await executeTransactionRequest<TransactionResponse>('/swap', {
      method: 'POST',
      body: request,
    });

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Build add liquidity transaction - extracted implementation
 */
export async function buildAddLiquidityTransactionImpl(request: AddLiquidityRequest): Promise<ApiResponse<TransactionResponse>> {
  try {
    const result = await executeTransactionRequest<TransactionResponse>('/add_liquidity', {
      method: 'POST',
      body: request,
    });

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Build remove liquidity transaction - extracted implementation
 */
export async function buildRemoveLiquidityTransactionImpl(request: RemoveLiquidityRequest): Promise<ApiResponse<TransactionResponse>> {
  try {
    const result = await executeTransactionRequest<TransactionResponse>('/remove_liquidity', {
      method: 'POST',
      body: request,
    });

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Simulate swap - extracted implementation
 */
export async function simulateSwapImpl(request: {
  amount_in: string;
  token_in: string;
  token_out: string;
  chain_uid?: string;
}): Promise<{ amount_out: string; price_impact: string }> {
  const queryParams = new URLSearchParams({
    amount_in: request.amount_in,
    token_in: request.token_in,
    token_out: request.token_out,
  });

  if (request.chain_uid) {
    queryParams.append('chain_uid', request.chain_uid);
  }

  const result = await executeTransactionRequest<{ amount_out: string; price_impact: string }>(`/simulate_swap?${queryParams}`);
  return result;
}
