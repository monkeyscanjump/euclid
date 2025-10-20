import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { TokenInfo } from '../euclid-token-input/euclid-token-input';
import { marketStore } from '../../../store/market.store';
import { appStore } from '../../../store/app.store';
import type { TokenMetadata } from '../../../utils/types/api.types';

// Extended TokenInfo interface for the modal
export interface ExtendedTokenInfo extends TokenInfo {
  id?: string;
  tokenId?: string;
  displayName?: string;
  coinDecimal?: number;
  chain_uid?: string;
  chainUID?: string;
  address?: string;
  logo?: string;
  price?: number;
  priceUsd?: string;
  token_type?: { native?: { denom: string } };
}

export interface TokenList {
  name: string;
  tokens: TokenInfo[];
}

export interface PopularToken extends TokenInfo {
  marketCap?: number;
  volume24h?: number;
  priceUsd?: string;
}

@Component({
  tag: 'euclid-token-modal',
  styleUrl: 'euclid-token-modal.css',
  shadow: true,
})
export class EuclidTokenModal {
  @Element() el!: HTMLElement;

  /**
   * Whether the modal is open
   */
  @Prop({ mutable: true }) open: boolean = false;

  /**
   * Available token lists
   */
  @Prop() tokenLists: TokenList[] = [];

  /**
   * Popular/featured tokens to show at the top
   */
  @Prop() popularTokens: PopularToken[] = [];

  /**
   * User's token balances
   */
  @Prop() userBalances: Record<string, string> = {};

  /**
   * Whether to show balances
   */
  @Prop() showBalances: boolean = true;

  /**
   * Whether to show popular tokens section
   */
  @Prop() showPopular: boolean = true;

  /**
   * Placeholder text for search input
   */
  @Prop() searchPlaceholder: string = 'Search tokens...';

  /**
   * Loading state for token lists
   */
  @Prop() loading: boolean = false;

  /**
   * Error message to display
   */
  @Prop() error?: string;

  /**
   * Currently selected token (to show as selected)
   */
  @Prop() selectedToken?: TokenInfo;

  // Store data (automatically synced)
  @State() private storeTokens: TokenMetadata[] = [];
  @State() private storeLoading: boolean = false;
  @State() private searchQuery: string = '';
  @State() private selectedListIndex: number = 0;
  @State() private filteredTokens: ExtendedTokenInfo[] = [];

  /**
   * Emitted when a token is selected
   */
  @Event() tokenSelect!: EventEmitter<{
    token: ExtendedTokenInfo;
    selectorType: 'input' | 'output';
  }>;

  /**
   * Emitted when the modal is closed
   */
  @Event() modalClose!: EventEmitter<void>;

  componentDidLoad() {
    // Sync with market store
    this.syncWithStore();

    // Listen for store changes
    marketStore.onChange('tokens', () => {
      this.syncWithStore();
    });

    // Listen for app store changes
    appStore.onChange('tokenModalOpen', () => {
      this.open = appStore.state.tokenModalOpen;
      if (this.open) {
        this.updateFilteredTokens();
      }
    });
  }

  private syncWithStore() {
    this.storeTokens = marketStore.state.tokens || [];
    this.storeLoading = marketStore.state.loading;
    this.updateFilteredTokens();
  }

  /**
   * Convert TokenMetadata to ExtendedTokenInfo format
   */
  private convertStoreTokenToTokenInfo(token: TokenMetadata): ExtendedTokenInfo {
    return {
      id: token.tokenId,
      tokenId: token.tokenId,
      symbol: token.symbol || token.displayName.toUpperCase(),
      name: token.displayName,
      decimals: token.coinDecimal,
      logoUrl: token.logo || token.image,
      balance: '0', // Would need to fetch from wallet
      displayName: token.displayName,
      coinDecimal: token.coinDecimal,
      chain_uid: token.chain_uid || '',
      chainUID: token.chainUID || token.chain_uid || '',
      address: token.tokenId,
      logo: token.logo || token.image,
      price: token.price ? parseFloat(token.price) : undefined,
      priceUsd: token.price,
    };
  }

  /**
   * Get all available tokens from store
   */
  private getAvailableTokens(): ExtendedTokenInfo[] {
    return this.storeTokens.map(token => this.convertStoreTokenToTokenInfo(token));
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (!this.open) return;

    switch (event.key) {
      case 'Escape':
        this.handleModalClose();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        // Handle keyboard navigation through token list
        break;
    }
  }

  private updateFilteredTokens() {
    let tokens = this.getAvailableTokens();

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      tokens = tokens.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        (token.address && token.address.toLowerCase().includes(query))
      );
    }

    // Sort tokens: those with balances first, then by market cap/price
    tokens.sort((a, b) => {
      const balanceA = parseFloat(a.balance || '0');
      const balanceB = parseFloat(b.balance || '0');

      // Prioritize tokens with balances
      if (balanceA > 0 && balanceB === 0) return -1;
      if (balanceA === 0 && balanceB > 0) return 1;

      // Then sort by price (higher first)
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      if (priceA !== priceB) return priceB - priceA;

      // Finally alphabetically
      return a.symbol.localeCompare(b.symbol);
    });

    this.filteredTokens = tokens;
  }

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value || '';
    this.updateFilteredTokens();
  };

  private handleTokenClick = (token: ExtendedTokenInfo) => {
    const selectorType = appStore.state.tokenSelectorType || 'input';

    this.tokenSelect.emit({
      token,
      selectorType
    });

    this.handleModalClose();
  };

  private handleModalClose = () => {
    appStore.closeTokenModal();
    this.modalClose.emit();
  };

  private formatBalance(balance: string): string {
    const num = parseFloat(balance || '0');
    if (isNaN(num) || num === 0) return '0';

    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  }

  private formatPrice(priceUsd: string): string {
    const num = parseFloat(priceUsd || '0');
    if (isNaN(num) || num === 0) return '-';

    if (num < 0.01) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    if (num < 1000) return `$${num.toFixed(2)}`;
    if (num < 1000000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${(num / 1000000).toFixed(1)}M`;
  }

  render() {
    const isLoading = this.storeLoading;
    const selectorType = appStore.state.tokenSelectorType || 'input';

    if (!this.open) {
      return null;
    }

    return (
      <div class="modal-overlay" onClick={this.handleOverlayClick}>
        <div class="token-modal">
          {/* Header */}
          <div class="modal-header">
            <h2 class="modal-title">
              Select {selectorType === 'input' ? 'Input' : 'Output'} Token
            </h2>
            <button
              class="close-button"
              onClick={this.handleModalClose}
              type="button"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div class="search-section">
            <div class="search-input-container">
              <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="Search tokens..."
                value={this.searchQuery}
                onInput={this.handleSearchInput}
              />
            </div>
          </div>

          {/* Content */}
          <div class="modal-content">
            {isLoading ? (
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <span>Loading tokens...</span>
              </div>
            ) : this.filteredTokens.length === 0 ? (
              <div class="empty-state">
                <svg viewBox="0 0 64 64" fill="currentColor">
                  <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
                </svg>
                <span>No tokens found</span>
              </div>
            ) : (
              <div class="tokens-list">
                {this.filteredTokens.map(token => (
                  <button
                    key={token.tokenId}
                    class={{
                      'token-item': true,
                      'token-item--selected': (this.selectedToken as ExtendedTokenInfo)?.tokenId === token.tokenId
                    }}
                    onClick={() => this.handleTokenClick(token)}
                    type="button"
                  >
                    <div class="token-left">
                      {token.logoUrl && (
                        <img src={token.logoUrl} alt={token.symbol} class="token-logo" />
                      )}
                      <div class="token-info">
                        <div class="token-symbol">{token.symbol}</div>
                        <div class="token-name">{token.name}</div>
                      </div>
                    </div>
                    <div class="token-right">
                      {token.priceUsd && (
                        <div class="token-price">{this.formatPrice(token.priceUsd)}</div>
                      )}
                      {this.showBalances && token.balance && (
                        <div class="token-balance">{this.formatBalance(token.balance)}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  private handleOverlayClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      this.handleModalClose();
    }
  };
}
