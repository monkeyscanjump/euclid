import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';

export interface WalletInfo {
  id: string;
  name: string;
  address: string;
  chainId: string;
  chainName: string;
  chainLogo?: string;
  walletType: 'metamask' | 'keplr' | 'phantom' | 'walletconnect' | 'custom';
  connected: boolean;
  balance?: string;
  nativeToken?: string;
}

export interface ChainInfo {
  chainId: string;
  name: string;
  logo?: string;
  nativeToken: string;
  rpcUrl: string;
  blockExplorerUrl?: string;
  supported: boolean;
}

export interface WalletProvider {
  type: 'metamask' | 'keplr' | 'phantom' | 'walletconnect' | 'custom';
  name: string;
  icon: string;
  installed: boolean;
  supported: boolean;
  description: string;
}

@Component({
  tag: 'euclid-wallet-modal',
  styleUrl: 'euclid-wallet-modal.css',
  shadow: true,
})
export class EuclidWalletModal {
  @Element() el!: HTMLElement;
  private modalRef?: HTMLElement;

  /**
   * Whether the modal is open
   */
  @Prop({ mutable: true }) open: boolean = false;

  /**
   * Current view mode: 'connect' | 'manage' | 'chains'
   */
  @Prop({ mutable: true }) view: 'connect' | 'manage' | 'chains' = 'connect';

  /**
   * Available wallet providers
   */
  @Prop() walletProviders: WalletProvider[] = [];

  /**
   * Connected wallets
   */
  @Prop() connectedWallets: WalletInfo[] = [];

  /**
   * Supported chains
   */
  @Prop() supportedChains: ChainInfo[] = [];

  /**
   * Currently selected chain
   */
  @Prop() selectedChain?: ChainInfo;

  /**
   * Loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Error message to display
   */
  @Prop() error?: string;

  /**
   * Whether to show chain selector
   */
  @Prop() showChains: boolean = true;

  /**
   * Whether to show wallet management
   */
  @Prop() showManagement: boolean = true;

  /**
   * Title for the modal
   */
  @Prop() modalTitle: string = 'Connect Wallet';

  @State() private isAnimating: boolean = false;
  @State() private searchQuery: string = '';
  @State() private selectedWallet?: WalletInfo;

  /**
   * Emitted when a wallet provider is selected for connection
   */
  @Event() walletConnect!: EventEmitter<{ provider: WalletProvider; chainId?: string }>;

  /**
   * Emitted when a wallet is disconnected
   */
  @Event() walletDisconnect!: EventEmitter<WalletInfo>;

  /**
   * Emitted when a chain is selected
   */
  @Event() chainSelect!: EventEmitter<ChainInfo>;

  /**
   * Emitted when the modal is closed
   */
  @Event() modalClose!: EventEmitter<void>;

  /**
   * Emitted when wallet providers need to be loaded
   */
  @Event() loadWalletProviders!: EventEmitter<void>;

  /**
   * Emitted when chains need to be loaded
   */
  @Event() loadChains!: EventEmitter<void>;

  componentDidLoad() {
    if (this.open) {
      this.openModal();
    }
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (!this.open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeModal();
        break;
    }
  }

  private openModal() {
    this.isAnimating = true;
    this.open = true;

    setTimeout(() => {
      this.isAnimating = false;
    }, 150);

    // Load data if not available
    if (!this.walletProviders.length && !this.loading) {
      this.loadWalletProviders.emit();
    }

    if (!this.supportedChains.length && !this.loading) {
      this.loadChains.emit();
    }
  }

  private closeModal() {
    this.isAnimating = true;

    setTimeout(() => {
      this.open = false;
      this.isAnimating = false;
      this.view = 'connect';
      this.searchQuery = '';
      this.selectedWallet = undefined;
      this.modalClose.emit();
    }, 150);
  }

  private handleOverlayClick = (event: Event) => {
    if (event.target === this.modalRef) {
      this.closeModal();
    }
  };

  private handleWalletConnect = (provider: WalletProvider) => {
    if (!provider.installed) {
      window.open(this.getInstallUrl(provider.type), '_blank');
      return;
    }

    this.walletConnect.emit({
      provider,
      chainId: this.selectedChain?.chainId
    });
  };

  private handleWalletDisconnect = (wallet: WalletInfo) => {
    this.walletDisconnect.emit(wallet);
  };

  private handleChainSelect = (chain: ChainInfo) => {
    this.chainSelect.emit(chain);
  };

  private handleViewChange = (newView: 'connect' | 'manage' | 'chains') => {
    this.view = newView;
  };

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
  };

  private getInstallUrl(walletType: string): string {
    const installUrls: Record<string, string> = {
      'metamask': 'https://metamask.io/download/',
      'keplr': 'https://www.keplr.app/download',
      'phantom': 'https://phantom.app/download',
      'walletconnect': 'https://walletconnect.com/',
    };
    return installUrls[walletType] || '#';
  }

  private getWalletTypeIcon(walletType: string): string {
    const icons: Record<string, string> = {
      'metamask': '🦊',
      'keplr': '🔗',
      'phantom': '👻',
      'walletconnect': '🌐',
      'custom': '💼'
    };
    return icons[walletType] || '💼';
  }

  private formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private formatBalance(balance: string, symbol: string): string {
    const num = parseFloat(balance);
    if (isNaN(num) || num === 0) return `0 ${symbol}`;

    if (num < 0.001) return `<0.001 ${symbol}`;
    if (num < 1) return `${num.toFixed(6)} ${symbol}`;
    if (num < 1000) return `${num.toFixed(3)} ${symbol}`;
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K ${symbol}`;
    return `${(num / 1000000).toFixed(2)}M ${symbol}`;
  }

  private getFilteredWalletProviders(): WalletProvider[] {
    if (!this.searchQuery) return this.walletProviders;

    const query = this.searchQuery.toLowerCase();
    return this.walletProviders.filter(provider =>
      provider.name.toLowerCase().includes(query) ||
      provider.description.toLowerCase().includes(query)
    );
  }

  private getFilteredConnectedWallets(): WalletInfo[] {
    if (!this.searchQuery) return this.connectedWallets;

    const query = this.searchQuery.toLowerCase();
    return this.connectedWallets.filter(wallet =>
      wallet.name.toLowerCase().includes(query) ||
      wallet.address.toLowerCase().includes(query) ||
      wallet.chainName.toLowerCase().includes(query)
    );
  }

  private renderConnectView() {
    const filteredProviders = this.getFilteredWalletProviders();

    return (
      <div class="view-content">
        <div class="search-section">
          <div class="search-input-container">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search wallets..."
              value={this.searchQuery}
              onInput={this.handleSearchInput}
              class="search-input"
            />
          </div>
        </div>

        {this.showChains && this.selectedChain && (
          <div class="selected-chain">
            <div class="chain-info">
              {this.selectedChain.logo && (
                <img src={this.selectedChain.logo} alt={this.selectedChain.name} class="chain-logo" />
              )}
              <span class="chain-name">Network: {this.selectedChain.name}</span>
            </div>
            <button
              class="change-chain-btn"
              onClick={() => this.handleViewChange('chains')}
              type="button"
            >
              Change
            </button>
          </div>
        )}

        <div class="wallets-grid">
          {filteredProviders.map(provider => (
            <button
              key={provider.type}
              class={{
                'wallet-card': true,
                'wallet-card--not-installed': !provider.installed,
                'wallet-card--not-supported': !provider.supported
              }}
              onClick={() => this.handleWalletConnect(provider)}
              disabled={!provider.supported}
              type="button"
            >
              <div class="wallet-icon">
                {provider.icon ? (
                  <img src={provider.icon} alt={provider.name} />
                ) : (
                  <span class="wallet-emoji">{this.getWalletTypeIcon(provider.type)}</span>
                )}
              </div>

              <div class="wallet-details">
                <h3 class="wallet-name">{provider.name}</h3>
                <p class="wallet-description">{provider.description}</p>

                {!provider.installed && (
                  <span class="install-badge">Install Required</span>
                )}

                {!provider.supported && (
                  <span class="unsupported-badge">Not Supported</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div class="empty-state">
            <p class="empty-message">
              {this.searchQuery
                ? `No wallets found for "${this.searchQuery}"`
                : 'No wallet providers available'}
            </p>
          </div>
        )}
      </div>
    );
  }

  private renderManageView() {
    const filteredWallets = this.getFilteredConnectedWallets();

    return (
      <div class="view-content">
        <div class="search-section">
          <div class="search-input-container">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search connected wallets..."
              value={this.searchQuery}
              onInput={this.handleSearchInput}
              class="search-input"
            />
          </div>
        </div>

        <div class="connected-wallets-list">
          {filteredWallets.map(wallet => (
            <div key={wallet.id} class="wallet-item">
              <div class="wallet-item-left">
                <div class="wallet-avatar">
                  {wallet.chainLogo ? (
                    <img src={wallet.chainLogo} alt={wallet.chainName} />
                  ) : (
                    <span class="wallet-emoji">{this.getWalletTypeIcon(wallet.walletType)}</span>
                  )}
                </div>

                <div class="wallet-info">
                  <div class="wallet-header">
                    <h3 class="wallet-name">{wallet.name}</h3>
                    <span class={{
                      'connection-status': true,
                      'connection-status--connected': wallet.connected,
                      'connection-status--disconnected': !wallet.connected
                    }}>
                      {wallet.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <p class="wallet-address">{this.formatAddress(wallet.address)}</p>
                  <p class="wallet-chain">{wallet.chainName}</p>

                  {wallet.balance && wallet.nativeToken && (
                    <p class="wallet-balance">
                      {this.formatBalance(wallet.balance, wallet.nativeToken)}
                    </p>
                  )}
                </div>
              </div>

              <div class="wallet-actions">
                {wallet.connected ? (
                  <button
                    class="disconnect-btn"
                    onClick={() => this.handleWalletDisconnect(wallet)}
                    type="button"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    class="reconnect-btn"
                    onClick={() => this.handleWalletConnect({
                      type: wallet.walletType,
                      name: wallet.name,
                      icon: '',
                      installed: true,
                      supported: true,
                      description: ''
                    })}
                    type="button"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredWallets.length === 0 && (
          <div class="empty-state">
            <p class="empty-message">
              {this.searchQuery
                ? `No wallets found for "${this.searchQuery}"`
                : 'No connected wallets'}
            </p>
            <button
              class="connect-new-btn"
              onClick={() => this.handleViewChange('connect')}
              type="button"
            >
              Connect New Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  private renderChainsView() {
    return (
      <div class="view-content">
        <div class="chains-list">
          {this.supportedChains.map(chain => (
            <button
              key={chain.chainId}
              class={{
                'chain-item': true,
                'chain-item--selected': this.selectedChain?.chainId === chain.chainId,
                'chain-item--unsupported': !chain.supported
              }}
              onClick={() => this.handleChainSelect(chain)}
              disabled={!chain.supported}
              type="button"
            >
              <div class="chain-item-left">
                {chain.logo && (
                  <img src={chain.logo} alt={chain.name} class="chain-logo" />
                )}
                <div class="chain-details">
                  <h3 class="chain-name">{chain.name}</h3>
                  <p class="chain-token">Native Token: {chain.nativeToken}</p>
                </div>
              </div>

              {this.selectedChain?.chainId === chain.chainId && (
                <div class="selected-indicator">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  render() {
    if (!this.open) {
      return null;
    }

    const modalClass = {
      'modal-overlay': true,
      'modal-overlay--animating': this.isAnimating,
    };

    const contentClass = {
      'modal-content': true,
      'modal-content--loading': this.loading,
    };

    return (
      <div
        class={modalClass}
        ref={(el) => this.modalRef = el}
        onClick={this.handleOverlayClick}
      >
        <div class={contentClass}>
          {/* Header */}
          <div class="modal-header">
            <h2 class="modal-title">{this.modalTitle}</h2>
            <button
              class="close-button"
              onClick={() => this.closeModal()}
              type="button"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div class="nav-tabs">
            <button
              class={{
                'nav-tab': true,
                'nav-tab--active': this.view === 'connect'
              }}
              onClick={() => this.handleViewChange('connect')}
              type="button"
            >
              Connect Wallet
            </button>

            {this.showManagement && this.connectedWallets.length > 0 && (
              <button
                class={{
                  'nav-tab': true,
                  'nav-tab--active': this.view === 'manage'
                }}
                onClick={() => this.handleViewChange('manage')}
                type="button"
              >
                Manage ({this.connectedWallets.length})
              </button>
            )}

            {this.showChains && this.supportedChains.length > 0 && (
              <button
                class={{
                  'nav-tab': true,
                  'nav-tab--active': this.view === 'chains'
                }}
                onClick={() => this.handleViewChange('chains')}
                type="button"
              >
                Networks
              </button>
            )}
          </div>

          {/* Error State */}
          {this.error && (
            <div class="error-section">
              <p class="error-message">{this.error}</p>
            </div>
          )}

          {/* Loading State */}
          {this.loading && (
            <div class="loading-section">
              <div class="loading-spinner">
                <div class="spinner"></div>
              </div>
              <p class="loading-text">Loading wallets...</p>
            </div>
          )}

          {/* View Content */}
          {!this.loading && !this.error && (
            <div class="modal-body">
              {this.view === 'connect' && this.renderConnectView()}
              {this.view === 'manage' && this.renderManageView()}
              {this.view === 'chains' && this.renderChainsView()}
            </div>
          )}
        </div>
      </div>
    );
  }
}
