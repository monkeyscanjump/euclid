import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { appStore } from '../../../store/app.store';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  address?: string;
  balance?: string;
}

@Component({
  tag: 'euclid-token-content',
  styleUrl: 'euclid-token-content.css',
  shadow: true,
})
export class EuclidTokenContent {
  @State() private searchQuery: string = '';
  @State() private tokens: TokenInfo[] = [
    // Mock data - in real app this would come from store/API
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '1,234.56' },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, balance: '890.12' },
    { symbol: 'ETH', name: 'Ethereum', decimals: 18, balance: '2.45' },
    { symbol: 'BTC', name: 'Bitcoin', decimals: 8, balance: '0.125' },
    { symbol: 'ATOM', name: 'Cosmos', decimals: 6, balance: '456.78' },
  ];

  @Event() tokenSelect!: EventEmitter<TokenInfo>;

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
  };

  private handleTokenSelect = (token: TokenInfo) => {
    this.tokenSelect.emit(token);
    appStore.closeTokenModal();
  };

  private getFilteredTokens(): TokenInfo[] {
    if (!this.searchQuery.trim()) {
      return this.tokens;
    }

    const query = this.searchQuery.toLowerCase();
    return this.tokens.filter(token =>
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  }

  render() {
    const filteredTokens = this.getFilteredTokens();

    return (
      <div class="token-content">
        <div class="search-section">
          <input
            type="text"
            class="search-input"
            placeholder="Search tokens..."
            value={this.searchQuery}
            onInput={this.handleSearchInput}
          />
        </div>

        <div class="token-list">
          {filteredTokens.map(token => (
            <button
              key={token.symbol}
              class="token-item"
              onClick={() => this.handleTokenSelect(token)}
              type="button"
            >
              <div class="token-info">
                <div class="token-symbol">{token.symbol}</div>
                <div class="token-name">{token.name}</div>
              </div>
              {token.balance && (
                <div class="token-balance">{token.balance}</div>
              )}
            </button>
          ))}
        </div>

        {filteredTokens.length === 0 && (
          <div class="empty-state">
            <p>No tokens found for "{this.searchQuery}"</p>
          </div>
        )}
      </div>
    );
  }
}
