import { Component, Host, h, State, Listen, Prop } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { DEFAULT_CONFIG, ENVIRONMENT_PRESETS, mergeConfig, type EuclidConfig } from '../../../utils/env';
import { parseCommaSeparated, parseJsonSafe, stringifyWithCache } from '../../../utils/string-helpers';
import { logger } from '../../../utils/logger';
import { renderIf, LoadingSpinner } from '../../../utils/render-helpers';

@Component({
  tag: 'euclid-core-provider',
  styleUrl: 'euclid-core-provider.css',
  shadow: true,
})
export class EuclidCoreProvider {
  @State() isInitialized = false;

  // Configuration Props
  @Prop() environment?: 'mainnet' | 'testnet' | 'devnet' = 'testnet';
  @Prop() graphqlEndpoint?: string;
  @Prop() restEndpoint?: string;
  @Prop() apiTimeout?: number;
  @Prop() defaultSlippage?: number;
  @Prop() refreshIntervals?: string; // JSON string for complex object
  @Prop() featureFlags?: string; // JSON string for feature flags
  @Prop() supportedChains?: string; // Comma-separated list
  @Prop() supportedWallets?: string; // Comma-separated list
  @Prop() defaultChain?: string;
  @Prop() defaultWallet?: string;

  // Computed configuration for child components
  private euclidConfig: EuclidConfig;

  // Cached config JSON to avoid repeated stringify calls
  private get configJson(): string {
    return stringifyWithCache(this.euclidConfig);
  }

  async componentWillLoad() {
    this.euclidConfig = this.computeConfiguration();
  }

  async componentDidLoad() {
    await this.initialize();
  }

  private computeConfiguration(): EuclidConfig {
    // Start with default config
    let config = { ...DEFAULT_CONFIG };

    // Apply environment preset if specified
    if (this.environment && ENVIRONMENT_PRESETS[this.environment]) {
      config = mergeConfig(config, ENVIRONMENT_PRESETS[this.environment]);
    }

    // Apply individual prop overrides
    const overrides: Partial<EuclidConfig> = {};

    if (this.graphqlEndpoint) overrides.graphqlEndpoint = this.graphqlEndpoint;
    if (this.restEndpoint) overrides.restEndpoint = this.restEndpoint;
    if (this.apiTimeout !== undefined) overrides.apiTimeout = this.apiTimeout;
    if (this.defaultChain) overrides.defaultChain = this.defaultChain;
    if (this.defaultWallet) overrides.defaultWallet = this.defaultWallet;

    // Use string helper instead of manual split/map/trim
    if (this.supportedChains) {
      overrides.supportedChains = parseCommaSeparated(this.supportedChains);
    }

    if (this.supportedWallets) {
      overrides.supportedWallets = parseCommaSeparated(this.supportedWallets);
    }

    if (this.defaultSlippage !== undefined) {
      overrides.ui = { ...config.ui, defaultSlippage: this.defaultSlippage };
    }

    // Use safe JSON parsing instead of try/catch everywhere
    if (this.refreshIntervals) {
      overrides.refreshIntervals = parseJsonSafe(this.refreshIntervals, config.refreshIntervals);
    }

    if (this.featureFlags) {
      overrides.features = parseJsonSafe(this.featureFlags, config.features);
    }

    return mergeConfig(config, overrides);
  }

  private async initialize() {
    logger.info('CoreProvider', 'Initializing Euclid Protocol Core Provider...');

    // Initialize app store
    appStore.initialize();

    // Initialize wallet store
    walletStore.initialize();

    // Load initial market data
    await this.loadInitialMarketData();

    this.isInitialized = true;
    logger.info('CoreProvider', 'Euclid Protocol Core Provider initialized successfully');
  }

  private async loadInitialMarketData() {
    logger.debug('CoreProvider', 'Delegating initial market data loading to Market Data Controller...');

    // Delegate to market data controller via events
    dispatchEuclidEvent(EUCLID_EVENTS.MARKET.LOAD_INITIAL);
  }

  @Listen(EUCLID_EVENTS.WALLET.CONNECT_SUCCESS, { target: 'window' })
  handleWalletConnect(event: CustomEvent) {
    logger.info('CoreProvider', 'Wallet connection event received', event.detail);
    // Handle wallet connection logic here
  }

  @Listen(EUCLID_EVENTS.WALLET.DISCONNECT_SUCCESS, { target: 'window' })
  handleWalletDisconnect(event: CustomEvent) {
    logger.info('CoreProvider', 'Wallet disconnection event received', event.detail);
    // Handle wallet disconnection logic here
  }

  render() {
    return (
      <Host>
        {/* Loading state with consistent pattern */}
        {renderIf(!this.isInitialized, () =>
          <LoadingSpinner message="Initializing Euclid Protocol..." />
        )}

        {/* Only render controllers AFTER initialization is complete */}
        {renderIf(this.isInitialized, () => (
          <div>
            {/* Core controllers - these manage data and state */}
            <euclid-wallet-controller config={this.configJson} />
            <euclid-market-data-controller config={this.configJson} />
            <euclid-user-data-controller config={this.configJson} />

            {/* Feature controllers - these handle business logic */}
            <euclid-swap-controller config={this.configJson} />
            <euclid-liquidity-controller config={this.configJson} />
            <euclid-tx-tracker-controller config={this.configJson} />

            {/* Global modal - controlled by appStore */}
            <euclid-modal />
          </div>
        ))}

        {/* Slot for application content - this SHOULD always render so pages load */}
        <div class="euclid-provider-content">
          <slot></slot>
        </div>
      </Host>
    );
  }

  private handleWalletConnectFromModal = (event: CustomEvent) => {
    const { provider, chainId } = event.detail;
    logger.info('CoreProvider', 'Wallet connection request from modal', {
      providerType: provider.type,
      chainId
    });

    // Dispatch wallet connection request
    dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_REQUEST, {
      chainUID: chainId || 'ethereum',
      walletType: provider.type
    });

    appStore.closeWalletModal();
  };

  private handleTokenSelectFromModal = (event: CustomEvent) => {
    const { token } = event.detail;
    logger.info('CoreProvider', 'Token selection from modal', { symbol: token.symbol });

    // Emit token selection for consuming components
    dispatchEuclidEvent(EUCLID_EVENTS.UI.TOKEN_SELECTED, {
      tokenId: token.id,
      data: token
    });

    appStore.closeTokenModal();
  };
}
