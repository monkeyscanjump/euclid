import { Component, Prop, h, State, Event, EventEmitter, Watch, Element } from '@stencil/core';
import { marketStore } from '../../../store/market.store';
import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';

export type DataType = 'tokens' | 'chains' | 'pools';
export type DisplayMode = 'card' | 'list-item' | 'compact' | 'grid';

// Union type for all data items
export type DataItem = TokenMetadata | EuclidChainConfig | PoolInfo;

export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showFavorites?: boolean;
  typeFilter?: string;
  chainFilter?: string;
  showMyPools?: boolean;
}

@Component({
  tag: 'euclid-data-list',
  styleUrl: 'euclid-data-list.css',
  shadow: true,
})
export class EuclidDataList {
  @Element() el!: HTMLElement;

  /**
   * Type of data to display: tokens, chains, or pools
   */
  @Prop() dataType!: DataType;

  /**
   * Display mode for items
   */
  @Prop() displayMode: DisplayMode = 'card';

  /**
   * Card title
   */
  @Prop() cardTitle: string = '';

  /**
   * Items per page for pagination, or initial items for infinite scroll
   */
  @Prop() itemsPerPage: number = 10;

  /**
   * Enable infinite scroll instead of pagination
   */
  @Prop() infiniteScroll: boolean = false;

  /**
   * Use parent container scroll instead of component's own scroll
   */
  @Prop() useParentScroll: boolean = false;

  /**
   * Number of items from bottom to trigger infinite scroll load
   */
  @Prop() infiniteScrollTriggerItems: number = 3;

  /**
   * Intersection threshold for infinite scroll trigger (0.0 to 1.0)
   */
  @Prop() infiniteScrollThreshold: number = 0.1;

  /**
   * Maximum items to load in infinite scroll mode (prevents memory issues)
   */
  @Prop() maxItems: number = 1000;

  /**
   * Fields to show in item components (comma-separated string)
   */
  @Prop() showFields: string = '';

  /**
   * Whether to enable search
   */
  @Prop() searchable: boolean = true;

  /**
   * Whether to enable filtering
   */
  @Prop() filterable: boolean = true;

  /**
   * Whether to enable sorting
   */
  @Prop() sortable: boolean = true;

  /**
   * Whether to show statistics
   */
  @Prop() showStats: boolean = true;

  /**
   * Whether items are selectable
   */
  @Prop() selectable: boolean = true;

  /**
   * External loading state override
   */
  @Prop() loading: boolean = false;

  /**
   * Wallet address for pool positions
   */
  @Prop() walletAddress: string = '';

  // Internal state
  @State() filteredData: DataItem[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() selectedItemId: string = '';
  @State() filterState: FilterState = {
    search: '',
    sortBy: '',
    sortOrder: 'asc',
  };

  // Infinite scroll state
  @State() displayedItemsCount: number = 0;
  @State() hasMoreData: boolean = true;
  @State() isLoadingMore: boolean = false;
  @State() isComponentVisible: boolean = true;

  // Store state
  @State() storeData: DataItem[] = [];
  @State() storeLoading: boolean = false;
  @State() storeError: string | null = null;

  // Events
  @Event() itemSelected: EventEmitter<{ item: DataItem; id: string }>;
  @Event() itemHover: EventEmitter<{ item: DataItem; id: string }>;
  @Event() filtersChanged: EventEmitter<{ filters: FilterState; resultCount: number }>;
  @Event() pageChanged: EventEmitter<{ page: number; totalPages: number; itemsPerPage: number }>;
  @Event() loadMoreRequested: EventEmitter<{ currentCount: number; requestedCount: number }>;
  @Event() infiniteScrollStateChanged: EventEmitter<{ isLoading: boolean; hasMore: boolean; displayedCount: number }>;

  // Intersection Observer instances
  private componentObserver?: IntersectionObserver;
  private itemObserver?: IntersectionObserver;
  private triggerElements: Set<Element> = new Set();
  private loadMoreDebounceTimer?: NodeJS.Timeout;
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
    this.applyFilters();

    // Initialize infinite scroll state if enabled
    if (this.infiniteScroll) {
      this.displayedItemsCount = this.itemsPerPage;
      this.hasMoreData = true;
    }

    // Listen for store changes
    marketStore.onChange(this.storeKey, () => {
      this.syncWithStore();
      this.applyFilters();
    });

    marketStore.onChange('loading', () => {
      this.storeLoading = marketStore.state.loading;
    });

    marketStore.onChange('error', () => {
      this.storeError = marketStore.state.error;
    });
  }

  componentDidLoad() {
    console.log('🔍 EuclidDataList componentDidLoad - infiniteScroll:', this.infiniteScroll, 'useParentScroll:', this.useParentScroll);
    if (this.infiniteScroll) {
      console.log('🚀 Setting up intersection observers for infinite scroll');
      this.setupIntersectionObservers();
    }
  }

  componentDidUpdate() {
    if (this.infiniteScroll) {
      this.updateTriggerElements();
    }
  }

  disconnectedCallback() {
    this.cleanupIntersectionObservers();
    if (this.loadMoreDebounceTimer) {
      clearTimeout(this.loadMoreDebounceTimer);
    }
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
  watchPropsChange() {
    this.initializeFilterState();
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.storeData];

    // Apply search filter
    if (this.searchable && this.filterState.search) {
      const searchLower = this.filterState.search.toLowerCase();
      filtered = filtered.filter(item => this.searchInItem(item, searchLower));
    }

    // Apply type-specific filters
    filtered = this.applyTypeSpecificFilters(filtered);

    // Apply sorting
    if (this.sortable && this.filterState.sortBy) {
      filtered = this.applySorting(filtered);
    }

    this.filteredData = filtered;

    // Reset infinite scroll state when filters change
    if (this.infiniteScroll) {
      this.displayedItemsCount = Math.min(this.itemsPerPage, filtered.length);
      this.hasMoreData = this.displayedItemsCount < filtered.length;
      this.isLoadingMore = false;
    }

    this.updatePagination();

    // Emit filter change event
    this.filtersChanged.emit({
      filters: { ...this.filterState },
      resultCount: filtered.length,
    });

    // Update trigger elements after filter change
    if (this.infiniteScroll) {
      requestAnimationFrame(() => {
        this.updateTriggerElements();
      });
    }
  }

  private searchInItem(item: DataItem, searchQuery: string): boolean {
    const searchFields = this.getSearchFields();

    return searchFields.some(field => {
      const value = this.getItemValue(item, field);
      return value && value.toString().toLowerCase().includes(searchQuery);
    });
  }

  private getSearchFields(): string[] {
    switch (this.dataType) {
      case 'tokens': return ['displayName', 'tokenId', 'name'];
      case 'chains': return ['display_name', 'chain_id', 'chain_uid'];
      case 'pools': return ['token_1', 'token_2', 'pool_id'];
      default: return ['name'];
    }
  }

  private applyTypeSpecificFilters(items: DataItem[]): DataItem[] {
    switch (this.dataType) {
      case 'tokens':
        return this.applyTokenFilters(items as TokenMetadata[]) as DataItem[];
      case 'chains':
        return this.applyChainFilters(items as EuclidChainConfig[]) as DataItem[];
      case 'pools':
        return this.applyPoolFilters(items as PoolInfo[]) as DataItem[];
      default:
        return items;
    }
  }

  private applyTokenFilters(tokens: TokenMetadata[]): TokenMetadata[] {
    let filtered = [...tokens];

    // Chain filter
    if (this.filterState.chainFilter) {
      filtered = filtered.filter(token =>
        token.chain_uids?.includes(this.filterState.chainFilter!)
      );
    }

    // Favorites filter (if implemented)
    if (this.filterState.showFavorites) {
      // Implement favorites logic here
    }

    return filtered;
  }

  private applyChainFilters(chains: EuclidChainConfig[]): EuclidChainConfig[] {
    let filtered = [...chains];

    // Type filter
    if (this.filterState.typeFilter) {
      filtered = filtered.filter(chain => chain.type === this.filterState.typeFilter);
    }

    return filtered;
  }

  private applyPoolFilters(pools: PoolInfo[]): PoolInfo[] {
    const filtered = [...pools];

    // My pools filter (if wallet connected and positions available)
    if (this.filterState.showMyPools && this.walletAddress) {
      // This would need positions data - implement based on your needs
      // For now, return all pools
    }

    return filtered;
  }

  private applySorting(items: DataItem[]): DataItem[] {
    return [...items].sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (this.dataType) {
        case 'tokens':
          ({ aValue, bValue } = this.getTokenSortValues(a as TokenMetadata, b as TokenMetadata));
          break;
        case 'chains':
          ({ aValue, bValue } = this.getChainSortValues(a as EuclidChainConfig, b as EuclidChainConfig));
          break;
        case 'pools':
          ({ aValue, bValue } = this.getPoolSortValues(a as PoolInfo, b as PoolInfo));
          break;
        default:
          aValue = bValue = 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return this.filterState.sortOrder === 'asc' ? result : -result;
      }

      const result = (aValue as number || 0) - (bValue as number || 0);
      return this.filterState.sortOrder === 'asc' ? result : -result;
    });
  }

  private getTokenSortValues(a: TokenMetadata, b: TokenMetadata): { aValue: unknown; bValue: unknown } {
    switch (this.filterState.sortBy) {
      case 'name':
        return { aValue: a.displayName, bValue: b.displayName };
      case 'price':
        return { aValue: parseFloat(a.price || '0'), bValue: parseFloat(b.price || '0') };
      case 'volume':
        return { aValue: a.total_volume_24h || 0, bValue: b.total_volume_24h || 0 };
      case 'marketCap':
        return { aValue: 0, bValue: 0 }; // Market cap not available in TokenMetadata
      default:
        return { aValue: a.displayName, bValue: b.displayName };
    }
  }

  private getChainSortValues(a: EuclidChainConfig, b: EuclidChainConfig): { aValue: unknown; bValue: unknown } {
    switch (this.filterState.sortBy) {
      case 'name':
        return { aValue: a.display_name, bValue: b.display_name };
      case 'type':
        return { aValue: a.type, bValue: b.type };
      case 'chain_id':
        return { aValue: a.chain_id, bValue: b.chain_id };
      default:
        return { aValue: a.display_name, bValue: b.display_name };
    }
  }

  private getPoolSortValues(a: PoolInfo, b: PoolInfo): { aValue: unknown; bValue: unknown } {
    switch (this.filterState.sortBy) {
      case 'apr':
        return {
          aValue: parseFloat(a.apr?.replace('%', '') || '0'),
          bValue: parseFloat(b.apr?.replace('%', '') || '0')
        };
      case 'tvl':
        return {
          aValue: parseFloat(a.total_liquidity || '0'),
          bValue: parseFloat(b.total_liquidity || '0')
        };
      case 'volume':
        return {
          aValue: parseFloat(a.volume_24h || '0'),
          bValue: parseFloat(b.volume_24h || '0')
        };
      case 'fees':
        return {
          aValue: parseFloat(a.fees_24h || '0'),
          bValue: parseFloat(b.fees_24h || '0')
        };
      default:
        return { aValue: a.token_1, bValue: b.token_1 };
    }
  }

  private getItemValue(item: DataItem, field: string): string | number | null {
    const fields = field.split('.');
    let value: unknown = item;

    for (const f of fields) {
      if (value && typeof value === 'object' && f in value) {
        value = (value as Record<string, unknown>)[f];
      } else {
        return null;
      }
    }

    return value as string | number | null;
  }

  private updatePagination() {
    console.log('🔍 updatePagination - infiniteScroll:', this.infiniteScroll, 'displayedItemsCount:', this.displayedItemsCount, 'filteredData.length:', this.filteredData.length);
    if (this.infiniteScroll) {
      // In infinite scroll mode, manage displayed items count
      this.displayedItemsCount = Math.min(this.displayedItemsCount, this.filteredData.length, this.maxItems);
      this.hasMoreData = this.displayedItemsCount < this.filteredData.length && this.displayedItemsCount < this.maxItems;
      this.totalPages = 1; // Not used in infinite scroll
      this.currentPage = 1; // Not used in infinite scroll
      console.log('🚀 Infinite scroll state - displayedItemsCount:', this.displayedItemsCount, 'hasMoreData:', this.hasMoreData);
    } else {
      // Standard pagination logic
      if (this.itemsPerPage > 0) {
        this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }
      } else {
        this.totalPages = 1;
        this.currentPage = 1;
      }
    }
  }

  private getPaginatedData(): DataItem[] {
    if (this.infiniteScroll) {
      // Return all displayed items for infinite scroll
      const result = this.filteredData.slice(0, this.displayedItemsCount);
      console.log('🔍 getPaginatedData (infinite scroll) - returning', result.length, 'items out of', this.filteredData.length);
      return result;
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

  // Event handlers
  private handleSearch = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filterState = {
      ...this.filterState,
      search: target.value || '',
    };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleSortChange = (event: Event) => {
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
    this.currentPage = 1;
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit({
        page,
        totalPages: this.totalPages,
        itemsPerPage: this.itemsPerPage,
      });
    }
  };

  private clearFilters = () => {
    const defaultSort = this.getDefaultSort();

    this.filterState = {
      search: '',
      sortBy: defaultSort.key,
      sortOrder: defaultSort.order,
    };
    this.currentPage = 1;
    this.applyFilters();
  };

  // Intersection Observer Methods
  private findScrollContainer(element: Element): Element | null {
    let current = element.parentElement;

    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);

      // Check for explicit scroll settings
      const hasScrollY = style.overflowY === 'auto' || style.overflowY === 'scroll';
      const hasScrollGeneral = style.overflow === 'auto' || style.overflow === 'scroll';

      // Check if element has scrollable content (height-wise)
      const hasScrollableContent = current.scrollHeight > current.clientHeight;

      // Special check for common scrollable containers
      const isScrollableContainer = hasScrollableContent && (
        hasScrollY ||
        hasScrollGeneral ||
        current.tagName === 'BODY' ||
        current.classList.contains('container') ||
        current.classList.contains('scroll') ||
        current.classList.contains('scrollable')
      );

      if (isScrollableContainer) {
        console.log('🔍 Found scroll container:', {
          element: current,
          tagName: current.tagName,
          className: current.className,
          overflowY: style.overflowY,
          overflow: style.overflow,
          scrollHeight: current.scrollHeight,
          clientHeight: current.clientHeight
        });
        return current;
      }

      current = current.parentElement;
    }

    // If we reach body or document, check if body is scrollable
    const body = document.body;
    if (body && body.scrollHeight > body.clientHeight) {
      console.log('🔍 Using body as scroll container');
      return body;
    }

    console.log('🔍 No scroll container found, using viewport');
    return null;
  }

  private setupIntersectionObservers() {
    // Determine scroll root based on useParentScroll setting
    let scrollRoot: Element | null = null;

    if (this.useParentScroll) {
      scrollRoot = this.findScrollContainer(this.el);
    } else {
      // Use component's own content element as scroll container
      scrollRoot = this.contentElement || null;
    }

    console.log('🚀 Setting up observers with scroll root:', scrollRoot?.tagName || 'viewport');

    // Component visibility observer for performance optimization
    this.componentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isComponentVisible = entry.isIntersecting;
          if (!entry.isIntersecting) {
            // Component is not visible, pause item observation
            this.pauseItemObserver();
          } else {
            // Component is visible, resume item observation
            this.resumeItemObserver();
          }
        });
      },
      {
        root: this.useParentScroll ? scrollRoot : null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe the component itself
    const hostElement = this.el;
    if (hostElement) {
      this.componentObserver.observe(hostElement);
    }

    // Item trigger observer for infinite scroll
    this.itemObserver = new IntersectionObserver(
      (entries) => {
        if (!this.isComponentVisible || this.isLoadingMore || !this.hasMoreData) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting && this.triggerElements.has(entry.target)) {
            console.log('🎯 Trigger element intersected, loading more...');
            this.handleLoadMore();
          }
        });
      },
      {
        root: scrollRoot,
        rootMargin: '20px',
        threshold: this.infiniteScrollThreshold
      }
    );
  }

  private cleanupIntersectionObservers() {
    if (this.componentObserver) {
      this.componentObserver.disconnect();
      this.componentObserver = undefined;
    }

    if (this.itemObserver) {
      this.itemObserver.disconnect();
      this.itemObserver = undefined;
    }

    this.triggerElements.clear();
  }

  private pauseItemObserver() {
    if (this.itemObserver) {
      this.triggerElements.forEach(element => {
        this.itemObserver?.unobserve(element);
      });
    }
  }

  private resumeItemObserver() {
    if (this.itemObserver && this.triggerElements.size > 0) {
      this.triggerElements.forEach(element => {
        this.itemObserver?.observe(element);
      });
    }
  }

  private updateTriggerElements() {
    if (!this.infiniteScroll || !this.itemObserver) return;

    // Clear existing observations
    this.triggerElements.forEach(element => {
      this.itemObserver?.unobserve(element);
    });
    this.triggerElements.clear();

    // Find new trigger elements (last N items)
    const contentElement = this.el?.shadowRoot?.querySelector('.data-content');
    if (!contentElement) return;

    const items = contentElement.querySelectorAll('.data-item');
    const triggerCount = Math.min(this.infiniteScrollTriggerItems, items.length);

    for (let i = items.length - triggerCount; i < items.length; i++) {
      if (i >= 0 && items[i]) {
        this.triggerElements.add(items[i]);
        this.itemObserver.observe(items[i]);
      }
    }
  }

  private handleLoadMore() {
    if (this.isLoadingMore || !this.hasMoreData) return;

    // Debounce multiple rapid calls
    if (this.loadMoreDebounceTimer) {
      clearTimeout(this.loadMoreDebounceTimer);
    }

    this.loadMoreDebounceTimer = setTimeout(() => {
      this.loadMore();
    }, 100);
  }

  private loadMore() {
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
        this.updateTriggerElements();
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

    return baseStats;
  }

  private renderPagination() {
    console.log('🔍 renderPagination - infiniteScroll:', this.infiniteScroll, 'totalPages:', this.totalPages);
    // Don't show pagination in infinite scroll mode
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
    console.log('🔍 Rendering EuclidDataList - infiniteScroll:', this.infiniteScroll, 'dataType:', this.dataType);
    const isLoading = (this.storeLoading || this.loading) && this.storeData.length === 0;
    const paginatedData = this.getPaginatedData();
    const ItemComponent = this.itemComponent;

    return (
      <div class="data-list">
        {/* Header */}
        {this.effectiveCardTitle && (
          <div class="data-header">
            <h3 class="data-title">{this.effectiveCardTitle}</h3>
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
            'data-content--parent-scroll': this.infiniteScroll && this.useParentScroll
          }}
          ref={(el) => this.contentElement = el}
        >
          {isLoading ? (
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>Loading {this.dataType}...</span>
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
