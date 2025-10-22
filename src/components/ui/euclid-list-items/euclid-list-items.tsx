import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';
import type { TokenField } from '../euclid-token-item/euclid-token-item';
import type { ChainField } from '../euclid-chain-item/euclid-chain-item';

// Generic types for different data structures
export type ListItemType = 'token' | 'chain' | 'pool';
export type DisplayMode = 'card' | 'list-item' | 'compact';

// Filter configuration interface
export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

// Sort configuration interface
export interface SortConfig {
  key: string;
  label: string;
  type: 'string' | 'number';
}

// Generic filters interface
export interface ListFilters {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string>;
  [key: string]: string | Record<string, string>;
}

// Union type for different item types
export type ListItemData = TokenMetadata | EuclidChainConfig | PoolInfo;

@Component({
  tag: 'euclid-list-items',
  styleUrl: 'euclid-list-items.css',
  shadow: true,
})
export class EuclidListItems {
  /**
   * Type of items to display (determines data source and item component)
   */
  @Prop() itemType: ListItemType = 'token';

  /**
   * Items data (will use store data if available, fallback to this)
   */
  @Prop() items: ListItemData[] = [];

  /**
   * Display mode for items
   */
  @Prop() displayMode: DisplayMode = 'card';

  /**
   * Fields to show for each item (passed to item component)
   */
  @Prop() showFields: string[] = [];

  /**
   * Whether items are selectable
   */
  @Prop() selectable: boolean = true;

  /**
   * Whether to show search functionality
   */
  @Prop() searchable: boolean = true;

  /**
   * Fields to search in (e.g., ['displayName', 'tokenId'])
   */
  @Prop() searchFields: string[] = ['name'];

  /**
   * Whether to show filters
   */
  @Prop() filterable: boolean = true;

  /**
   * Filter configurations
   */
  @Prop() filterConfigs: FilterConfig[] = [];

  /**
   * Sort configurations
   */
  @Prop() sortConfigs: SortConfig[] = [];

  /**
   * Items per page (0 = no pagination)
   */
  @Prop() itemsPerPage: number = 12;

  /**
   * Component title
   */
  @Prop() listTitle: string = 'Items';

  /**
   * Whether component is loading
   */
  @Prop() loading: boolean = false;

  /**
   * Additional props to pass to item components
   */
  @Prop() itemProps: Record<string, unknown> = {};

  // Internal state
  @State() filteredItems: ListItemData[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() selectedItemId: string = '';
  @State() filters: ListFilters = {
    search: '',
    sortBy: '',
    sortOrder: 'asc',
    filters: {},
  };

  // Store data
  @State() storeItems: ListItemData[] = [];
  @State() storeLoading: boolean = false;

  // Events
  @Event() itemSelected: EventEmitter<ListItemData>;
  @Event() itemHover: EventEmitter<ListItemData>;
  @Event() filtersChanged: EventEmitter<ListFilters>;

  componentWillLoad() {
    this.initializeDefaults();
    this.syncWithStore();
    this.applyFilters();

    // Listen for store changes
    const storeKey = this.getStoreKey() as keyof typeof marketStore.state;
    marketStore.onChange(storeKey, () => {
      this.syncWithStore();
      this.applyFilters();
    });
  }

  @Watch('items')
  watchItemsChange() {
    this.applyFilters();
  }

  private initializeDefaults() {
    // Set default sort if not provided
    if (this.sortConfigs.length > 0 && !this.filters.sortBy) {
      this.filters = { ...this.filters, sortBy: this.sortConfigs[0].key };
    }

    // Initialize filter values
    this.filterConfigs.forEach(config => {
      if (this.filters.filters[config.key] === undefined) {
        this.filters.filters[config.key] = '';
      }
    });
  }

  private getStoreKey(): string {
    switch (this.itemType) {
      case 'token': return 'tokens';
      case 'chain': return 'chains';
      case 'pool': return 'pools';
      default: return 'tokens';
    }
  }

  private getItemComponent(): string {
    switch (this.itemType) {
      case 'token': return 'euclid-token-item';
      case 'chain': return 'euclid-chain-item';
      case 'pool': return 'euclid-pool-item';
      default: return 'euclid-token-item';
    }
  }

  private getItemIdField(): string {
    switch (this.itemType) {
      case 'token': return 'tokenId';
      case 'chain': return 'chain_uid';
      case 'pool': return 'pool_id';
      default: return 'id';
    }
  }

  private syncWithStore() {
    const storeKey = this.getStoreKey();
    const storeData = (marketStore.state[storeKey] as ListItemData[]) || [];

    this.storeItems = Array.isArray(storeData) && storeData.length > 0 ? storeData : this.items;
    this.storeLoading = marketStore.state.loading;

    console.log(`🔄 ${this.itemType} store sync:`, {
      storeItems: this.storeItems.length,
      storeLoading: this.storeLoading,
      itemType: this.itemType
    });
  }

  private applyFilters() {
    const activeItems = this.storeItems.length > 0 ? this.storeItems : this.items;
    let filtered = [...activeItems];

    // Apply search filter
    if (this.filters.search && this.searchFields.length > 0) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(item => {
        return this.searchFields.some(field => {
          const value = this.getNestedValue(item as unknown as Record<string, unknown>, field);
          return value && String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply custom filters
    Object.entries(this.filters.filters).forEach(([key, value]) => {
      if (value && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = this.getNestedValue(item as unknown as Record<string, unknown>, key);
          if (Array.isArray(itemValue)) {
            return itemValue.includes(value);
          }
          return String(itemValue) === String(value);
        });
      }
    });

    // Apply sorting
    if (this.filters.sortBy) {
      const sortConfig = this.sortConfigs.find(config => config.key === this.filters.sortBy);
      if (sortConfig) {
        filtered.sort((a, b) => {
          const aValue = this.getNestedValue(a as unknown as Record<string, unknown>, sortConfig.key);
          const bValue = this.getNestedValue(b as unknown as Record<string, unknown>, sortConfig.key);

          let comparison = 0;

          if (sortConfig.type === 'number') {
            const aNum = parseFloat(String(aValue).replace(/[^0-9.-]/g, '')) || 0;
            const bNum = parseFloat(String(bValue).replace(/[^0-9.-]/g, '')) || 0;
            comparison = aNum - bNum;
          } else {
            const aStr = String(aValue || '').toLowerCase();
            const bStr = String(bValue || '').toLowerCase();
            comparison = aStr.localeCompare(bStr);
          }

          return this.filters.sortOrder === 'asc' ? comparison : -comparison;
        });
      }
    }

    // Update state
    this.filteredItems = filtered;

    // Update pagination
    if (this.itemsPerPage > 0) {
      this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
    } else {
      this.totalPages = 1;
    }

    this.filtersChanged.emit(this.filters);
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => (current as Record<string, unknown>)?.[key], obj);
  }

  private getPaginatedItems(): ListItemData[] {
    if (this.itemsPerPage <= 0) {
      return this.filteredItems;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredItems.slice(startIndex, endIndex);
  }

  private getFilterStats(): Record<string, number> {
    const activeItems = this.storeItems.length > 0 ? this.storeItems : this.items;
    const stats: Record<string, number> = {
      total: activeItems.length,
      filtered: this.filteredItems.length,
    };

    // Add type-specific stats
    if (this.itemType === 'token') {
      const chains = new Set();
      activeItems.forEach(item => {
        const chainUids = (item as TokenMetadata).chain_uids;
        if (chainUids) {
          chainUids.forEach((chain: string) => chains.add(chain));
        }
      });
      stats.chains = chains.size;
    } else if (this.itemType === 'chain') {
      stats.evm = activeItems.filter(item => (item as EuclidChainConfig).type === 'EVM').length;
      stats.cosmwasm = activeItems.filter(item => (item as EuclidChainConfig).type === 'Cosmwasm').length;
    }

    return stats;
  }

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filters = { ...this.filters, search: target.value || '' };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleFilterChange = (filterKey: string, event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filters = {
      ...this.filters,
      filters: {
        ...this.filters.filters,
        [filterKey]: target.value
      }
    };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleSortChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const [sortBy, sortOrder] = target.value.split('_');
    this.filters = {
      ...this.filters,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    };
    this.applyFilters();
  };

  private handleItemSelect = (event: CustomEvent<ListItemData>) => {
    const item = event.detail;
    const idField = this.getItemIdField();
    this.selectedItemId = (item as unknown as Record<string, unknown>)[idField] as string;
    this.itemSelected.emit(item);
  };

  private handleItemHover = (event: CustomEvent<ListItemData>) => {
    this.itemHover.emit(event.detail);
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  render() {
    const activeItems = this.storeItems.length > 0 ? this.storeItems : this.items;
    const isLoading = (this.storeLoading || this.loading) && activeItems.length === 0;
    const paginatedItems = this.getPaginatedItems();
    const stats = this.getFilterStats();
    const idField = this.getItemIdField();

    return (
      <div class="list-items">
        {/* Header */}
        <div class="list-header">
          <h3 class="list-title">{this.listTitle}</h3>
        </div>

        {/* Search & Filters */}
        {(this.searchable || this.filterable) && (
          <div class="list-controls">
            {this.searchable && (
              <div class="search-input-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  class="search-input"
                  placeholder={`Search ${this.itemType}s...`}
                  value={this.filters.search}
                  onInput={this.handleSearchInput}
                />
              </div>
            )}

            {this.filterable && (
              <div class="filters-container">
                {this.filterConfigs.map(config => (
                  <select
                    key={config.key}
                    class="filter-select"
                    onChange={(e) => this.handleFilterChange(config.key, e)}
                  >
                    <option value="" selected={this.filters.filters[config.key] === ''}>{config.label}</option>
                    {config.options.map(option => (
                      <option key={option.value} value={option.value} selected={this.filters.filters[config.key] === option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}

                {this.sortConfigs.length > 0 && (
                  <select class="filter-select" onChange={this.handleSortChange}>
                    {this.sortConfigs.map(config => (
                      [
                        <option key={`${config.key}_asc`} value={`${config.key}_asc`}
                                selected={this.filters.sortBy === config.key && this.filters.sortOrder === 'asc'}>
                          {config.label} A-Z
                        </option>,
                        <option key={`${config.key}_desc`} value={`${config.key}_desc`}
                                selected={this.filters.sortBy === config.key && this.filters.sortOrder === 'desc'}>
                          {config.label} Z-A
                        </option>
                      ]
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div class="list-stats">
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">{stats.total}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Filtered</span>
            <span class="stat-value">{stats.filtered}</span>
          </div>
          {Object.entries(stats).filter(([key]) => !['total', 'filtered'].includes(key)).map(([key, value]) => (
            <div key={key} class="stat-item">
              <span class="stat-label">{key.toUpperCase()}</span>
              <span class="stat-value">{value}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div class="list-content">
          {isLoading ? (
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>Loading {this.itemType}s...</span>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
              </svg>
              <span>No {this.itemType}s found matching your criteria</span>
            </div>
          ) : (
            <div class={{
              'items-grid': this.displayMode === 'card',
              'items-list-container': this.displayMode !== 'card'
            }}>
              {paginatedItems.map(item => {
                const itemId = (item as unknown as Record<string, unknown>)[idField] as string;

                if (this.itemType === 'token') {
                  return (
                    <euclid-token-item
                      key={itemId}
                      token={item as TokenMetadata}
                      displayMode={this.displayMode}
                      showFields={this.showFields as TokenField[]}
                      selectable={this.selectable}
                      selected={this.selectedItemId === itemId}
                      {...this.itemProps}
                      onTokenClick={this.handleItemSelect}
                    />
                  );
                } else if (this.itemType === 'chain') {
                  return (
                    <euclid-chain-item
                      key={itemId}
                      chain={item as EuclidChainConfig}
                      displayMode={this.displayMode}
                      showFields={this.showFields as ChainField[]}
                      selectable={this.selectable}
                      selected={this.selectedItemId === itemId}
                      {...this.itemProps}
                      onChainSelect={this.handleItemSelect}
                      onChainHover={this.handleItemHover}
                    />
                  );
                } else if (this.itemType === 'pool') {
                  return (
                    <euclid-pool-item
                      key={itemId}
                      pool={item as PoolInfo}
                      displayMode={this.displayMode}
                      showFields={this.showFields}
                      selectable={this.selectable}
                      selected={this.selectedItemId === itemId}
                      {...this.itemProps}
                      onPoolSelect={this.handleItemSelect}
                      onPoolHover={this.handleItemHover}
                    />
                  );
                }
                return null;
              })}
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
