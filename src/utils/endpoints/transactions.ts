/**
 * Transaction Endpoints - Lazy Loaded
 * Transaction building, broadcasting, and monitoring endpoints
 */

import type { EndpointCategory } from './base';

export const TRANSACTION_ENDPOINTS: EndpointCategory = {
  name: 'transactions',
  endpoints: [
    {
      id: 'buildSwapTransaction',
      method: 'POST',
      path: '/swap',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'high',
    },
    {
      id: 'buildAddLiquidityTransaction',
      method: 'POST',
      path: '/add_liquidity',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'high',
    },
    {
      id: 'buildRemoveLiquidityTransaction',
      method: 'POST',
      path: '/remove_liquidity',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'high',
    },
    {
      id: 'broadcastTransaction',
      method: 'POST',
      path: '/transactions/broadcast',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'high',
    },
    {
      id: 'getTransactionStatus',
      method: 'GET',
      path: '/transaction',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'high',
    },
    {
      id: 'getTransactionDetails',
      method: 'GET',
      path: '/transactions',
      type: 'rest',
      cacheStrategy: 'moderate',
      priority: 'normal',
    },
    {
      id: 'estimateTransactionFees',
      method: 'POST',
      path: '/transactions/estimate_fees',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'normal',
    },
    {
      id: 'simulateTransaction',
      method: 'POST',
      path: '/transactions/simulate',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'normal',
    },
    {
      id: 'getUserTransactions',
      method: 'GET',
      path: '/transactions/user',
      type: 'rest',
      cacheStrategy: 'moderate',
      priority: 'normal',
    },
    {
      id: 'getPendingTransactions',
      method: 'GET',
      path: '/transactions/pending',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'normal',
    },
    {
      id: 'batchTransactions',
      method: 'POST',
      path: '/transactions/batch',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'normal',
    },
  ],
};

export default TRANSACTION_ENDPOINTS;
