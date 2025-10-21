import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import type { TokenMetadata } from '../../../utils/types/api.types';
import type { TokenDisplayMode, TokenField } from '../../ui/euclid-token-item/euclid-token-item';
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
   * Display mode for token items
   */
  @Prop() displayMode: TokenDisplayMode = 'card';

  /**
   * Fields to show for each token
   */
  @Prop() showFields: TokenField[] = ['logo', 'name', 'price', 'change', 'volume24h', 'decimals', 'chains', 'tags', 'verified'];

  /**
   * Whether tokens are selectable
   */
  @Prop() selectable: boolean = true;

  /**
   * Whether to show search functionality
   */
  @Prop() searchable: boolean = true;

  /**
   * Whether to show filters
   */
  @Prop() filterable: boolean = true;

  /**
   * Whether the component is in loading state (overrides store loading)
   */
  @Prop() loading: boolean = false;

  /**
   * Items per page for pagination (0 = no pagination)
   */
  @Prop() itemsPerPage: number = 12;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Available Tokens';

  // Internal state
  @State() filteredTokens: TokenMetadata[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() selectedTokenId: string = '';
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

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filters = { ...this.filters, search: target.value || '' };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleSortChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const [sortBy, sortOrder] = target.value.split('_');
    this.filters = {
      ...this.filters,
      sortBy: sortBy as TokenFilters['sortBy'],
      sortOrder: sortOrder as TokenFilters['sortOrder']
    };
    this.applyFilters();
  };

  private handleChainFilter = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filters = { ...this.filters, chainFilter: target.value };
    this.currentPage = 1;
    this.applyFilters();
  };

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

  private handleTokenSelect = (event: CustomEvent<TokenMetadata>) => {
    const token = event.detail;
    this.selectedTokenId = token.tokenId;
    this.tokenSelected.emit(token);
  };



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

        {/* Search & Filters */}
        {(this.searchable || this.filterable) && (
          <div class="tokens-controls">
            {this.searchable && (
              <div class="search-input-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Search tokens..."
                  value={this.filters.search}
                  onInput={this.handleSearchInput}
                />
              </div>
            )}

            {this.filterable && (
              <div class="filters-container">
                <select
                  class="filter-select"
                  onChange={this.handleChainFilter}
                >
                  <option value="" selected={this.filters.chainFilter === ''}>All Chains</option>
                  {uniqueChains.map(chain => (
                    <option key={chain} value={chain} selected={this.filters.chainFilter === chain}>
                      {chain}
                    </option>
                  ))}
                </select>

                <select
                  class="filter-select"
                  onChange={this.handleSortChange}
                >
                  <option value="name_asc" selected={this.filters.sortBy === 'name' && this.filters.sortOrder === 'asc'}>Name A-Z</option>
                  <option value="name_desc" selected={this.filters.sortBy === 'name' && this.filters.sortOrder === 'desc'}>Name Z-A</option>
                  <option value="price_desc" selected={this.filters.sortBy === 'price' && this.filters.sortOrder === 'desc'}>Price High-Low</option>
                  <option value="price_asc" selected={this.filters.sortBy === 'price' && this.filters.sortOrder === 'asc'}>Price Low-High</option>
                  <option value="volume_desc" selected={this.filters.sortBy === 'volume' && this.filters.sortOrder === 'desc'}>Volume High-Low</option>
                </select>
              </div>
            )}
          </div>
        )}

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
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>Loading tokens...</span>
            </div>
          ) : paginatedTokens.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
              </svg>
              <span>No tokens found matching your criteria</span>
            </div>
          ) : (
            <div class={{
              'tokens-grid': this.displayMode === 'card',
              'tokens-list-container': this.displayMode !== 'card'
            }}>
              {paginatedTokens.map(token => (
                <euclid-token-item
                  key={token.tokenId}
                  token={token}
                  displayMode={this.displayMode}
                  showFields={this.showFields}
                  selectable={this.selectable}
                  selected={this.selectedTokenId === token.tokenId}
                  onTokenClick={this.handleTokenSelect}
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
