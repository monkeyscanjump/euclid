import { Component, Host, h, State, Listen } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';

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
        <euclid-wallet-controller />
        <euclid-market-data-controller />
        <euclid-user-data-controller />

        {/* Feature controllers - these handle business logic */}
        <euclid-swap-controller />
        <euclid-liquidity-controller />
        <euclid-tx-tracker-controller />

        {/* Global modals - controlled by appStore */}
        <euclid-wallet-modal
          open={appStore.state.walletModalOpen}
          onModalClose={() => appStore.closeWalletModal()}
          onWalletConnect={(e) => this.handleWalletConnectFromModal(e)}
        />
        <euclid-token-modal
          open={appStore.state.tokenModalOpen}
          onModalClose={() => appStore.closeTokenModal()}
          onTokenSelect={(e) => this.handleTokenSelectFromModal(e)}
        />

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
