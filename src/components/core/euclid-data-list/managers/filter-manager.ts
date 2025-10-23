/**
 * FilterManager - Handles search, filtering, and sorting logic
 * Separation of concerns: Worker integration, filtering logic, async processing
 */

import { DataListWorkerManager } from '../../../../utils/worker-manager';
import type { DataItem, DataType, FilterState } from '../types';
import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../../utils/types/api.types';
import { logger } from '../../../../utils/logger';

export interface FilterConfig {
  enableWorker: boolean;
  workerThreshold: number;
  debounceTime: number;
}

export interface FilterCallbacks {
  onFilterComplete: (data: DataItem[], processingTime?: number) => void;
  onWorkerStateChange: (isProcessing: boolean) => void;
  onPerformanceMetric: (metric: { processingTime: number; operation: string; itemCount: number }) => void;
}

export class FilterManager {
  private config: FilterConfig;
  private callbacks: FilterCallbacks;
  private workerManager?: DataListWorkerManager;
  private dataType: DataType;

  constructor(
    dataType: DataType,
    config: FilterConfig,
    callbacks: FilterCallbacks
  ) {
    this.dataType = dataType;
    this.config = config;
    this.callbacks = callbacks;

    if (config.enableWorker) {
      this.initializeWorker();
    }
  }

  private initializeWorker() {
    this.workerManager = new DataListWorkerManager({
      batchSize: 50,
      debounceTime: this.config.debounceTime
    });
  }

  async processData(
    data: DataItem[],
    filterState: FilterState,
    walletAddress?: string
  ): Promise<void> {
    const startTime = performance.now();
    const shouldUseWorker = this.config.enableWorker &&
      this.workerManager?.isWorkerAvailable() &&
      data.length > this.config.workerThreshold;

    if (shouldUseWorker) {
      try {
        this.callbacks.onWorkerStateChange(true);
        const result = await this.workerManager!.processData(
          data,
          this.dataType,
          filterState,
          walletAddress
        );

        this.callbacks.onFilterComplete(result.filteredData, result.processingTime);
        this.callbacks.onPerformanceMetric({
          processingTime: result.processingTime,
          operation: 'filter_sort',
          itemCount: data.length
        });
      } catch (error) {
        logger.error('Utils', '❌ Worker processing failed, falling back to main thread:', error);
        const result = this.processDataSync(data, filterState, walletAddress);
        const processingTime = performance.now() - startTime;
        this.callbacks.onFilterComplete(result, processingTime);
      } finally {
        this.callbacks.onWorkerStateChange(false);
      }
    } else {
      const result = this.processDataSync(data, filterState, walletAddress);
      const processingTime = performance.now() - startTime;
      this.callbacks.onFilterComplete(result, processingTime);
    }
  }

  private processDataSync(data: DataItem[], filterState: FilterState, walletAddress?: string): DataItem[] {
    let filtered = [...data];

    // Apply search filter
    if (filterState.search) {
      const searchLower = filterState.search.toLowerCase();
      filtered = filtered.filter(item => this.searchInItem(item, searchLower));
    }

    // Apply type-specific filters
    filtered = this.applyTypeSpecificFilters(filtered, filterState, walletAddress);

    // Apply sorting
    if (filterState.sortBy) {
      filtered = this.applySorting(filtered, filterState);
    }

    return filtered;
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

  private applyTypeSpecificFilters(items: DataItem[], filterState: FilterState, walletAddress?: string): DataItem[] {
    switch (this.dataType) {
      case 'tokens':
        return this.applyTokenFilters(items as TokenMetadata[], filterState) as DataItem[];
      case 'chains':
        return this.applyChainFilters(items as EuclidChainConfig[], filterState) as DataItem[];
      case 'pools':
        return this.applyPoolFilters(items as PoolInfo[], filterState, walletAddress) as DataItem[];
      default:
        return items;
    }
  }

  private applyTokenFilters(tokens: TokenMetadata[], filterState: FilterState): TokenMetadata[] {
    let filtered = [...tokens];

    if (filterState.chainFilter) {
      filtered = filtered.filter(token =>
        token.chain_uids?.includes(filterState.chainFilter!)
      );
    }

    if (filterState.showFavorites) {
      // Implement favorites logic here
    }

    return filtered;
  }

  private applyChainFilters(chains: EuclidChainConfig[], filterState: FilterState): EuclidChainConfig[] {
    let filtered = [...chains];

    if (filterState.typeFilter) {
      filtered = filtered.filter(chain => chain.type === filterState.typeFilter);
    }

    return filtered;
  }

  private applyPoolFilters(pools: PoolInfo[], filterState: FilterState, walletAddress?: string): PoolInfo[] {
    const filtered = [...pools];

    if (filterState.showMyPools && walletAddress) {
      // This would need positions data - implement based on your needs
    }

    return filtered;
  }

  private applySorting(items: DataItem[], filterState: FilterState): DataItem[] {
    return [...items].sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (this.dataType) {
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
        return { aValue: 0, bValue: 0 };
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

  async searchDebounced(searchQuery: string): Promise<void> {
    if (this.config.enableWorker && this.workerManager?.isWorkerAvailable()) {
      try {
        this.callbacks.onWorkerStateChange(true);
        const result = await this.workerManager.searchDebounced(searchQuery, this.dataType);
        this.callbacks.onFilterComplete(result.filteredData, result.processingTime);
        this.callbacks.onPerformanceMetric({
          processingTime: result.processingTime,
          operation: 'search',
          itemCount: result.totalCount
        });
      } catch (error) {
        logger.error('Utils', '❌ Worker search failed:', error);
      } finally {
        this.callbacks.onWorkerStateChange(false);
      }
    }
  }

  destroy() {
    if (this.workerManager) {
      this.workerManager.destroy();
    }
  }
}
