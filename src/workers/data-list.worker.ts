/**
 * Web Worker for data list processing
 * Handles filtering, sorting, and batch processing off the main thread
 */

import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../utils/types/api.types';

export type DataType = 'tokens' | 'chains' | 'pools';
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

export interface WorkerMessage {
  id: string;
  type: 'PROCESS_DATA' | 'GET_BATCH' | 'SEARCH' | 'SORT';
  payload: {
    data?: DataItem[];
    dataType?: DataType;
    filterState?: FilterState;
    batchSize?: number;
    startIndex?: number;
    walletAddress?: string;
  };
}

export interface WorkerResponse {
  id: string;
  type: 'PROCESSED_DATA' | 'BATCH_DATA' | 'SEARCH_RESULTS' | 'SORT_RESULTS' | 'ERROR';
  payload: {
    filteredData?: DataItem[];
    batchData?: DataItem[];
    totalCount?: number;
    hasMore?: boolean;
    error?: string;
    processingTime?: number;
  };
}

class DataListWorker {
  private processedData: DataItem[] = [];
  private originalData: DataItem[] = [];
  private currentDataType: DataType = 'tokens';
  private currentFilters: FilterState = {
    search: '',
    sortBy: '',
    sortOrder: 'asc'
  };

  constructor() {
    self.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent<WorkerMessage>) {
    const { id, type, payload } = event.data;
    const startTime = performance.now();

    try {
      switch (type) {
        case 'PROCESS_DATA':
          this.processData(id, payload, startTime);
          break;
        case 'GET_BATCH':
          this.getBatch(id, payload, startTime);
          break;
        case 'SEARCH':
          this.performSearch(id, payload, startTime);
          break;
        case 'SORT':
          this.performSort(id, payload, startTime);
          break;
        default:
          this.sendError(id, `Unknown message type: ${type}`);
      }
    } catch (error) {
      this.sendError(id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private processData(id: string, payload: WorkerMessage['payload'], startTime: number) {
    const { data, dataType, filterState } = payload;

    if (!data || !dataType || !filterState) {
      this.sendError(id, 'Missing required data for processing');
      return;
    }

    this.originalData = data;
    this.currentDataType = dataType;
    this.currentFilters = filterState;

    // Apply all filters and sorting
    let filtered = [...this.originalData];

    // Apply search filter
    if (filterState.search) {
      filtered = this.applySearch(filtered, filterState.search);
    }

    // Apply type-specific filters
    filtered = this.applyTypeSpecificFilters(filtered, filterState);

    // Apply sorting
    if (filterState.sortBy) {
      filtered = this.applySorting(filtered, filterState);
    }

    this.processedData = filtered;

    const processingTime = performance.now() - startTime;

    this.sendResponse(id, 'PROCESSED_DATA', {
      filteredData: filtered,
      totalCount: filtered.length,
      processingTime
    });
  }

  private getBatch(id: string, payload: WorkerMessage['payload'], startTime: number) {
    const { batchSize = 20, startIndex = 0 } = payload;

    const batchData = this.processedData.slice(startIndex, startIndex + batchSize);
    const hasMore = startIndex + batchSize < this.processedData.length;

    const processingTime = performance.now() - startTime;

    this.sendResponse(id, 'BATCH_DATA', {
      batchData,
      totalCount: this.processedData.length,
      hasMore,
      processingTime
    });
  }

  private performSearch(id: string, payload: WorkerMessage['payload'], startTime: number) {
    const { filterState } = payload;

    if (!filterState?.search) {
      this.sendError(id, 'Search query is required');
      return;
    }

    const searchResults = this.applySearch([...this.originalData], filterState.search);

    const processingTime = performance.now() - startTime;

    this.sendResponse(id, 'SEARCH_RESULTS', {
      filteredData: searchResults,
      totalCount: searchResults.length,
      processingTime
    });
  }

  private performSort(id: string, payload: WorkerMessage['payload'], startTime: number) {
    const { filterState } = payload;

    if (!filterState?.sortBy) {
      this.sendError(id, 'Sort field is required');
      return;
    }

    const sortedData = this.applySorting([...this.processedData], filterState);

    const processingTime = performance.now() - startTime;

    this.sendResponse(id, 'SORT_RESULTS', {
      filteredData: sortedData,
      totalCount: sortedData.length,
      processingTime
    });
  }

  private applySearch(data: DataItem[], searchQuery: string): DataItem[] {
    const searchLower = searchQuery.toLowerCase();
    const searchFields = this.getSearchFields();

    return data.filter(item => {
      return searchFields.some(field => {
        const value = this.getItemValue(item, field);
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    });
  }

  private getSearchFields(): string[] {
    switch (this.currentDataType) {
      case 'tokens': return ['displayName', 'tokenId', 'name'];
      case 'chains': return ['display_name', 'chain_id', 'chain_uid'];
      case 'pools': return ['token_1', 'token_2', 'pool_id'];
      default: return ['name'];
    }
  }

  private applyTypeSpecificFilters(items: DataItem[], filterState: FilterState): DataItem[] {
    switch (this.currentDataType) {
      case 'tokens':
        return this.applyTokenFilters(items as TokenMetadata[], filterState);
      case 'chains':
        return this.applyChainFilters(items as EuclidChainConfig[], filterState);
      case 'pools':
        return this.applyPoolFilters(items as PoolInfo[], filterState);
      default:
        return items;
    }
  }

  private applyTokenFilters(tokens: TokenMetadata[], filterState: FilterState): TokenMetadata[] {
    let filtered = [...tokens];

    // Chain filter
    if (filterState.chainFilter) {
      filtered = filtered.filter(token =>
        token.chain_uids?.includes(filterState.chainFilter!)
      );
    }

    // Favorites filter
    if (filterState.showFavorites) {
      // Could implement favorites logic here if favorites data is passed
    }

    return filtered;
  }

  private applyChainFilters(chains: EuclidChainConfig[], filterState: FilterState): EuclidChainConfig[] {
    let filtered = [...chains];

    // Type filter
    if (filterState.typeFilter) {
      filtered = filtered.filter(chain => chain.type === filterState.typeFilter);
    }

    return filtered;
  }

  private applyPoolFilters(pools: PoolInfo[], filterState: FilterState): PoolInfo[] {
    const filtered = [...pools];

    // My pools filter (would need positions data)
    if (filterState.showMyPools) {
      // Implement based on wallet positions
    }

    return filtered;
  }

  private applySorting(items: DataItem[], filterState: FilterState): DataItem[] {
    return [...items].sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (this.currentDataType) {
        case 'tokens':
          ({ aValue, bValue } = this.getTokenSortValues(a as TokenMetadata, b as TokenMetadata, filterState.sortBy));
          break;
        case 'chains':
          ({ aValue, bValue } = this.getChainSortValues(a as EuclidChainConfig, b as EuclidChainConfig, filterState.sortBy));
          break;
        case 'pools':
          ({ aValue, bValue } = this.getPoolSortValues(a as PoolInfo, b as PoolInfo, filterState.sortBy));
          break;
        default:
          aValue = bValue = 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return filterState.sortOrder === 'asc' ? result : -result;
      }

      const result = (aValue as number || 0) - (bValue as number || 0);
      return filterState.sortOrder === 'asc' ? result : -result;
    });
  }

  private getTokenSortValues(a: TokenMetadata, b: TokenMetadata, sortBy: string): { aValue: unknown; bValue: unknown } {
    switch (sortBy) {
      case 'name':
        return { aValue: a.displayName, bValue: b.displayName };
      case 'price':
        return { aValue: parseFloat(a.price || '0'), bValue: parseFloat(b.price || '0') };
      case 'volume':
        return { aValue: a.total_volume_24h || 0, bValue: b.total_volume_24h || 0 };
      case 'marketCap':
        return { aValue: 0, bValue: 0 }; // Market cap not available
      default:
        return { aValue: a.displayName, bValue: b.displayName };
    }
  }

  private getChainSortValues(a: EuclidChainConfig, b: EuclidChainConfig, sortBy: string): { aValue: unknown; bValue: unknown } {
    switch (sortBy) {
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

  private getPoolSortValues(a: PoolInfo, b: PoolInfo, sortBy: string): { aValue: unknown; bValue: unknown } {
    switch (sortBy) {
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

  private sendResponse(id: string, type: WorkerResponse['type'], payload: WorkerResponse['payload']) {
    const response: WorkerResponse = { id, type, payload };
    self.postMessage(response);
  }

  private sendError(id: string, error: string) {
    const response: WorkerResponse = {
      id,
      type: 'ERROR',
      payload: { error }
    };
    self.postMessage(response);
  }
}

// Initialize the worker
new DataListWorker();
