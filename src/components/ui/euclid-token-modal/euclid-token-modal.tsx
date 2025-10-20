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

  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (!this.open) return;

    switch (event.key) {
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

  private handleSearchInput = (event: CustomEvent<string>) => {
    this.searchQuery = event.detail;
    this.updateFilteredTokens();
  };

  private handleTokenClick = (token: TokenInfo) => {
    this.tokenSelect.emit(token);
    this.handleModalClose();
  };

  private handlePopularTokenClick = (token: PopularToken) => {
    this.tokenSelect.emit(token);
    this.handleModalClose();
  };

  private handleListChange = (event: CustomEvent<string>) => {
    this.selectedListIndex = parseInt(event.detail);
    this.updateFilteredTokens();
  };

  private handleModalClose = () => {
    this.open = false;
    this.searchQuery = '';
    this.modalClose.emit();
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
    const listOptions = this.tokenLists.map((list, index) => ({
      value: index.toString(),
      label: list.name
    }));

    return (
      <euclid-base-modal
        open={this.open}
        modal-title="Select Token"
        show-search={true}
        search-placeholder={this.searchPlaceholder}
        search-query={this.searchQuery}
        show-list-selector={this.tokenLists.length > 1}
        list-options={listOptions}
        selected-list={this.selectedListIndex.toString()}
        loading={this.loading}
        loading-message="Loading tokens..."
        error={this.error}
        empty-message={this.filteredTokens.length === 0 && this.searchQuery ? `No tokens found for "${this.searchQuery}"` : undefined}
        onModalClose={() => this.handleModalClose()}
        onSearchInput={(event) => this.handleSearchInput(event)}
        onListChange={(event) => this.handleListChange(event)}
      >
        <div slot="content">
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

          {/* Token List */}
          {this.filteredTokens.length > 0 && (
            <div class="token-list-section">
              <h3 class="section-title">
                {this.searchQuery ? 'Search Results' : 'All Tokens'}
                <span class="token-count">({this.filteredTokens.length})</span>
              </h3>

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
            </div>
          )}
        </div>
      </euclid-base-modal>
    );
  }
}
