import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import type { TokenMetadata } from '../../../utils/types/api.types';
import { marketStore } from '../../../store/market.store';

export interface TokenFilters {
  search: string;
  sortBy: 'name' | 'price' | 'volume' | 'marketCap';
  sortOrder: 'asc' | 'desc';
  showFavorites: boolean;
  chainFilter: string;
}

@Component({
  tag: 'euclid-tokens-list',
  styleUrl: 'euclid-tokens-list.css',
  shadow: true,
})
export class EuclidTokensList {
  /**
   * Available tokens data (gets from market store automatically)
   * @deprecated Use store instead
   */
  @Prop() tokens: TokenMetadata[] = [];

  /**
   * Whether the component is in loading state (overrides store loading)
   */
  @Prop() loading: boolean = false;

  /**
   * Items per page for pagination
   */
  @Prop() itemsPerPage: number = 20;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Available Tokens';

  // Internal state
  @State() filteredTokens: TokenMetadata[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() filters: TokenFilters = {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showFavorites: false,
    chainFilter: '',
  };

  // Store data (automatically synced)
  @State() storeTokens: TokenMetadata[] = [];
  @State() storeLoading: boolean = false;

  // Events
  @Event() tokenSelected: EventEmitter<TokenMetadata>;
  @Event() filtersChanged: EventEmitter<TokenFilters>;

  componentWillLoad() {
    // Connect to market store for automatic data updates
    this.syncWithStore();

    // Listen for store changes
    marketStore.onChange('tokens', () => {
      this.syncWithStore();
      this.applyFilters();
    });

    // Initialize filters
    this.applyFilters();
  }

  private syncWithStore() {
    // Use store data if available, fallback to props
    this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokens;
    this.storeLoading = marketStore.state.loading;

    // Debug logging
    console.log('🔄 Tokens store sync:', {
      storeTokens: this.storeTokens.length,
      storeLoading: this.storeLoading,
      marketStoreTokens: marketStore.state.tokens.length,
      marketStoreLoading: marketStore.state.loading
    });
  }

  @Watch('tokens')
  watchTokensChange() {
    this.applyFilters();
  }

  private applyFilters() {
    // Use store data first, fallback to props for backward compatibility
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
    let filtered = [...activeTokens];

    // Apply search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(token =>
        token.displayName.toLowerCase().includes(searchLower) ||
        token.tokenId.toLowerCase().includes(searchLower) ||
        token.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply chain filter
    if (this.filters.chainFilter) {
      filtered = filtered.filter(token =>
        token.chain_uids?.includes(this.filters.chainFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (this.filters.sortBy) {
        case 'name':
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price || '0');
          bValue = parseFloat(b.price || '0');
          break;
        case 'volume':
          aValue = a.total_volume_24h || 0;
          bValue = b.total_volume_24h || 0;
          break;
        case 'marketCap':
          aValue = parseFloat(a.price || '0'); // Simplified - would be price * supply
          bValue = parseFloat(b.price || '0');
          break;
        default:
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
      }

      if (typeof aValue === 'string') {
        if (this.filters.sortOrder === 'asc') {
          return aValue.localeCompare(bValue as string);
        } else {
          return (bValue as string).localeCompare(aValue);
        }
      } else {
        if (this.filters.sortOrder === 'asc') {
          return aValue - (bValue as number);
        } else {
          return (bValue as number) - aValue;
        }
      }
    });

    // Update state only if changed
    const newFilteredLength = filtered.length;
    const currentFilteredLength = this.filteredTokens.length;
    const hasChanged = newFilteredLength !== currentFilteredLength ||
      !filtered.every((token, index) => this.filteredTokens[index]?.tokenId === token.tokenId);

    if (hasChanged) {
      this.filteredTokens = filtered;
    }

    const newTotalPages = Math.ceil(filtered.length / this.itemsPerPage);
    if (this.totalPages !== newTotalPages) {
      this.totalPages = newTotalPages;
    }

    // Reset to first page if current page is out of bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    this.filtersChanged.emit(this.filters);
  }

  private getPaginatedTokens(): TokenMetadata[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTokens.slice(startIndex, endIndex);
  }

  private getUniqueChains(): string[] {
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
    const chains = new Set<string>();

    activeTokens.forEach(token => {
      token.chain_uids?.forEach(chain => chains.add(chain));
    });

    return Array.from(chains).sort();
  }

  private handleFiltersChanged = (event: CustomEvent<TokenFilters>) => {
    this.filters = event.detail;
    this.currentPage = 1;
    this.applyFilters();
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  private handleTokenClick = (token: TokenMetadata) => {
    this.tokenSelected.emit(token);
  };

  private formatPrice(price: string | undefined): string {
    if (!price || price === '0') return '$0.00';
    const numPrice = parseFloat(price);
    if (numPrice < 0.01) return `$${numPrice.toFixed(6)}`;
    if (numPrice < 1) return `$${numPrice.toFixed(4)}`;
    return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatVolume(volume: number): string {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  render() {
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
    const isLoading = (this.storeLoading || this.loading) && activeTokens.length === 0;
    const paginatedTokens = this.getPaginatedTokens();
    const uniqueChains = this.getUniqueChains();

    console.log('🎨 Tokens render state:', {
      activeTokens: activeTokens.length,
      filteredTokens: this.filteredTokens.length,
      paginatedTokens: paginatedTokens.length,
      isLoading,
      storeLoading: this.storeLoading,
      loading: this.loading
    });

    return (
      <div class="tokens-list">
        {/* Header */}
        <div class="tokens-header">
          <h3 class="tokens-title">{this.cardTitle}</h3>
        </div>

        {/* Filters */}
        <tokens-filters
          filters={this.filters}
          chains={uniqueChains}
          onFiltersChanged={this.handleFiltersChanged}
        />

        {/* Stats */}
        <div class="tokens-stats">
          <div class="stat-item">
            <span class="stat-label">Total Tokens</span>
            <span class="stat-value">{activeTokens.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Filtered</span>
            <span class="stat-value">{this.filteredTokens.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Chains</span>
            <span class="stat-value">{uniqueChains.length}</span>
          </div>
        </div>

        {/* Content */}
        <div class="tokens-content">
          {isLoading ? (
            <tokens-loading count={6} />
          ) : paginatedTokens.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
              </svg>
              <span>No tokens found matching your criteria</span>
            </div>
          ) : (
            <div class="tokens-grid">
              {paginatedTokens.map(token => (
                <token-item
                  key={token.tokenId}
                  token={token}
                  onClick={() => this.handleTokenClick(token)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {this.totalPages > 1 && (
          <div class="pagination">
            <button
              class="pagination-btn"
              onClick={() => this.handlePageChange(this.currentPage - 1)}
              disabled={this.currentPage === 1}
              type="button"
            >
              Previous
            </button>

            <div class="pagination-pages">
              {Array.from({ length: this.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  class={{
                    'pagination-page': true,
                    'pagination-page--active': page === this.currentPage,
                  }}
                  onClick={() => this.handlePageChange(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              class="pagination-btn"
              onClick={() => this.handlePageChange(this.currentPage + 1)}
              disabled={this.currentPage === this.totalPages}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }
}
