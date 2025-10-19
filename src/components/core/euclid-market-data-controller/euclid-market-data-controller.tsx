import { Component, h, State, Listen } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import { apiClient } from '../../../utils/api-client';
import { DEFAULTS } from '../../../utils/constants';

@Component({
  tag: 'euclid-market-data-controller',
  shadow: true,
})
export class EuclidMarketDataController {
  @State() isInitialized = false;
  private refreshInterval: number;

  async componentDidLoad() {
    await this.initialize();
  }

  disconnectedCallback() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private async initialize() {
    // Set up periodic market data refresh
    this.setupPeriodicRefresh();

    this.isInitialized = true;
    console.log('📊 Market Data Controller initialized');
  }

  private setupPeriodicRefresh() {
    // Refresh market data every 5 minutes
    this.refreshInterval = window.setInterval(async () => {
      if (marketStore.isDataStale()) {
        console.log('🔄 Refreshing stale market data...');
        await this.refreshMarketData();
      }
    }, DEFAULTS.MARKET_DATA_REFRESH_INTERVAL);
  }

  private async refreshMarketData() {
    try {
      marketStore.setLoading(true);

      // Refresh chains data
      const chainsResponse = await apiClient.getAllChains(false);
      if (chainsResponse.success && chainsResponse.data) {
        marketStore.setChains(chainsResponse.data.chains.all_chains);
      }

      // Refresh tokens data
      const tokensResponse = await apiClient.getAllTokens();
      if (tokensResponse.success && tokensResponse.data) {
        const tokens = tokensResponse.data.router.all_tokens.tokens.map(tokenId => ({
          id: tokenId,
          symbol: tokenId.toUpperCase(),
          name: tokenId.charAt(0).toUpperCase() + tokenId.slice(1),
          decimals: 6,
          chainUID: 'vsl',
          logo: `/assets/tokens/${tokenId}.png`,
        }));
        marketStore.setTokens(tokens);
      }

      console.log('✅ Market data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh market data:', error);
    } finally {
      marketStore.setLoading(false);
    }
  }

  @Listen('euclidRefreshMarketData', { target: 'window' })
  async handleRefreshRequest() {
    console.log('🔄 Manual market data refresh requested');
    await this.refreshMarketData();
  }

  @Listen('euclidLoadTokenDetails', { target: 'window' })
  async handleTokenDetailsRequest(event: CustomEvent<{ tokenId: string }>) {
    const { tokenId } = event.detail;
    console.log('📋 Loading token details for:', tokenId);

    try {
      // Get token denominations across all chains
      const denomsResponse = await apiClient.getTokenDenoms(tokenId);
      if (denomsResponse.success && denomsResponse.data) {
        const denoms = denomsResponse.data.router.token_denoms.denoms;

        // Emit token details loaded event
        window.dispatchEvent(new CustomEvent('euclidTokenDetailsLoaded', {
          detail: { tokenId, denoms }
        }));
      }

      // Get escrow information
      const escrowsResponse = await apiClient.getEscrows(tokenId);
      if (escrowsResponse.success && escrowsResponse.data) {
        const escrows = escrowsResponse.data.router.escrows;

        // Emit escrow info loaded event
        window.dispatchEvent(new CustomEvent('euclidEscrowsLoaded', {
          detail: { tokenId, escrows }
        }));
      }
    } catch (error) {
      console.error('Failed to load token details:', error);

      window.dispatchEvent(new CustomEvent('euclidTokenDetailsError', {
        detail: { tokenId, error: error.message }
      }));
    }
  }

  @Listen('euclidLoadChainDetails', { target: 'window' })
  async handleChainDetailsRequest(event: CustomEvent<{ chainUID: string }>) {
    const { chainUID } = event.detail;
    console.log('🔗 Loading chain details for:', chainUID);

    try {
      // Get chain-specific data
      const chain = marketStore.getChain(chainUID);
      if (chain) {
        // Emit chain details loaded event
        window.dispatchEvent(new CustomEvent('euclidChainDetailsLoaded', {
          detail: { chainUID, chain }
        }));
      } else {
        // Refresh chains if not found
        await this.refreshMarketData();
      }
    } catch (error) {
      console.error('Failed to load chain details:', error);

      window.dispatchEvent(new CustomEvent('euclidChainDetailsError', {
        detail: { chainUID, error: error.message }
      }));
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
