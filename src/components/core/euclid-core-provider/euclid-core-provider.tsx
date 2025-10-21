import { Component, Host, h, State, Listen, Prop } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { DEFAULT_CONFIG, ENVIRONMENT_PRESETS, mergeConfig, type EuclidConfig } from '../../../utils/env';

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

    if (this.supportedChains) {
      overrides.supportedChains = this.supportedChains.split(',').map(s => s.trim());
    }

    if (this.supportedWallets) {
      overrides.supportedWallets = this.supportedWallets.split(',').map(s => s.trim());
    }

    if (this.defaultSlippage !== undefined) {
      overrides.ui = { ...config.ui, defaultSlippage: this.defaultSlippage };
    }

    // Parse JSON props
    if (this.refreshIntervals) {
      try {
        overrides.refreshIntervals = JSON.parse(this.refreshIntervals);
      } catch (e) {
        console.warn('Invalid refreshIntervals JSON, using defaults:', e);
      }
    }

    if (this.featureFlags) {
      try {
        overrides.features = JSON.parse(this.featureFlags);
      } catch (e) {
        console.warn('Invalid featureFlags JSON, using defaults:', e);
      }
    }

    return mergeConfig(config, overrides);
  }

  private async initialize() {
    console.log('🌌 Initializing Euclid Protocol Core Provider...');

    // Initialize app store
    appStore.initialize();

    // Initialize wallet store
    walletStore.initialize();

    // Load initial market data
    await this.loadInitialMarketData();

    this.isInitialized = true;
    console.log('✅ Euclid Protocol Core Provider initialized successfully');
  }

  private async loadInitialMarketData() {
    console.log('📊 Delegating initial market data loading to Market Data Controller...');

    // Delegate to market data controller via events
    dispatchEuclidEvent(EUCLID_EVENTS.MARKET.LOAD_INITIAL);
  }

  @Listen(EUCLID_EVENTS.WALLET.CONNECT_SUCCESS, { target: 'window' })
  handleWalletConnect(event: CustomEvent) {
    console.log('🔗 Wallet connection event received:', event.detail);
    // Handle wallet connection logic here
  }

  @Listen(EUCLID_EVENTS.WALLET.DISCONNECT_SUCCESS, { target: 'window' })
  handleWalletDisconnect(event: CustomEvent) {
    console.log('🔌 Wallet disconnection event received:', event.detail);
    // Handle wallet disconnection logic here
  }

  render() {
    return (
      <Host>
        {!this.isInitialized && (
          <div class="euclid-loading">
            <div class="loading-spinner"></div>
            <p>Initializing Euclid Protocol...</p>
          </div>
        )}

        {/* Core controllers - these manage data and state */}
        <euclid-wallet-controller
          config={JSON.stringify(this.euclidConfig)}
        />
        <euclid-market-data-controller
          config={JSON.stringify(this.euclidConfig)}
        />
        <euclid-user-data-controller
          config={JSON.stringify(this.euclidConfig)}
        />

        {/* Feature controllers - these handle business logic */}
        <euclid-swap-controller
          config={JSON.stringify(this.euclidConfig)}
        />
        <euclid-liquidity-controller
          config={JSON.stringify(this.euclidConfig)}
        />
        <euclid-tx-tracker-controller
          config={JSON.stringify(this.euclidConfig)}
        />

        {/* Global modal - controlled by appStore */}
        <euclid-modal />

        {/* Slot for application content */}
        <div class="euclid-provider-content">
          <slot></slot>
        </div>
      </Host>
    );
  }

  private handleWalletConnectFromModal = (event: CustomEvent) => {
    const { provider, chainId } = event.detail;
    console.log('🔗 Wallet connection request from modal:', provider.type, chainId);

    // Dispatch wallet connection request
    dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_REQUEST, {
      chainUID: chainId || 'ethereum',
      walletType: provider.type
    });

    appStore.closeWalletModal();
  };

  private handleTokenSelectFromModal = (event: CustomEvent) => {
    const { token } = event.detail;
    console.log('🪙 Token selection from modal:', token.symbol);

    // Emit token selection for consuming components
    dispatchEuclidEvent(EUCLID_EVENTS.UI.TOKEN_SELECTED, {
      tokenId: token.id,
      data: token
    });

    appStore.closeTokenModal();
  };
}
