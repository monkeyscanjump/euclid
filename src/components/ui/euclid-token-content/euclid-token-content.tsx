import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { marketStore } from '../../../store/market.store';
import type { TokenMetadata } from '../../../utils/types/api.types';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  address?: string;
  balance?: string;
  tokenId?: string;
  displayName?: string;
  coinDecimal?: number;
  chain_uid?: string;
  chainUID?: string;
  logo?: string;
  price?: number;
  priceUsd?: string;
}

@Component({
  tag: 'euclid-token-content',
  styleUrl: 'euclid-token-content.css',
  shadow: true,
})
export class EuclidTokenContent {
  @State() private searchQuery: string = '';
  @State() private storeTokens: TokenMetadata[] = [];
  @State() private storeLoading: boolean = false;
  @State() private filteredTokens: TokenInfo[] = [];

  @Event() tokenSelect!: EventEmitter<{
    token: TokenInfo;
    selectorType: 'input' | 'output';
  }>;

  componentWillLoad() {
    this.syncWithStore();
  }

  componentDidLoad() {
    // Listen for store changes
    marketStore.onChange('tokens', () => {
      this.syncWithStore();
    });
  }

  private syncWithStore() {
    this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
    this.storeLoading = marketStore.state.loading;
    this.updateFilteredTokens();
  }

  private convertStoreTokenToTokenInfo(token: TokenMetadata): TokenInfo {
    return {
      tokenId: token.tokenId,
      symbol: token.symbol || token.displayName.toUpperCase(),
      name: token.displayName,
      decimals: token.coinDecimal,
      logoUrl: token.logo || token.image,
      balance: '0', // Would need to fetch from wallet
      displayName: token.displayName,
      coinDecimal: token.coinDecimal,
      chain_uid: token.chain_uid || token.chain_uids?.[0] || '',
      chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
      address: token.address || token.tokenId,
      logo: token.logo || token.image,
      price: token.price ? parseFloat(token.price) : undefined,
      priceUsd: token.price,
    };
  }

  private getAvailableTokens(): TokenInfo[] {
    return this.storeTokens.map(token => this.convertStoreTokenToTokenInfo(token));
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

  private handleTokenSelect = (token: TokenInfo) => {
    const selectorType = appStore.state.tokenSelectorType || 'input';

    this.tokenSelect.emit({
      token,
      selectorType
    });

    appStore.closeTokenModal();
  };

  render() {
    // Show loading only if we're loading AND don't have tokens yet
    const isLoading = this.storeLoading && this.storeTokens.length === 0;

    return (
      <div class="token-content">
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
          <div class="token-list">
            {this.filteredTokens.map(token => (
              <button
                key={token.tokenId}
                class="token-item"
                onClick={() => this.handleTokenSelect(token)}
                type="button"
              >
                <div class="token-logo">
                  {token.logoUrl ? (
                    <img src={token.logoUrl} alt={token.symbol} />
                  ) : (
                    token.symbol.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div class="token-info">
                  <div class="token-symbol">{token.symbol}</div>
                  <div class="token-name">{token.name}</div>
                </div>
                {token.balance && parseFloat(token.balance) > 0 && (
                  <div class="token-balance">{this.formatBalance(token.balance)}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  private formatBalance(balance: string): string {
    const num = parseFloat(balance || '0');
    if (isNaN(num) || num === 0) return '0';

    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  }
}
