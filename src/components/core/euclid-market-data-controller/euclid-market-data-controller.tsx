import { Component, h, State, Listen, Prop } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import { createAPIClient } from '../../../utils/api-client';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { requestManager } from '../../../utils/request-manager';
import { pollingCoordinator } from '../../../utils/polling-coordinator';
import type { EuclidConfig } from '../../../utils/env';
import { DEFAULT_CONFIG } from '../../../utils/env';

@Component({
  tag: 'euclid-market-data-controller',
})
export class EuclidMarketDataController {
  @State() isInitialized = false;
  @Prop() config?: string; // JSON string of EuclidConfig

  private euclidConfig: EuclidConfig;
  private apiClient: ReturnType<typeof createAPIClient>;

  async componentWillLoad() {
    // Parse configuration
    this.euclidConfig = this.config ? JSON.parse(this.config) : DEFAULT_CONFIG;

    // Create configured API client
    this.apiClient = createAPIClient(this.euclidConfig);
  }

  async componentDidLoad() {
    await this.initialize();
  }

  disconnectedCallback() {
    // Clean up polling
    pollingCoordinator.unregister('market-data-refresh');
  }

  private async initialize() {
    console.log('📊 Initializing Market Data Controller...');

    // Load initial market data
    await this.loadInitialData();

    // Set up periodic market data refresh
    this.setupPeriodicRefresh();

    this.isInitialized = true;
    console.log('📊 Market Data Controller initialized');
  }

  private async loadInitialData() {
    return requestManager.request(
      'market-initial-data',
      async () => {
        try {
          marketStore.setLoading(true);

          console.log('📊 Loading initial market data...');

          // Load chains, tokens, and pools in parallel using new API methods
          const [chains, tokens, poolsResponse] = await Promise.all([
            this.apiClient.getChains({ showAllChains: false }),
            this.apiClient.getTokenMetadata(),
            this.apiClient.getAllPools()
          ]);

          // Process chains
          if (chains && chains.length > 0) {
            marketStore.setChains(chains);
            console.log('📡 Loaded chains:', chains.length);
          } else {
            console.warn('No chains data received');
          }

          // Process tokens
          if (tokens && tokens.length > 0) {
            marketStore.setTokens(tokens);
            console.log('🪙 Loaded tokens:', tokens.length);
          } else {
            console.warn('No tokens data received');
          }

          // Process pools
          if (poolsResponse.success && poolsResponse.data) {
            marketStore.setPools(poolsResponse.data);
            console.log('🏊 Loaded pools:', poolsResponse.data.length);
          } else {
            console.warn('Failed to load pools:', poolsResponse.error);
          }

          return { success: true };
        } catch (error) {
          console.error('Failed to load initial market data:', error);
          throw error;
        } finally {
          marketStore.setLoading(false);
        }
      },
      { ttl: this.euclidConfig.performance.cache.marketData }
    );
  }

  private setupPeriodicRefresh() {
    // Register polling task with the coordinator
    pollingCoordinator.register(
      'market-data-refresh',
      () => this.refreshMarketData().then(() => {}),
      {
        activeInterval: this.euclidConfig.performance.polling.active.marketData,
        backgroundInterval: this.euclidConfig.performance.polling.background.marketData,
        pauseOnHidden: this.euclidConfig.performance.pauseOnHidden
      }
    );

    console.log('📊 Market data polling registered with coordinator');
  }

  private async refreshMarketData() {
    // Only refresh if data is actually stale
    if (!marketStore.isDataStale(this.euclidConfig.performance.cache.marketData)) {
      return;
    }

    return requestManager.request(
      'market-refresh',
      async () => {
        try {
          marketStore.setLoading(true);

          // Refresh chains and tokens data in parallel using new API methods
          const [chains, tokens] = await Promise.all([
            this.apiClient.getChains({ showAllChains: false }),
            this.apiClient.getTokenMetadata()
          ]);

          if (chains && chains.length > 0) {
            marketStore.setChains(chains);
          }

          if (tokens && tokens.length > 0) {
            marketStore.setTokens(tokens);
          }

          console.log('✅ Market data refreshed successfully');
          return { success: true };
        } catch (error) {
          console.error('❌ Failed to refresh market data:', error);
          throw error;
        } finally {
          marketStore.setLoading(false);
        }
      },
      { ttl: this.euclidConfig.performance.cache.marketData }
    );
  }

  @Listen(EUCLID_EVENTS.MARKET.LOAD_INITIAL, { target: 'window' })
  async handleInitialDataLoad() {
    console.log('📊 Loading initial market data...');
    await this.loadInitialData();
  }

  @Listen(EUCLID_EVENTS.MARKET.REFRESH_DATA, { target: 'window' })
  async handleRefreshRequest() {
    console.log('🔄 Manual market data refresh requested');
    await this.refreshMarketData();
  }

  @Listen(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_REQUEST, { target: 'window' })
  async handleTokenDetailsRequest(event: CustomEvent<{ tokenId: string }>) {
    const { tokenId } = event.detail;
    console.log('📋 Loading token details for:', tokenId);

    try {
      // Get token denominations across all chains with caching
      const denomsResponse = await requestManager.request(
        `token-denoms-${tokenId}`,
        () => this.apiClient.getTokenDenoms(tokenId),
        { ttl: this.euclidConfig.performance.cache.tokens }
      );

      if (denomsResponse.success && denomsResponse.data) {
        const denoms = denomsResponse.data.router.token_denoms.denoms;

        // Emit token details loaded event
        dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_SUCCESS, {
          tokenId,
          data: { denoms }
        });
      }

      // Get escrow information with caching
      const escrowsResponse = await requestManager.request(
        `token-escrows-${tokenId}`,
        () => this.apiClient.getEscrows(tokenId),
        { ttl: this.euclidConfig.performance.cache.tokens }
      );

      if (escrowsResponse.success && escrowsResponse.data) {
        const escrows = escrowsResponse.data.router.escrows;

        // Emit escrow info loaded event
        dispatchEuclidEvent(EUCLID_EVENTS.MARKET.ESCROWS_LOADED, {
          tokenId,
          data: { escrows }
        });
      }
    } catch (error) {
      console.error('Failed to load token details:', error);

      dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_FAILED, {
        tokenId,
        error: error.message
      });
    }
  }

  @Listen(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_REQUEST, { target: 'window' })
  async handleChainDetailsRequest(event: CustomEvent<{ chainUID: string }>) {
    const { chainUID } = event.detail;
    console.log('🔗 Loading chain details for:', chainUID);

    try {
      // Get chain-specific data
      const chain = marketStore.getChain(chainUID);
      if (chain) {
        // Emit chain details loaded event
        dispatchEuclidEvent(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_SUCCESS, {
          chainUID,
          data: { chain }
        });
      } else {
        // Refresh chains if not found
        await this.refreshMarketData();
      }
    } catch (error) {
      console.error('Failed to load chain details:', error);

      dispatchEuclidEvent(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_FAILED, {
        chainUID,
        error: error.message
      });
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
