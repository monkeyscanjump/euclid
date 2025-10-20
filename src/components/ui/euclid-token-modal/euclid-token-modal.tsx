import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { TokenInfo } from '../euclid-token-input/euclid-token-input';

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
  private searchInputRef?: HTMLInputElement;
  private modalRef?: HTMLElement;

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

  @State() private searchQuery: string = '';
  @State() private selectedListIndex: number = 0;
  @State() private filteredTokens: TokenInfo[] = [];
  @State() private isAnimating: boolean = false;

  /**
   * Emitted when a token is selected
   */
  @Event() tokenSelect!: EventEmitter<TokenInfo>;

  /**
   * Emitted when the modal is closed
   */
  @Event() modalClose!: EventEmitter<void>;

  /**
   * Emitted when token lists need to be loaded
   */
  @Event() loadTokenLists!: EventEmitter<void>;

  componentWillLoad() {
    this.updateFilteredTokens();
  }

  componentDidLoad() {
    if (this.open) {
      this.focusSearchInput();
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
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        // Handle keyboard navigation through token list
        break;
    }
  }

  private updateFilteredTokens() {
    if (!this.tokenLists.length || this.selectedListIndex >= this.tokenLists.length) {
      this.filteredTokens = [];
      return;
    }

    const currentList = this.tokenLists[this.selectedListIndex];
    let tokens = [...currentList.tokens];

    // Add popular tokens with balances if available
    if (this.showBalances && this.userBalances) {
      tokens = tokens.map(token => ({
        ...token,
        balance: this.userBalances[token.symbol] || '0'
      }));
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      tokens = tokens.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      );
    }

    // Sort tokens: those with balances first, then alphabetically
    if (this.showBalances) {
      tokens.sort((a, b) => {
        const balanceA = parseFloat(a.balance || '0');
        const balanceB = parseFloat(b.balance || '0');

        if (balanceA > 0 && balanceB === 0) return -1;
        if (balanceA === 0 && balanceB > 0) return 1;
        if (balanceA !== balanceB) return balanceB - balanceA;

        return a.symbol.localeCompare(b.symbol);
      });
    } else {
      tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    this.filteredTokens = tokens;
  }

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.updateFilteredTokens();
  };

  private handleTokenClick = (token: TokenInfo) => {
    this.tokenSelect.emit(token);
    this.closeModal();
  };

  private handlePopularTokenClick = (token: PopularToken) => {
    this.tokenSelect.emit(token);
    this.closeModal();
  };

  private handleListChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.selectedListIndex = parseInt(target.value);
    this.updateFilteredTokens();
  };

  private openModal() {
    this.isAnimating = true;
    this.open = true;

    // Focus search input after animation
    setTimeout(() => {
      this.focusSearchInput();
      this.isAnimating = false;
    }, 150);

    // Load token lists if empty
    if (!this.tokenLists.length && !this.loading) {
      this.loadTokenLists.emit();
    }
  }

  private closeModal() {
    this.isAnimating = true;

    setTimeout(() => {
      this.open = false;
      this.isAnimating = false;
      this.searchQuery = '';
      this.modalClose.emit();
    }, 150);
  }

  private focusSearchInput() {
    if (this.searchInputRef) {
      this.searchInputRef.focus();
    }
  }

  private handleOverlayClick = (event: Event) => {
    if (event.target === this.modalRef) {
      this.closeModal();
    }
  };

  private formatBalance(balance: string): string {
    const num = parseFloat(balance);
    if (isNaN(num) || num === 0) return '0';

    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  }

  private formatPrice(price: string): string {
    const num = parseFloat(price);
    if (isNaN(num)) return '-';

    if (num < 0.01) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    if (num < 1000) return `$${num.toFixed(2)}`;
    if (num < 1000000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${(num / 1000000).toFixed(1)}M`;
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
            <h2 class="modal-title">Select Token</h2>
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

          {/* Search Section */}
          <div class="search-section">
            <div class="search-input-container">
              <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                ref={(el) => this.searchInputRef = el}
                type="text"
                placeholder={this.searchPlaceholder}
                value={this.searchQuery}
                onInput={this.handleSearchInput}
                class="search-input"
              />
            </div>

            {/* Token List Selector */}
            {this.tokenLists.length > 1 && (
              <select
                class="list-selector"
                onInput={this.handleListChange}
              >
                {this.tokenLists.map((list, index) => (
                  <option key={list.name} value={index.toString()}>
                    {list.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Popular Tokens */}
          {this.showPopular && this.popularTokens.length > 0 && !this.searchQuery && (
            <div class="popular-section">
              <h3 class="section-title">Popular Tokens</h3>
              <div class="popular-tokens-grid">
                {this.popularTokens.slice(0, 6).map(token => (
                  <button
                    key={token.symbol}
                    class={{
                      'popular-token-card': true,
                      'popular-token-card--selected': this.selectedToken?.symbol === token.symbol
                    }}
                    onClick={() => this.handlePopularTokenClick(token)}
                    type="button"
                  >
                    {token.logoUrl && (
                      <img src={token.logoUrl} alt={token.symbol} class="token-logo" />
                    )}
                    <div class="token-info">
                      <span class="token-symbol">{token.symbol}</span>
                      {token.priceUsd && (
                        <span class="token-price">{this.formatPrice(token.priceUsd)}</span>
                      )}
                    </div>
                    {this.showBalances && this.userBalances[token.symbol] && (
                      <span class="token-balance">
                        {this.formatBalance(this.userBalances[token.symbol])}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              <p class="loading-text">Loading tokens...</p>
            </div>
          )}

          {/* Token List */}
          {!this.loading && !this.error && (
            <div class="token-list-section">
              <h3 class="section-title">
                {this.searchQuery ? 'Search Results' : 'All Tokens'}
                {this.filteredTokens.length > 0 && (
                  <span class="token-count">({this.filteredTokens.length})</span>
                )}
              </h3>

              {this.filteredTokens.length === 0 ? (
                <div class="empty-state">
                  <p class="empty-message">
                    {this.searchQuery
                      ? `No tokens found for "${this.searchQuery}"`
                      : 'No tokens available'}
                  </p>
                </div>
              ) : (
                <div class="token-list">
                  {this.filteredTokens.map(token => (
                    <button
                      key={token.symbol}
                      class={{
                        'token-item': true,
                        'token-item--selected': this.selectedToken?.symbol === token.symbol,
                        'token-item--has-balance': this.showBalances && parseFloat(token.balance || '0') > 0
                      }}
                      onClick={() => this.handleTokenClick(token)}
                      type="button"
                    >
                      <div class="token-item-left">
                        {token.logoUrl && (
                          <img src={token.logoUrl} alt={token.symbol} class="token-logo" />
                        )}
                        <div class="token-details">
                          <span class="token-symbol">{token.symbol}</span>
                          <span class="token-name">{token.name}</span>
                        </div>
                      </div>

                      {this.showBalances && token.balance && (
                        <div class="token-item-right">
                          <span class="token-balance">
                            {this.formatBalance(token.balance)}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
