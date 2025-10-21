import { Component, Prop, h, State, Event, EventEmitter, Watch, Element } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';
import {
  InfiniteScrollManager,
  FilterManager,
  PaginationManager,
  type InfiniteScrollConfig,
  type FilterConfig,
  type PaginationConfig
} from './managers';
import type { DataType, DisplayMode, DataItem, FilterState } from './types';

@Component({
  tag: 'euclid-data-list',
  styleUrl: 'euclid-data-list.css',
  shadow: true,
})
export class EuclidDataList {
  @Element() el!: HTMLElement;

  // Props
  @Prop() dataType!: DataType;
  @Prop() displayMode: DisplayMode = 'card';
  @Prop() cardTitle: string = '';
  @Prop() itemsPerPage: number = 10;
  @Prop() infiniteScroll: boolean = false;
  @Prop() useParentScroll: boolean = false;
  @Prop() infiniteScrollTriggerItems: number = 3;
  @Prop() infiniteScrollThreshold: number = 0.1;
  @Prop() maxItems: number = 1000;
  @Prop() showFields: string = '';
  @Prop() searchable: boolean = true;
  @Prop() filterable: boolean = true;
  @Prop() sortable: boolean = true;
  @Prop() showStats: boolean = true;
  @Prop() selectable: boolean = true;
  @Prop() loading: boolean = false;
  @Prop() enableWorker: boolean = false;
  @Prop() walletAddress: string = '';

  // State
  @State() filteredData: DataItem[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() selectedItemId: string = '';
  @State() filterState: FilterState = {
    search: '',
    sortBy: '',
    sortOrder: 'asc',
  };
  @State() displayedItemsCount: number = 0;
  @State() hasMoreData: boolean = true;
  @State() isLoadingMore: boolean = false;
  @State() isComponentVisible: boolean = true;
  @State() storeData: DataItem[] = [];
  @State() storeLoading: boolean = false;
  @State() storeError: string | null = null;
  @State() isWorkerProcessing: boolean = false;
  @State() workerProcessingTime: number = 0;

  // Events
  @Event() itemSelected: EventEmitter<{ item: DataItem; id: string }>;
  @Event() itemHover: EventEmitter<{ item: DataItem; id: string }>;
  @Event() filtersChanged: EventEmitter<{ filters: FilterState; resultCount: number }>;
  @Event() pageChanged: EventEmitter<{ page: number; totalPages: number; itemsPerPage: number }>;
  @Event() loadMoreRequested: EventEmitter<{ currentCount: number; requestedCount: number }>;
  @Event() infiniteScrollStateChanged: EventEmitter<{ isLoading: boolean; hasMore: boolean; displayedCount: number }>;
  @Event() workerPerformance: EventEmitter<{ processingTime: number; operation: string; itemCount: number }>;

  // Managers
  private filterManager?: FilterManager;
  private paginationManager?: PaginationManager;
  private infiniteScrollManager?: InfiniteScrollManager;
  private contentElement?: HTMLElement;

  // Computed properties
  private get storeKey(): 'tokens' | 'pools' | 'chains' {
    return this.dataType;
  }

  private get itemComponent(): string {
    switch (this.dataType) {
      case 'tokens': return 'euclid-token-item';
      case 'chains': return 'euclid-chain-item';
      case 'pools': return 'euclid-pool-item';
      default: return 'div';
    }
  }

  private get showFieldsArray(): string[] {
    return this.showFields ? this.showFields.split(',').map(f => f.trim()) : this.getDefaultFields();
  }

  private get effectiveCardTitle(): string | null {
    return this.cardTitle || null;
  }

  componentWillLoad() {
    this.initializeFilterState();
    this.syncWithStore();
    this.initializeManagers();

    // Initialize infinite scroll state if enabled
    if (this.infiniteScroll) {
      this.displayedItemsCount = this.itemsPerPage;
      this.hasMoreData = true;
    }

    // Listen for store changes
    marketStore.onChange(this.storeKey, () => {
      this.syncWithStore();
      this.applyFilters();
    });    marketStore.onChange('loading', () => {
      this.storeLoading = marketStore.state.loading;
    });

    marketStore.onChange('error', () => {
      this.storeError = marketStore.state.error;
    });
  }

  componentDidLoad() {
    if (this.infiniteScroll) {
      this.infiniteScrollManager?.initialize(this.contentElement);
    }
  }

  componentDidUpdate() {
    if (this.infiniteScroll) {
      this.infiniteScrollManager?.updateTriggerElements();
    }
  }

  disconnectedCallback() {
    // Clean up managers
    this.filterManager?.destroy();
    this.infiniteScrollManager?.destroy();
  }

  private getDefaultFields(): string[] {
    switch (this.dataType) {
      case 'tokens': return ['logo', 'name', 'price', 'change', 'volume24h', 'chains', 'verified'];
      case 'chains': return ['logo', 'name', 'type', 'chain_id'];
      case 'pools': return [];
      default: return [];
    }
  }

  private initializeFilterState() {
    const defaultSort = this.getDefaultSort();

    this.filterState = {
      search: '',
      sortBy: defaultSort.key,
      sortOrder: defaultSort.order,
    };
  }

  private initializeManagers() {
    // Initialize Filter Manager
    const filterConfig: FilterConfig = {
      enableWorker: this.enableWorker || this.infiniteScroll,
      workerThreshold: this.infiniteScroll ? 25 : 50,
      debounceTime: 200,
    };

    this.filterManager = new FilterManager(this.dataType, filterConfig, {
      onFilterComplete: (data, processingTime) => {
        this.filteredData = data;
        this.workerProcessingTime = processingTime || 0;
        this.paginationManager?.updateData(data);
        this.filtersChanged.emit({
          filters: { ...this.filterState },
          resultCount: data.length,
        });
      },
      onWorkerStateChange: (isProcessing) => {
        this.isWorkerProcessing = isProcessing;
      },
      onPerformanceMetric: (metric) => {
        this.workerPerformance.emit(metric);
      },
    });

    // Initialize Pagination Manager
    const paginationConfig: PaginationConfig = {
      itemsPerPage: this.itemsPerPage,
      maxItems: this.maxItems,
      infiniteScroll: this.infiniteScroll,
    };

    this.paginationManager = new PaginationManager(paginationConfig, {
      onStateChange: (state) => {
        // Only sync non-infinite scroll state
        if (!this.infiniteScroll) {
          this.currentPage = state.currentPage;
          this.totalPages = state.totalPages;
        }
      },
      onPageChange: (page, totalPages, itemsPerPage) => {
        this.pageChanged.emit({ page, totalPages, itemsPerPage });
      },
      onInfiniteScrollStateChange: (isLoading, hasMore, displayedCount) => {
        this.infiniteScrollStateChanged.emit({
          isLoading,
          hasMore,
          displayedCount,
        });
      },
    });

    // Initialize Infinite Scroll Manager (if needed)
    if (this.infiniteScroll) {
      const infiniteScrollConfig: InfiniteScrollConfig = {
        useParentScroll: this.useParentScroll,
        triggerItems: this.infiniteScrollTriggerItems,
        threshold: this.infiniteScrollThreshold,
        debounceTime: 100,
      };

      this.infiniteScrollManager = new InfiniteScrollManager(this.el, infiniteScrollConfig, {
        onLoadMore: () => {
          this.handleLoadMore();
        },
        onStateChange: (state) => {
          this.isComponentVisible = state.isComponentVisible;
          this.isLoadingMore = state.isLoadingMore;
        },
      });
    }

    // Apply initial filters
    this.applyFilters();
  }

  private getDefaultSort(): { key: string; order: 'asc' | 'desc' } {
    switch (this.dataType) {
      case 'tokens': return { key: 'name', order: 'asc' };
      case 'chains': return { key: 'name', order: 'asc' };
      case 'pools': return { key: 'apr', order: 'desc' };
      default: return { key: 'name', order: 'asc' };
    }
  }

  private syncWithStore() {
    const storeData = marketStore.state[this.storeKey] || [];
    this.storeData = storeData;
    this.storeLoading = marketStore.state.loading;
    this.storeError = marketStore.state.error;
  }

  @Watch('dataType')
  @Watch('showFields')
  @Watch('infiniteScroll')
  watchPropsChange() {
    // Re-sync with store when dataType changes to get the correct data
    this.syncWithStore();

    // Reset filter state to defaults for new data type
    this.initializeFilterState();

    // Re-initialize managers with new dataType
    this.initializeManagers();

    // Reset pagination and infinite scroll state
    if (this.infiniteScroll) {
      this.displayedItemsCount = this.itemsPerPage;
      this.hasMoreData = true;
    } else {
      // When switching to pagination, ensure state is properly initialized
      this.currentPage = 1;
      this.displayedItemsCount = 0;
      this.hasMoreData = false;
    }

    // Reset selection
    this.selectedItemId = '';

    // Apply filters with new data
    this.applyFilters();
  }

  private async applyFilters() {
    if (this.filterManager && this.storeData.length > 0) {
      await this.filterManager.processData(this.storeData, this.filterState, this.walletAddress);
    } else if (this.storeData.length === 0) {
      // No data yet, set empty filtered data
      this.filteredData = [];
      this.paginationManager?.updateData([]);
    }

    // For non-infinite scroll mode, ensure pagination state is calculated
    // This is a fallback in case the onStateChange callback doesn't trigger properly
    if (!this.infiniteScroll && this.filteredData.length > 0) {
      const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
      if (this.totalPages !== totalPages) {
        this.totalPages = totalPages;
        if (this.currentPage > totalPages) {
          this.currentPage = 1;
        }
      }
    }
  }

  private getPaginatedData(): DataItem[] {
    if (this.infiniteScroll) {
      // Return all displayed items for infinite scroll
      return this.filteredData.slice(0, this.displayedItemsCount);
    }

    // Standard pagination logic
    if (this.itemsPerPage <= 0) {
      return this.filteredData;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  private getItemId(item: DataItem): string {
    switch (this.dataType) {
      case 'tokens': return (item as TokenMetadata).tokenId;
      case 'chains': return (item as EuclidChainConfig).chain_uid;
      case 'pools': return (item as PoolInfo).pool_id;
      default: return 'unknown';
    }
  }

  // Simplified event handlers using managers
  private handleSearch = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const searchQuery = target.value || '';

    this.filterState = {
      ...this.filterState,
      search: searchQuery,
    };
    this.paginationManager?.resetToFirstPage();
    this.applyFilters();
  };

  private handleSortChange = async (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const [sortBy, sortOrder] = target.value.split('_');

    this.filterState = {
      ...this.filterState,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    this.applyFilters();
  };

  private handleFilterChange = (filterKey: string, value: string | boolean) => {
    this.filterState = {
      ...this.filterState,
      [filterKey]: value,
    };
    this.paginationManager?.resetToFirstPage();
    this.applyFilters();
  };

  private clearFilters = () => {
    const defaultSort = this.getDefaultSort();

    this.filterState = {
      search: '',
      sortBy: defaultSort.key,
      sortOrder: defaultSort.order,
    };
    this.paginationManager?.resetToFirstPage();
    this.applyFilters();
  };

  private handleItemSelect = (event: CustomEvent) => {
    const item = event.detail as DataItem;
    const itemId = this.getItemId(item);

    this.selectedItemId = itemId;
    this.itemSelected.emit({ item, id: itemId });
  };

  private handleItemHover = (event: CustomEvent) => {
    const item = event.detail as DataItem;
    const itemId = this.getItemId(item);

    this.itemHover.emit({ item, id: itemId });
  };

  private handlePageChange = (page: number) => {
    this.paginationManager?.goToPage(page);
  };

  private handleLoadMore() {
    if (this.isLoadingMore || !this.hasMoreData) return;

    const currentCount = this.displayedItemsCount;
    const totalAvailable = this.filteredData.length;
    const requestedCount = Math.min(this.itemsPerPage, totalAvailable - currentCount);

    if (requestedCount <= 0) {
      this.hasMoreData = false;
      this.emitInfiniteScrollState();
      return;
    }

    this.isLoadingMore = true;
    this.emitInfiniteScrollState();

    // Emit event for external data loading if needed
    this.loadMoreRequested.emit({
      currentCount,
      requestedCount
    });

    // Simulate async loading (in real scenario, this would be triggered by store updates)
    setTimeout(() => {
      const newDisplayedCount = Math.min(
        currentCount + requestedCount,
        totalAvailable,
        this.maxItems
      );

      this.displayedItemsCount = newDisplayedCount;
      this.hasMoreData = newDisplayedCount < totalAvailable && newDisplayedCount < this.maxItems;
      this.isLoadingMore = false;

      this.emitInfiniteScrollState();

      // Update trigger elements after DOM update
      requestAnimationFrame(() => {
        this.infiniteScrollManager?.updateTriggerElements();
      });
    }, 200);
  }

  private emitInfiniteScrollState() {
    this.infiniteScrollStateChanged.emit({
      isLoading: this.isLoadingMore,
      hasMore: this.hasMoreData,
      displayedCount: this.displayedItemsCount
    });
  }

  // Render methods
  private renderSearch() {
    if (!this.searchable) return null;

    return (
      <div class="search-input-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder={`Search ${this.dataType}...`}
          value={this.filterState.search}
          onInput={this.handleSearch}
        />
        {this.isWorkerProcessing && (
          <div class="search-processing">
            <div class="loading-spinner-small"></div>
          </div>
        )}
      </div>
    );
  }

  private renderFilters() {
    if (!this.filterable) return null;

    const filters = [];

    if (this.dataType === 'tokens') {
      filters.push(
        <label class="filter-checkbox">
          <input
            type="checkbox"
            checked={Boolean(this.filterState.showFavorites)}
            onChange={(e) => this.handleFilterChange('showFavorites', (e.target as HTMLInputElement).checked)}
          />
          <span class="checkbox-label">Show Favorites</span>
        </label>
      );
    }

    if (this.dataType === 'chains') {
      filters.push(
        <select
          class="filter-select"
          onChange={(e) => this.handleFilterChange('typeFilter', (e.target as HTMLSelectElement).value)}
        >
          <option value="">All Types</option>
          <option value="EVM">EVM</option>
          <option value="Cosmwasm">CosmWasm</option>
        </select>
      );
    }

    if (this.dataType === 'pools' && this.walletAddress) {
      filters.push(
        <label class="filter-checkbox">
          <input
            type="checkbox"
            checked={Boolean(this.filterState.showMyPools)}
            onChange={(e) => this.handleFilterChange('showMyPools', (e.target as HTMLInputElement).checked)}
          />
          <span class="checkbox-label">My Pools Only</span>
        </label>
      );
    }

    return filters.length > 0 ? (
      <div class="filters-container">
        {filters}
      </div>
    ) : null;
  }

  private renderSorting() {
    if (!this.sortable) return null;

    const sortOptions = this.getSortOptions();

    return (
      <select class="sort-select" onChange={this.handleSortChange}>
        {sortOptions.flatMap(option => [
          <option key={`${option.key}_asc`} value={`${option.key}_asc`} selected={this.filterState.sortBy === option.key && this.filterState.sortOrder === 'asc'}>
            {option.label} (A-Z)
          </option>,
          <option key={`${option.key}_desc`} value={`${option.key}_desc`} selected={this.filterState.sortBy === option.key && this.filterState.sortOrder === 'desc'}>
            {option.label} (Z-A)
          </option>
        ])}
      </select>
    );
  }

  private getSortOptions(): Array<{ key: string; label: string }> {
    switch (this.dataType) {
      case 'tokens':
        return [
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price' },
          { key: 'volume', label: 'Volume' },
          { key: 'marketCap', label: 'Market Cap' },
        ];
      case 'chains':
        return [
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
          { key: 'chain_id', label: 'Chain ID' },
        ];
      case 'pools':
        return [
          { key: 'apr', label: 'APR' },
          { key: 'tvl', label: 'TVL' },
          { key: 'volume', label: 'Volume' },
          { key: 'fees', label: 'Fees' },
        ];
      default:
        return [];
    }
  }

  private renderStats() {
    if (!this.showStats) return null;

    const stats = this.getStats();

    return (
      <div class="data-stats">
        {stats.map(stat => (
          <div key={stat.key} class="stat-item">
            <div class="stat-label">{stat.label}</div>
            <div class="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
    );
  }

  private getStats(): Array<{ key: string; label: string; value: string }> {
    const totalCount = this.storeData.length;
    const filteredCount = this.filteredData.length;

    const baseStats = [
      { key: 'total', label: `Total ${this.dataType}`, value: totalCount.toString() },
      { key: 'filtered', label: 'Filtered', value: filteredCount.toString() },
    ];

    if (this.dataType === 'tokens') {
      const tokens = this.storeData as TokenMetadata[];
      const chainCount = new Set(tokens.flatMap(t => t.chain_uids || [])).size;
      baseStats.push({ key: 'chains', label: 'Chains', value: chainCount.toString() });
    }

    if ((this.enableWorker || this.infiniteScroll) && this.workerProcessingTime > 0) {
      baseStats.push({
        key: 'performance',
        label: 'Processing',
        value: `${this.workerProcessingTime.toFixed(1)}ms (worker)`
      });
    }

    return baseStats;
  }

  private renderPagination() {
    if (this.infiniteScroll || this.totalPages <= 1) return null;

    return (
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
          {Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return (
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
            );
          })}

          {this.totalPages > 5 && (
            <span class="pagination-ellipsis">...</span>
          )}
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
    );
  }

  private renderInfiniteScrollLoader() {
    if (!this.infiniteScroll) return null;

    return (
      <div class="infinite-scroll-footer">
        {this.isLoadingMore && (
          <div class="infinite-scroll-loading">
            <div class="loading-spinner"></div>
            <span>Loading more {this.dataType}...</span>
          </div>
        )}

        {!this.hasMoreData && this.displayedItemsCount > 0 && (
          <div class="infinite-scroll-end">
            <span>All {this.dataType} loaded ({this.displayedItemsCount} of {this.filteredData.length})</span>
          </div>
        )}
      </div>
    );
  }

  render() {
    const isLoading = (this.storeLoading || this.loading) && this.storeData.length === 0;
    const paginatedData = this.getPaginatedData();
    const ItemComponent = this.itemComponent;

    return (
      <div class="data-list">
        {/* Header */}
        {this.effectiveCardTitle && (
          <div class="data-header">
            <h3 class="data-title">
              {this.effectiveCardTitle}
              {(this.enableWorker || this.infiniteScroll) && (
                <span class="worker-badge">
                  ⚡ Worker{this.infiniteScroll && !this.enableWorker ? ' (auto)' : ''}
                </span>
              )}
            </h3>
          </div>
        )}

        {/* Controls */}
        {(this.searchable || this.filterable || this.sortable) && (
          <div class="data-controls">
            {this.renderSearch()}
            {this.renderFilters()}
            {this.renderSorting()}
          </div>
        )}

        {/* Statistics */}
        {this.renderStats()}

        {/* Content */}
        <div
          class={{
            'data-content': true,
            'data-content--infinite': this.infiniteScroll && !this.useParentScroll,
            'data-content--parent-scroll': this.infiniteScroll && this.useParentScroll,
            'data-content--processing': this.isWorkerProcessing
          }}
          ref={(el) => this.contentElement = el}
        >
          {isLoading || this.isWorkerProcessing ? (
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>
                Loading {this.dataType}...
                {this.isWorkerProcessing && ' (worker processing)'}
              </span>
            </div>
          ) : paginatedData.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor">
                <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
              </svg>
              <span>No {this.dataType} found</span>
              <button class="clear-filters-btn" onClick={this.clearFilters} type="button">
                Clear Filters
              </button>
            </div>
          ) : (
            <div class={{
              'data-grid': this.displayMode === 'card' || this.displayMode === 'grid',
              'data-list-container': this.displayMode === 'list-item',
              'data-compact-container': this.displayMode === 'compact'
            }}>
              {paginatedData.map((item) => {
                const itemId = this.getItemId(item);
                const isSelected = this.selectedItemId === itemId;

                // Prepare props for the item component
                const baseProps = {
                  [this.dataType.slice(0, -1)]: item, // Remove 's' from dataType (tokens -> token)
                  selected: isSelected,
                  displayMode: this.displayMode,
                  showFields: this.showFieldsArray,
                  selectable: this.selectable,
                };

                // Add type-specific props
                const itemProps = this.dataType === 'pools'
                  ? {
                      ...baseProps,
                      tokens: marketStore.state.tokens || [],
                      walletAddress: this.walletAddress
                    }
                  : baseProps;

                // Event handlers
                const eventHandlers: Record<string, (event: CustomEvent) => void> = {};

                if (this.selectable) {
                  eventHandlers.onTokenClick = this.handleItemSelect;
                  eventHandlers.onChainSelect = this.handleItemSelect;
                  eventHandlers.onPoolSelect = this.handleItemSelect;
                  eventHandlers.onItemSelect = this.handleItemSelect;
                }

                eventHandlers.onTokenHover = this.handleItemHover;
                eventHandlers.onChainHover = this.handleItemHover;
                eventHandlers.onPoolHover = this.handleItemHover;
                eventHandlers.onItemHover = this.handleItemHover;

                return (
                  <ItemComponent
                    key={itemId}
                    class="data-item"
                    {...itemProps}
                    {...eventHandlers}
                  />
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {this.renderInfiniteScrollLoader()}
        </div>

        {/* Pagination */}
        {this.renderPagination()}
      </div>
    );
  }
}
