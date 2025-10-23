/**
 * Example: How to use the restored three-query market data architecture
 *
 * This shows how euclid-data-list or any component can properly subscribe
 * to the three core GraphQL queries with the correct polling behavior.
 */

import { Component, State, h } from '@stencil/core';
import { useAllMarketData, MarketDataSubscription } from '../../../utils/market-data-helper';
import type { EuclidChainConfig, TokenInfo, PoolInfo } from '../../../utils/types';

@Component({
  tag: 'euclid-data-list-example',
})
export class EuclidDataListExample {
  @State() chains: EuclidChainConfig[] = [];
  @State() tokens: TokenInfo[] = [];
  @State() pools: PoolInfo[] = [];
  @State() loading = false;

  private marketDataSubscriptions: MarketDataSubscription[] = [];

  componentDidLoad() {
    // Subscribe to all three core GraphQL queries
    // This triggers the specific polling behavior:
    // - Chains: Fetched once, cached forever
    // - Tokens: Polled every 30s (or 2min when tab hidden)
    // - Pools: Polled every 45s (or 3min when tab hidden)

    const marketData = useAllMarketData('euclid-data-list-example');

    this.chains = marketData.chains;
    this.tokens = marketData.tokens;
    this.pools = marketData.pools;
    this.loading = marketData.loading;
    this.marketDataSubscriptions = marketData.subscriptions;

    console.log('📊 Data List subscribed to market data:', {
      chains: this.chains.length,
      tokens: this.tokens.length,
      pools: this.pools.length
    });

    // The Market Data Controller will now:
    // 1. ✅ Ensure chains are loaded (if not already)
    // 2. ✅ Start polling tokens every 30s
    // 3. ✅ Start polling pools every 45s
    // 4. ✅ Use intelligent caching and deduplication
    // 5. ✅ Slow down polling when tab is hidden
  }

  disconnectedCallback() {
    // Clean up subscriptions when component unmounts
    // This stops the polling for this component
    this.marketDataSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });

    console.log('📊 Data List unsubscribed from market data');

    // If this was the last component subscribed to market data,
    // the polling will automatically stop to save resources
  }

  render() {
    if (this.loading) {
      return <div>Loading market data...</div>;
    }

    return (
      <div>
        <h3>Market Data (Three-Query Architecture)</h3>

        <div>
          <h4>Chains ({this.chains.length}) - Fetched Once</h4>
          <ul>
            {this.chains.map(chain => (
              <li key={chain.chain_uid}>
                {chain.display_name} ({chain.type})
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Tokens ({this.tokens.length}) - Polled Every 30s</h4>
          <ul>
            {this.tokens.slice(0, 5).map(token => (
              <li key={token.tokenId}>
                {token.displayName} - ${token.price}
              </li>
            ))}
            {this.tokens.length > 5 && <li>... and {this.tokens.length - 5} more</li>}
          </ul>
        </div>

        <div>
          <h4>Pools ({this.pools.length}) - Polled Every 45s</h4>
          <ul>
            {this.pools.slice(0, 5).map(pool => (
              <li key={pool.pool_id}>
                {pool.token_1}/{pool.token_2} - APR: {pool.apr}%
              </li>
            ))}
            {this.pools.length > 5 && <li>... and {this.pools.length - 5} more</li>}
          </ul>
        </div>
      </div>
    );
  }
}
