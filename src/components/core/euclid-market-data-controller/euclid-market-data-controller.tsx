import { Component, h, State, Listen, Prop } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import { euclidAPI } from '../../../utils/core-api';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { requestManager } from '../../../utils/request-manager';
import { pollingCoordinator } from '../../../utils/polling-coordinator';
import { dataSubscriptionManager } from '../../../utils/data-subscription-manager';
import type { EuclidConfig } from '../../../utils/env';
import type { EuclidChainConfig } from '../../../utils/types';
import { DEFAULT_CONFIG } from '../../../utils/env';
import { logger } from '../../../utils/logger';

@Component({
  tag: 'euclid-market-data-controller',
})
export class EuclidMarketDataController {
  @State() isInitialized = false;
  @Prop() config?: string; // JSON string of EuclidConfig

  private euclidConfig: EuclidConfig;
  private api = euclidAPI;

  async componentWillLoad() {
    // Parse configuration
    this.euclidConfig = this.config ? JSON.parse(this.config) : DEFAULT_CONFIG;

    // No need for heavy API client initialization
    // Initialize everything here to avoid re-renders
    await this.initialize();
  }

  async componentDidLoad() {
    // Component is ready, no state changes needed here
  }

  disconnectedCallback() {
    // Clean up all polling tasks
    pollingCoordinator.unregister('market-token-metadata');
    pollingCoordinator.unregister('market-pools-data');
  }

  private async initialize() {
    logger.info('Component', '📊 Initializing Market Data Controller...');

    // Load initial data with specific logic for each data type
    await this.loadInitialData();

    // Set up specific polling for the three core GraphQL queries
    this.setupCoreDataPolling();

    this.isInitialized = true;
    logger.info('Component', '📊 Market Data Controller initialized');
  }

  private async loadInitialData() {
    return requestManager.request(
      'market-initial-data',
      async () => {
        try {
          marketStore.setLoading(true);

          logger.info('Component', '📊 Loading initial market data...');

          // 1. CHAINS - Load once and cache for a long time (chains don't change often)
          logger.info('Component', '🌐 Loading chains (once per session)...');
          const chains = await this.api.getChains({ showAllChains: false });

          if (chains && chains.length > 0) {
            const validChains: EuclidChainConfig[] = chains.map(chain => ({
              ...chain,
              type: (chain.type?.toLowerCase() === 'evm') ? 'EVM' : 'Cosmwasm'
            }));
            marketStore.setChains(validChains);
            logger.info('Component', '📡 Loaded chains:', chains.length);
          } else {
            logger.warn('Component', 'No chains data received');
          }

          // 2. TOKEN METADATA - Load initially, will be polled separately
          logger.info('Component', '🪙 Loading token metadata...');
          const tokens = await this.api.getTokenMetadata();

          if (tokens && tokens.length > 0) {
            marketStore.setTokens(tokens);
            logger.info('Component', '🪙 Loaded tokens:', tokens.length);
          } else {
            logger.warn('Component', 'No tokens data received');
          }

          // 3. POOLS - Load initially, will be polled separately
          logger.info('Component', '🏊 Loading pools with liquidity...');
          const poolsResponse = await this.api.getAllPools();

          if (poolsResponse.success && poolsResponse.data) {
            marketStore.setPools(poolsResponse.data);
            logger.info('Component', '🏊 Loaded pools:', poolsResponse.data.length);
          } else {
            logger.warn('Component', 'Failed to load pools:', poolsResponse.error);
          }

          return { success: true };
        } catch (error) {
          logger.error('Component', 'Failed to load initial market data:', error);
          throw error;
        } finally {
          marketStore.setLoading(false);
        }
      },
      { ttl: this.euclidConfig.performance.cache.chains } // Use config cache TTL for initial load
    );
  }

    /**
   * Set up specific polling for the three core GraphQL queries
   * Uses the sophisticated configuration from env.ts
   * OPTIMIZED: Only polls when components are subscribed to the data
   * 1. Chains - fetched once per session (no polling needed)
   * 2. Token metadata - polled only when components subscribe to tokenPrices/marketData
   * 3. Pools - polled only when components subscribe to marketData/liquidityPositions
   */
  private setupCoreDataPolling() {
    logger.info('Component', '📊 Setting up optimized core data polling using configuration:', {
      activeInterval: this.euclidConfig.performance.polling.active.marketData,
      backgroundInterval: this.euclidConfig.performance.polling.background.marketData,
      cacheTTL: this.euclidConfig.performance.cache.marketData
    });

    // TOKEN METADATA POLLING - Only when subscriptions exist
    pollingCoordinator.register(
      'market-token-metadata',
      async () => {
        if (!dataSubscriptionManager.hasSubscriptions('marketData') &&
            !dataSubscriptionManager.hasSubscriptions('tokenPrices')) {
          logger.info('Component', '⏭️ No token metadata subscriptions - skipping fetch');
          return; // Skip if no subscriptions
        }

        logger.info('Component', '🪙 Refreshing token metadata (subscription-driven)...');
        await this.refreshTokenMetadata();
      },
      {
        activeInterval: this.euclidConfig.performance.polling.active.marketData,
        backgroundInterval: this.euclidConfig.performance.polling.background.marketData,
        pauseOnHidden: this.euclidConfig.performance.pauseOnHidden
      }
    );

    // POOLS POLLING - Only when subscriptions exist
    pollingCoordinator.register(
      'market-pools-data',
      async () => {
        if (!dataSubscriptionManager.hasSubscriptions('marketData') &&
            !dataSubscriptionManager.hasSubscriptions('liquidityPositions')) {
          logger.info('Component', '⏭️ No pools data subscriptions - skipping fetch');
          return; // Skip if no subscriptions
        }

        logger.info('Component', '🏊 Refreshing pools data (subscription-driven)...');
        await this.refreshPoolsData();
      },
      {
        activeInterval: this.euclidConfig.performance.polling.active.marketData,
        backgroundInterval: this.euclidConfig.performance.polling.background.marketData,
        pauseOnHidden: this.euclidConfig.performance.pauseOnHidden
      }
    );

    logger.info('Component', '📊 Optimized core data polling setup complete - will poll only when subscriptions exist');
  }

  /**
   * Refresh token metadata specifically
   */
  private async refreshTokenMetadata() {
    return requestManager.request(
      'token-metadata-refresh',
      async () => {
        try {
          const tokens = await this.api.getTokenMetadata();

          if (tokens && tokens.length > 0) {
            marketStore.setTokens(tokens);
            logger.info('Component', '💰 Refreshed token metadata:', tokens.length);
          }

          return { success: true };
        } catch (error) {
          logger.error('Component', '❌ Failed to refresh token metadata:', error);
          throw error;
        }
      },
      { ttl: this.euclidConfig.performance.cache.tokens } // Use config cache TTL
    );
  }

  /**
   * Refresh pools data specifically
   */
  private async refreshPoolsData() {
    return requestManager.request(
      'pools-data-refresh',
      async () => {
        try {
          const poolsResponse = await this.api.getAllPools();

          if (poolsResponse.success && poolsResponse.data) {
            marketStore.setPools(poolsResponse.data);
            logger.info('Component', '🏊 Refreshed pools data:', poolsResponse.data.length);
          }

          return { success: true };
        } catch (error) {
          logger.error('Component', '❌ Failed to refresh pools data:', error);
          throw error;
        }
      },
      { ttl: this.euclidConfig.performance.cache.marketData } // Use config cache TTL
    );
  }

  @Listen(EUCLID_EVENTS.MARKET.LOAD_INITIAL, { target: 'window' })
  async handleInitialDataLoad() {
    logger.info('Component', '📊 Loading initial market data...');
    await this.loadInitialData();
  }

  @Listen(EUCLID_EVENTS.MARKET.REFRESH_DATA, { target: 'window' })
  async handleRefreshRequest() {
    logger.info('Component', '� Manual market data refresh requested');
    // Trigger both token metadata and pools refresh
    await Promise.all([
      this.refreshTokenMetadata(),
      this.refreshPoolsData()
    ]);
  }

  @Listen(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_REQUEST, { target: 'window' })
  async handleTokenDetailsRequest(event: CustomEvent<{ tokenId: string }>) {
    const { tokenId } = event.detail;
    logger.info('Component', '📋 Loading token details for:', tokenId);

    try {
      // Get token denominations across all chains with caching
      // Note: getTokenDenoms method needs to be implemented in core API
      logger.info('Component', '📄 Token denoms not yet implemented for:', tokenId);

      // For now, emit a placeholder event
      dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_SUCCESS, {
        tokenId,
        data: { denoms: [] }
      });

      // Get escrow information with caching
      // Note: getEscrows method needs to be implemented in core API
      logger.info('Component', '📄 Token escrows not yet implemented for:', tokenId);

      // For now, emit a placeholder event
      dispatchEuclidEvent(EUCLID_EVENTS.MARKET.ESCROWS_LOADED, {
        tokenId,
        data: { escrows: [] }
      });
    } catch (error) {
      logger.error('Component', 'Failed to load token details:', error);

      dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_FAILED, {
        tokenId,
        error: error.message
      });
    }
  }

  @Listen(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_REQUEST, { target: 'window' })
  async handleChainDetailsRequest(event: CustomEvent<{ chainUID: string }>) {
    const { chainUID } = event.detail;
    logger.info('Component', '🔗 Loading chain details for:', chainUID);

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
        // Refresh chains if not found - chains are loaded once, so trigger initial data load
        await this.loadInitialData();
      }
    } catch (error) {
      logger.error('Component', 'Failed to load chain details:', error);

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
