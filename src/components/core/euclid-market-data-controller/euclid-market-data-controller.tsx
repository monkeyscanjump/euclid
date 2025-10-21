import { Component, h, State, Listen, Prop } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import { createAPIClient } from '../../../utils/api-client';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { EuclidConfig } from '../../../utils/env';
import { DEFAULT_CONFIG } from '../../../utils/env';

@Component({
  tag: 'euclid-market-data-controller',
})
export class EuclidMarketDataController {
  @State() isInitialized = false;
  @Prop() config?: string; // JSON string of EuclidConfig

  private refreshInterval: number;
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
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
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
    try {
      marketStore.setLoading(true);

      console.log('📊 Loading initial market data...');

      // Load chains
      const chainsResponse = await this.apiClient.getAllChains(false);
      if (chainsResponse.success && chainsResponse.data) {
        // Store the EuclidChainConfig[] data directly
        marketStore.setChains(chainsResponse.data);
        console.log('📡 Loaded chains:', chainsResponse.data.length);
      } else {
        console.warn('Failed to load chains:', chainsResponse.error);
      }

      // Load tokens
      const tokensResponse = await this.apiClient.getAllTokens();
      if (tokensResponse.success && tokensResponse.data) {
        // Store the TokenMetadata[] data directly
        marketStore.setTokens(tokensResponse.data);
        console.log('🪙 Loaded tokens:', tokensResponse.data.length);
      } else {
        console.warn('Failed to load tokens:', tokensResponse.error);
      }

      // Load pools
      const poolsResponse = await this.apiClient.getAllPools();
      if (poolsResponse.success && poolsResponse.data) {
        marketStore.setPools(poolsResponse.data);
        console.log('🏊 Loaded pools:', poolsResponse.data.length);
      } else {
        console.warn('Failed to load pools:', poolsResponse.error);
      }

    } catch (error) {
      console.error('Failed to load initial market data:', error);
    } finally {
      marketStore.setLoading(false);
    }
  }

  private setupPeriodicRefresh() {
    // Use configured refresh interval
    const refreshInterval = this.euclidConfig.refreshIntervals.marketData;

    this.refreshInterval = window.setInterval(async () => {
      if (marketStore.isDataStale()) {
        console.log('🔄 Refreshing stale market data...');
        await this.refreshMarketData();
      }
    }, refreshInterval);

    console.log(`📊 Market data refresh interval set to ${refreshInterval}ms`);
  }

  private async refreshMarketData() {
    try {
      marketStore.setLoading(true);

      // Refresh chains data
      const chainsResponse = await this.apiClient.getAllChains(false);
      if (chainsResponse.success && chainsResponse.data) {
        marketStore.setChains(chainsResponse.data);
      }

      // Refresh tokens data
      const tokensResponse = await this.apiClient.getAllTokens();
      if (tokensResponse.success && tokensResponse.data) {
        marketStore.setTokens(tokensResponse.data);
      }

      console.log('✅ Market data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh market data:', error);
    } finally {
      marketStore.setLoading(false);
    }
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
      // Get token denominations across all chains
      const denomsResponse = await this.apiClient.getTokenDenoms(tokenId);
      if (denomsResponse.success && denomsResponse.data) {
        const denoms = denomsResponse.data.router.token_denoms.denoms;

        // Emit token details loaded event
        dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_SUCCESS, {
          tokenId,
          data: { denoms }
        });
      }

      // Get escrow information
      const escrowsResponse = await this.apiClient.getEscrows(tokenId);
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
