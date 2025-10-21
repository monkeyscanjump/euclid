import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';

// User pool position interface (to avoid any types)
export interface UserPoolPosition {
  poolId: string;
  poolAddress: string;
  lpTokenBalance: string;
  shareOfPool: number;
  tokenAAmount: string;
  tokenBAmount: string;
  value: number;
  unclaimedRewards?: number;
  stakingRewards?: number;
}

// Supported data types
export type DataType = 'tokens' | 'chains' | 'pools';

// Base data item - union of all possible data types
export type DataItem = TokenMetadata | EuclidChainConfig | PoolInfo;

// Display modes for items
export type DataDisplayMode = 'card' | 'list-item' | 'compact' | 'grid';

// Filter configuration interface
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'boolean' | 'range';
  options?: Array<{ value: string; label: string; count?: number }>;
  placeholder?: string;
  filterFn: (item: DataItem, value: string | boolean | number | null) => boolean;
  optionsProvider?: (items: DataItem[]) => Array<{ value: string; label: string; count?: number }>;
}

// Sort configuration interface
export interface SortOption {
  key: string;
  label: string;
  sortFn: (a: DataItem, b: DataItem) => number;
}

// Statistics configuration interface
export interface StatConfig {
  key: string;
  label: string;
  calculateFn: (items: DataItem[], filteredItems?: DataItem[]) => string | number;
  formatFn?: (value: string | number) => string;
}

// Search configuration interface
export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  searchFields: string[]; // Fields to search within each item
  searchFn?: (item: DataItem, query: string) => boolean; // Custom search function
}

// Pagination configuration interface
export interface PaginationConfig {
  enabled: boolean;
  itemsPerPage: number;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

// Main data list configuration interface
export interface DataListConfig<T extends DataItem = DataItem> {
  // Core configuration
  dataType: DataType;
  itemComponent: string; // Tag name of the component to render each item

  // Display options
  displayMode: DataDisplayMode;
  cardTitle?: string;
  emptyStateMessage?: string;
  loadingMessage?: string;

  // Item component props
  itemComponentProps?: Record<string, string | number | boolean | null>; // Additional props to pass to item components
  showFields?: string[]; // Fields to show in item components

  // Feature configurations
  search: SearchConfig;
  filters: FilterConfig[];
  sorting: {
    enabled: boolean;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    options: SortOption[];
  };
  pagination: PaginationConfig;
  statistics: {
    enabled: boolean;
    configs: StatConfig[];
  };

  // Store configuration
  storeKey: 'tokens' | 'pools' | 'chains'; // Key in marketStore.state
  fallbackData?: T[];

  // Event configuration
  events: {
    itemSelect?: boolean;
    itemHover?: boolean;
    customEvents?: string[]; // Additional events to emit from item components
  };
}

// Filter state interface
export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  customFilters: Record<string, string | boolean | number | null>;
}

// Component state interfaces
export interface DataListState {
  filteredData: DataItem[];
  currentPage: number;
  totalPages: number;
  selectedItemId: string;
  filterState: FilterState;

  // Store sync state
  storeData: DataItem[];
  storeLoading: boolean;
  storeError: string | null;
}

// Event payloads
export interface ItemSelectEvent<T extends DataItem = DataItem> {
  item: T;
  id: string;
}

export interface FiltersChangedEvent {
  filters: FilterState;
  resultCount: number;
}

export interface PageChangedEvent {
  page: number;
  totalPages: number;
  itemsPerPage: number;
}

// Configuration factory types
export interface TokenListConfig extends Omit<DataListConfig<TokenMetadata>, 'dataType' | 'storeKey' | 'itemComponent'> {
  showFavorites?: boolean;
  chainFilter?: boolean;
}

export interface ChainListConfig extends Omit<DataListConfig<EuclidChainConfig>, 'dataType' | 'storeKey' | 'itemComponent'> {
  typeFilter?: boolean;
  showFactoryAddress?: boolean;
}

export interface PoolListConfig extends Omit<DataListConfig<PoolInfo>, 'dataType' | 'storeKey' | 'itemComponent'> {
  showUserPositions?: boolean;
  userPositions?: UserPoolPosition[];
  walletAddress?: string;
}
