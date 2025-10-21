import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import type { EuclidChainConfig } from '../../../utils/types/api.types';
import type { ChainDisplayMode, ChainField } from '../../ui/euclid-chain-item/euclid-chain-item';

export interface ChainFilters {
  search: string;
  typeFilter: '' | 'EVM' | 'Cosmwasm';
  sortBy: 'name' | 'type' | 'chain_id';
  sortOrder: 'asc' | 'desc';
}

@Component({
  tag: 'euclid-chains-list',
  styleUrl: 'euclid-chains-list.css',
  shadow: true,
})
export class EuclidChainsList {
  /**
   * Chain data (gets from market store automatically)
   */
  @Prop() chains: EuclidChainConfig[] = [];

  /**
   * Display mode for chain items
   */
  @Prop() displayMode: ChainDisplayMode = 'list-item';

  /**
   * Fields to show for each chain
   */
  @Prop() showFields: ChainField[] = ['logo', 'name', 'type'];

  /**
   * Whether chains are selectable
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
   * Items per page (0 = no pagination)
   */
  @Prop() itemsPerPage: number = 0;

  /**
   * Component card title
   */
  @Prop() cardTitle: string = 'Select Chain';

  /**
   * Whether component is loading
   */
  @Prop() loading: boolean = false;

  // Internal state
  @State() filteredChains: EuclidChainConfig[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() selectedChainId: string = '';
  @State() filters: ChainFilters = {
    search: '',
    typeFilter: '',
    sortBy: 'name',
    sortOrder: 'asc',
  };

  // Store state
  @State() storeChains: EuclidChainConfig[] = [];
  @State() storeLoading: boolean = false;

  // Events
  @Event() chainSelected: EventEmitter<EuclidChainConfig>;
  @Event() chainHover: EventEmitter<EuclidChainConfig>;

  componentWillLoad() {
    this.syncWithStore();
    this.applyFilters();

    // Listen for store changes
    marketStore.onChange('chains', () => {
      this.syncWithStore();
      this.applyFilters();
    });
  }

  private syncWithStore() {
    // Use store data if available, fallback to props
    this.storeChains = marketStore.state.chains.length > 0 ? marketStore.state.chains : this.chains;
    this.storeLoading = marketStore.state.loading;
  }

  @Watch('chains')
  watchChainsChange() {
    this.applyFilters();
  }

  private applyFilters() {
    const activeChains = this.storeChains.length > 0 ? this.storeChains : this.chains;
    let filtered = [...activeChains];

    // Apply search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(chain =>
        chain.display_name.toLowerCase().includes(searchLower) ||
        chain.chain_uid.toLowerCase().includes(searchLower) ||
        chain.chain_id.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (this.filters.typeFilter) {
      filtered = filtered.filter(chain => chain.type === this.filters.typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;

      switch (this.filters.sortBy) {
        case 'name':
          aValue = a.display_name.toLowerCase();
          bValue = b.display_name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'chain_id':
          aValue = a.chain_id;
          bValue = b.chain_id;
          break;
        default:
          aValue = a.display_name.toLowerCase();
          bValue = b.display_name.toLowerCase();
      }

      const result = aValue.localeCompare(bValue);
      return this.filters.sortOrder === 'asc' ? result : -result;
    });

    this.filteredChains = filtered;

    // Update pagination
    if (this.itemsPerPage > 0) {
      this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
    }
  }

  private getPaginatedChains(): EuclidChainConfig[] {
    if (this.itemsPerPage <= 0) {
      return this.filteredChains;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredChains.slice(startIndex, endIndex);
  }

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filters = { ...this.filters, search: target.value || '' };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleTypeFilter = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filters = { ...this.filters, typeFilter: target.value as ChainFilters['typeFilter'] };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleSortChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const [sortBy, sortOrder] = target.value.split('_');
    this.filters = {
      ...this.filters,
      sortBy: sortBy as ChainFilters['sortBy'],
      sortOrder: sortOrder as ChainFilters['sortOrder']
    };
    this.applyFilters();
  };

  private handleChainSelect = (event: CustomEvent<EuclidChainConfig>) => {
    const chain = event.detail;
    this.selectedChainId = chain.chain_uid;
    this.chainSelected.emit(chain);
  };

  private handleChainHover = (event: CustomEvent<EuclidChainConfig>) => {
    this.chainHover.emit(event.detail);
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  render() {
    const activeChains = this.storeChains.length > 0 ? this.storeChains : this.chains;
    const isLoading = (this.storeLoading || this.loading) && activeChains.length === 0;
    const paginatedChains = this.getPaginatedChains();

    return (
      <div class="chains-list">
        {/* Header */}
        <div class="chains-header">
          <h3 class="chains-title">{this.cardTitle}</h3>
        </div>

        {/* Search & Filters */}
        {(this.searchable || this.filterable) && (
          <div class="chains-controls">
            {this.searchable && (
              <div class="search-input-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Search chains..."
                  value={this.filters.search}
                  onInput={this.handleSearchInput}
                />
              </div>
            )}

            {this.filterable && (
              <div class="filters-container">
                <select
                  class="filter-select"
                  onChange={this.handleTypeFilter}
                >
                  <option value="" selected={this.filters.typeFilter === ''}>All Types</option>
                  <option value="EVM" selected={this.filters.typeFilter === 'EVM'}>EVM</option>
                  <option value="Cosmwasm" selected={this.filters.typeFilter === 'Cosmwasm'}>CosmWasm</option>
                </select>

                <select
                  class="filter-select"
                  onChange={this.handleSortChange}
                >
                  <option value="name_asc" selected={this.filters.sortBy === 'name' && this.filters.sortOrder === 'asc'}>Name A-Z</option>
                  <option value="name_desc" selected={this.filters.sortBy === 'name' && this.filters.sortOrder === 'desc'}>Name Z-A</option>
                  <option value="type_asc" selected={this.filters.sortBy === 'type' && this.filters.sortOrder === 'asc'}>Type A-Z</option>
                  <option value="type_desc" selected={this.filters.sortBy === 'type' && this.filters.sortOrder === 'desc'}>Type Z-A</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div class="chains-stats">
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">{activeChains.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Filtered</span>
            <span class="stat-value">{this.filteredChains.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">EVM</span>
            <span class="stat-value">{activeChains.filter(c => c.type === 'EVM').length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">CosmWasm</span>
            <span class="stat-value">{activeChains.filter(c => c.type === 'Cosmwasm').length}</span>
          </div>
        </div>

        {/* Content */}
        <div class="chains-content">
          {isLoading ? (
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>Loading chains...</span>
            </div>
          ) : paginatedChains.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor">
                <path d="M32,8C18.745,8,8,18.745,8,32s10.745,24,24,24s24-10.745,24-24S45.255,8,32,8z M32,48c-8.837,0-16-7.163-16-16s7.163-16,16-16s16,7.163,16,16S40.837,48,32,48z"/>
              </svg>
              <span>No chains found</span>
            </div>
          ) : (
            <div class={{
              'chains-grid': this.displayMode === 'card',
              'chains-list-container': this.displayMode !== 'card'
            }}>
              {paginatedChains.map(chain => (
                <euclid-chain-item
                  key={chain.chain_uid}
                  chain={chain}
                  displayMode={this.displayMode}
                  showFields={this.showFields}
                  selectable={this.selectable}
                  selected={this.selectedChainId === chain.chain_uid}
                  onChainSelect={this.handleChainSelect}
                  onChainHover={this.handleChainHover}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {this.itemsPerPage > 0 && this.totalPages > 1 && (
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
