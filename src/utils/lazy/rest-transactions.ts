/**
 * Lazy REST Transactions Module - COMPLETE REST API Operations
 * Extracted from massive api-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED REST ENDPOINTS:
 * ✅ getRoutes (routes)
 * ✅ postTransaction (transaction)
 * ✅ getTransactionStatus (transaction/{txHash}/status)
 * ✅ getTransactionDetails (transaction/{txHash})
 * ✅ getGasEstimate (gas/estimate)
 * ✅ getChainGasPrice (gas/price/{chainUid})
 * ✅ getBalances (balances/{address})
 * ✅ getNonce (nonce/{address})
 */

import { DEFAULT_CONFIG } from '../env';

interface RESTConfig {
  restEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight REST client for transaction operations
 */
async function executeRESTRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown,
  config?: Partial<RESTConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.apiTimeout);

  try {
    const response = await fetch(`${finalConfig.restEndpoint}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`REST request failed: ${baseMessage}`);
  }
}

/**
 * Get routing information - NEW IMPLEMENTATION
 */
export async function getRoutesImpl(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  chainUidIn?: string,
  chainUidOut?: string
) {
  const params = new URLSearchParams({
    token_in: tokenIn,
    token_out: tokenOut,
    amount_in: amountIn,
  });

  if (chainUidIn) params.append('chain_uid_in', chainUidIn);
  if (chainUidOut) params.append('chain_uid_out', chainUidOut);

  const result = await executeRESTRequest<{
    routes: Array<{
      route_id: string;
      tokens: string[];
      pools: string[];
      amount_out: string;
      price_impact: string;
      gas_estimate: string;
      fees: string;
      time_estimate: number;
    }>;
    best_route: string;
  }>(`/routes?${params}`);

  return result;
}

/**
 * Submit transaction - NEW IMPLEMENTATION
 */
export async function postTransactionImpl(transactionData: {
  tx_data: string;
  chain_uid: string;
  gas_limit?: string;
  gas_price?: string;
  memo?: string;
}) {
  const result = await executeRESTRequest<{
    tx_hash: string;
    status: string;
    block_height?: number;
    gas_used?: string;
    fee_paid?: string;
  }>('/transaction', 'POST', transactionData);

  return result;
}

/**
 * Get transaction status - NEW IMPLEMENTATION
 */
export async function getTransactionStatusImpl(txHash: string) {
  const result = await executeRESTRequest<{
    tx_hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    block_height?: number;
    block_hash?: string;
    gas_used?: string;
    fee_paid?: string;
    error_message?: string;
  }>(`/transaction/${txHash}/status`);

  return result;
}

/**
 * Get transaction details - NEW IMPLEMENTATION
 */
export async function getTransactionDetailsImpl(txHash: string) {
  const result = await executeRESTRequest<{
    tx_hash: string;
    block_height: number;
    block_hash: string;
    timestamp: string;
    gas_limit: string;
    gas_used: string;
    gas_price: string;
    fee_paid: string;
    status: string;
    events: Array<{
      type: string;
      attributes: Record<string, string>;
    }>;
    raw_log: string;
    memo?: string;
  }>(`/transaction/${txHash}`);

  return result;
}

/**
 * Get gas estimate - NEW IMPLEMENTATION
 */
export async function getGasEstimateImpl(transactionData: {
  tx_data: string;
  chain_uid: string;
  gas_adjustment?: number;
}) {
  const result = await executeRESTRequest<{
    gas_estimate: string;
    gas_price: string;
    total_fee: string;
    chain_uid: string;
  }>('/gas/estimate', 'POST', transactionData);

  return result;
}

/**
 * Get chain gas price - NEW IMPLEMENTATION
 */
export async function getChainGasPriceImpl(chainUid: string) {
  const result = await executeRESTRequest<{
    chain_uid: string;
    gas_price: string;
    gas_denom: string;
    last_updated: string;
  }>(`/gas/price/${chainUid}`);

  return result;
}

/**
 * Get account balances - NEW IMPLEMENTATION
 */
export async function getBalancesImpl(address: string, chainUid?: string) {
  const params = chainUid ? `?chain_uid=${chainUid}` : '';

  const result = await executeRESTRequest<{
    address: string;
    balances: Array<{
      denom: string;
      amount: string;
      chain_uid: string;
      usd_value?: string;
    }>;
    total_value_usd?: string;
  }>(`/balances/${address}${params}`);

  return result;
}

/**
 * Get account nonce - NEW IMPLEMENTATION
 */
export async function getNonceImpl(address: string, chainUid: string) {
  const result = await executeRESTRequest<{
    address: string;
    chain_uid: string;
    nonce: number;
    sequence: number;
    account_number: number;
  }>(`/nonce/${address}?chain_uid=${chainUid}`);

  return result;
}
