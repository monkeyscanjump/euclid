import { Component, h, State, Element, Prop, Event, EventEmitter, Listen } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { getConnectedWallets, addCustomWallets, setupWalletStoreListeners, ConnectedWallet } from '../../../utils/wallet-utils';
import { dataSubscriptionManager } from '../../../utils/data-subscription-manager';

@Component({
  tag: 'euclid-portfolio',
  styleUrl: 'euclid-portfolio.css',
  shadow: true,
})
export class EuclidPortfolio {
  @Element() element!: HTMLElement;

  @Prop() cardTitle: string = 'Portfolio';

  /**
   * Custom wallet address for testing (can be multiple addresses separated by comma)
   */
  @Prop() walletAddress: string = '';

  /**
   * Custom chain UID for the wallet address (defaults to osmosis-1 if not specified)
   */
  @Prop() customChainUID: string = 'osmosis-1';

  /**
   * Whether to include custom wallet addresses in the portfolio
   */
  @Prop() includeCustomWallets: boolean = true;

  /**
   * Whether to auto-refresh portfolio data
   */
  @Prop() autoRefresh: boolean = true;

  /**
   * Refresh interval in milliseconds
   */
  @Prop() refreshIntervalMs: number = 60000;

  @State() refreshTrigger: number = 0; // For triggering re-renders when wallet store changes
  @State() activeTab: 'overview' | 'wallets' = 'overview';

  private subscriptionId: string | null = null;

  @Event() portfolioUpdated: EventEmitter<ConnectedWallet[]>;

  componentDidLoad() {
    // Subscribe to balance data when portfolio loads
    // The subscription manager will automatically handle:
    // - Request deduplication/caching via RequestManager
    // - Intelligent polling via PollingCoordinator
    // - Loading states via LoadingStateManager
    // - Store updates via StoreUpdateCoordinator
    this.subscriptionId = dataSubscriptionManager.subscribe('euclid-portfolio', 'balances');

    // Use the shared utility for wallet store listeners
    setupWalletStoreListeners(() => {
      this.refreshTrigger = Date.now();
    });

    // Initial trigger
    this.refreshTrigger = Date.now();
  }  disconnectedCallback() {
    // Clean up subscription when component unmounts
    // The subscription manager will automatically handle:
    // - Stopping polling tasks via PollingCoordinator
    // - Clearing loading states via LoadingStateManager
    // - Clearing request cache via RequestManager
    if (this.subscriptionId) {
      dataSubscriptionManager.unsubscribe(this.subscriptionId);
      this.subscriptionId = null;
    }
  }

  @Listen('euclid:wallet:connect-success', { target: 'window' })
  handleWalletConnected() {
    this.refreshTrigger = Date.now();
  }

  @Listen('euclid:wallet:disconnect-success', { target: 'window' })
  handleWalletDisconnected() {
    this.refreshTrigger = Date.now();
  }

  /**
   * READS FROM WALLET STORE STATE FOR IMMEDIATE RENDERING
   */
  private getWallets(): ConnectedWallet[] {
    const connectedWallets = getConnectedWallets();

    // Add custom wallets if specified
    if (this.includeCustomWallets && this.walletAddress) {
      return addCustomWallets(connectedWallets, this.walletAddress, this.customChainUID);
    }

    return connectedWallets;
  }

  private handleConnectWallet = () => {
    appStore.openWalletModal();
  };

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private renderOverviewTab() {
    const wallets = this.getWallets(); // READ FRESH DATA EVERY RENDER

    if (wallets.length === 0) {
      return (
        <div class="overview-tab">
          <div class="empty-portfolio">
            <div class="empty-icon">�</div>
            <h3>No Portfolio Data</h3>
            <p>Connect a wallet to start tracking your portfolio and see detailed analytics.</p>
            <euclid-button
              variant="primary"
              onClick={this.handleConnectWallet}
            >
              + Add Wallet
            </euclid-button>
          </div>
        </div>
      );
    }

    return (
      <div class="overview-tab">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Value</div>
            <div class="stat-value">$0.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">24h Change</div>
            <div class="stat-value">$0.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Chains</div>
            <div class="stat-value">{new Set(wallets.map(w => w.chainUID)).size}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Tokens</div>
            <div class="stat-value">0</div>
          </div>
        </div>

        <div class="portfolio-analytics">
          <h3>Portfolio Analytics</h3>
          <p>Advanced portfolio analytics and charts will be available here soon.</p>
        </div>
      </div>
    );
  }

  private renderWalletsTab() {
    const wallets = this.getWallets(); // READ FRESH DATA EVERY RENDER

    return (
      <div class="wallets-tab">
        <div class="wallets-header">
          <h3>Connected Wallets ({wallets.length})</h3>
          <euclid-button
            variant="primary"
            onClick={this.handleConnectWallet}
          >
            + Add Wallet
          </euclid-button>
        </div>

        <div class="wallets-list">
          {wallets.length === 0 ? (
            <div class="empty-wallets">
              <div class="empty-icon">💼</div>
              <h4>No connected wallets</h4>
              <p>Connect a wallet to start managing your multi-chain portfolio</p>
              <euclid-button
                variant="primary"
                onClick={this.handleConnectWallet}
              >
                + Add Wallet
              </euclid-button>
            </div>
          ) : (
            <div class="wallet-list">
              {wallets.map(wallet => (
                <euclid-wallet
                  key={wallet.id}
                  wallet={{
                    id: wallet.id,
                    address: wallet.address,
                    chainUID: wallet.chainUID,
                    chainName: wallet.chainName,
                    chainLogo: wallet.chainLogo,
                    chainType: wallet.chainType,
                    walletType: wallet.walletType,
                    provider: wallet.provider,
                    label: wallet.label
                  }}
                  clickable={false}
                  showConnectionStatus={true}
                  showChainInfo={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const wallets = this.getWallets(); // READ FRESH DATA EVERY RENDER

    // Emit event for parent components
    this.portfolioUpdated.emit(wallets);

    return (
      <div class="portfolio">
        <div class="portfolio-header">
          <h2 class="portfolio-title">{this.cardTitle}</h2>
          <div class="portfolio-summary">
            <div class="summary-item">
              <span class="label">Wallets:</span>
              <span class="value">{wallets.length}</span>
            </div>
            <div class="summary-item">
              <span class="label">Chains:</span>
              <span class="value">{new Set(wallets.map(w => w.chainUID)).size}</span>
            </div>
          </div>
        </div>

        <div class="portfolio-tabs">
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'overview',
            }}
            onClick={() => this.activeTab = 'overview'}
            type="button"
          >
            Overview
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'wallets',
            }}
            onClick={() => this.activeTab = 'wallets'}
            type="button"
          >
            Wallets ({wallets.length})
          </button>
        </div>

        <div class="portfolio-content">
          {this.activeTab === 'overview' && this.renderOverviewTab()}
          {this.activeTab === 'wallets' && this.renderWalletsTab()}
        </div>
      </div>
    );
  }
}
