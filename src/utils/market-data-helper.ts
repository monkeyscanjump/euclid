/**
 * Market Data Helper
 *
 * Helper functions for components to easily access and subscribe to the three core GraphQL data types:
 * 1. Chains (fetched once per session)
 * 2. Token metadata (polled every 30s when subscribed)
 * 3. Pools (polled every 45s when subscribed)
 */

import { marketStore } from '../store/market.store';
import { dataSubscriptionManager } from './data-subscription-manager';
import type { EuclidChainConfig, TokenInfo, PoolInfo } from './types';

export interface MarketDataSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribe to and get chains data
 * Chains are fetched once per session and cached
 */
export function useChains(componentId: string): {
  chains: EuclidChainConfig[];
  subscription: MarketDataSubscription;
} {
  // Chains don't need subscription polling since they're fetched once
  // But we still track the subscription for consistency
  const subscriptionId = dataSubscriptionManager.subscribe(componentId, 'marketData', {
    dataSubtype: 'chains'
  });

  return {
    chains: marketStore.state.chains,
    subscription: {
      unsubscribe: () => dataSubscriptionManager.unsubscribe(subscriptionId)
    }
  };
}

/**
 * Subscribe to and get tokens data
 * Tokens are polled every 30 seconds when subscribed
 */
export function useTokens(componentId: string): {
  tokens: TokenInfo[];
  loading: boolean;
  subscription: MarketDataSubscription;
} {
  const subscriptionId = dataSubscriptionManager.subscribe(componentId, 'tokenPrices', {
    dataSubtype: 'tokens'
  });

  return {
    tokens: marketStore.state.tokens,
    loading: marketStore.state.loading,
    subscription: {
      unsubscribe: () => dataSubscriptionManager.unsubscribe(subscriptionId)
    }
  };
}

/**
 * Subscribe to and get pools data
 * Pools are polled every 45 seconds when subscribed
 */
export function usePools(componentId: string): {
  pools: PoolInfo[];
  loading: boolean;
  subscription: MarketDataSubscription;
} {
  const subscriptionId = dataSubscriptionManager.subscribe(componentId, 'marketData', {
    dataSubtype: 'pools'
  });

  return {
    pools: marketStore.state.pools,
    loading: marketStore.state.loading,
    subscription: {
      unsubscribe: () => dataSubscriptionManager.unsubscribe(subscriptionId)
    }
  };
}

/**
 * Get specific chain by chainUID
 */
export function getChain(chainUID: string): EuclidChainConfig | undefined {
  return marketStore.getChain(chainUID);
}

/**
 * Get specific token by tokenId
 */
export function getToken(tokenId: string): TokenInfo | undefined {
  return marketStore.getToken(tokenId);
}

/**
 * Get pool by token pair
 */
export function getPool(token1: string, token2: string): PoolInfo | undefined {
  return marketStore.state.pools.find(pool =>
    (pool.token_1 === token1 && pool.token_2 === token2) ||
    (pool.token_1 === token2 && pool.token_2 === token1)
  );
}

/**
 * Subscribe to all market data at once
 * Useful for components like data lists that need everything
 */
export function useAllMarketData(componentId: string): {
  chains: EuclidChainConfig[];
  tokens: TokenInfo[];
  pools: PoolInfo[];
  loading: boolean;
  subscriptions: MarketDataSubscription[];
} {
  const chainsSubscription = dataSubscriptionManager.subscribe(componentId, 'marketData', {
    dataSubtype: 'chains'
  });

  const tokensSubscription = dataSubscriptionManager.subscribe(componentId, 'tokenPrices', {
    dataSubtype: 'tokens'
  });

  const poolsSubscription = dataSubscriptionManager.subscribe(componentId, 'marketData', {
    dataSubtype: 'pools'
  });

  return {
    chains: marketStore.state.chains,
    tokens: marketStore.state.tokens,
    pools: marketStore.state.pools,
    loading: marketStore.state.loading,
    subscriptions: [
      { unsubscribe: () => dataSubscriptionManager.unsubscribe(chainsSubscription) },
      { unsubscribe: () => dataSubscriptionManager.unsubscribe(tokensSubscription) },
      { unsubscribe: () => dataSubscriptionManager.unsubscribe(poolsSubscription) }
    ]
  };
}

/**
 * Unsubscribe from all market data subscriptions for a component
 */
export function unsubscribeFromMarketData(componentId: string): void {
  dataSubscriptionManager.unsubscribeComponent(componentId);
}
