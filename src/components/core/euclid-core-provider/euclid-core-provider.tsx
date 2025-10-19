import { Component, Host, h, State, Listen } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { marketStore } from '../../../store/market.store';
import { appStore } from '../../../store/app.store';
import { apiClient } from '../../../utils/api-client';

@Component({
  tag: 'euclid-core-provider',
  styleUrl: 'euclid-core-provider.css',
  shadow: true,
})
export class EuclidCoreProvider {
  @State() isInitialized = false;

  async componentDidLoad() {
    await this.initialize();
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
    try {
      marketStore.setLoading(true);

      // Load chains
      const chainsResponse = await apiClient.getAllChains(false);
      if (chainsResponse.success && chainsResponse.data) {
        marketStore.setChains(chainsResponse.data.chains.all_chains);
        console.log('📡 Loaded chains:', chainsResponse.data.chains.all_chains.length);
      } else {
        console.warn('Failed to load chains:', chainsResponse.error);
      }

      // Load tokens
      const tokensResponse = await apiClient.getAllTokens();
      if (tokensResponse.success && tokensResponse.data) {
        // Convert token strings to TokenInfo objects
        const tokens = tokensResponse.data.router.all_tokens.tokens.map(tokenId => ({
          id: tokenId,
          symbol: tokenId.toUpperCase(),
          name: tokenId.charAt(0).toUpperCase() + tokenId.slice(1),
          decimals: 6, // Default, will be updated when we get more detailed info
          chainUID: 'vsl', // Default Virtual Settlement Layer
          logo: `/assets/tokens/${tokenId}.png`, // Placeholder
        }));
        marketStore.setTokens(tokens);
        console.log('🪙 Loaded tokens:', tokens.length);
      } else {
        console.warn('Failed to load tokens:', tokensResponse.error);
      }

      marketStore.setLoading(false);
    } catch (error) {
      console.error('Failed to load initial market data:', error);
      marketStore.setLoading(false);
    }
  }

  @Listen('euclidWalletConnect', { target: 'window' })
  handleWalletConnect(event: CustomEvent) {
    console.log('🔗 Wallet connection event received:', event.detail);
    // Handle wallet connection logic here
  }

  @Listen('euclidWalletDisconnect', { target: 'window' })
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

        <div class="euclid-provider-content" style={{ display: this.isInitialized ? 'block' : 'none' }}>
          {/* Hidden controllers - these manage data but have no UI */}
          <euclid-wallet-controller></euclid-wallet-controller>
          <euclid-market-data-controller></euclid-market-data-controller>
          <euclid-user-data-controller></euclid-user-data-controller>

          {/* Render children (the actual UI components) */}
          <slot></slot>
        </div>

        {/* Global modals */}
        <euclid-wallet-modal></euclid-wallet-modal>
        <euclid-token-modal></euclid-token-modal>
      </Host>
    );
  }
}
