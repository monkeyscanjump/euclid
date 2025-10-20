import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';
import { marketStore } from '../../../store/market.store';

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

export interface PoolFilters {
  search: string;
  sortBy: 'apr' | 'tvl' | 'volume' | 'fees' | 'myLiquidity';
  sortOrder: 'asc' | 'desc';
  showMyPools: boolean;
}

@Component({
  tag: 'euclid-pools-list',
  styleUrl: 'euclid-pools-list.css',
  shadow: true,
})
export class EuclidPoolsList {
  /**
   * Available pools data (gets from market store automatically)
   * @deprecated Use store instead
   */
  @Prop() pools: PoolInfo[] = [];

  /**
   * Token metadata for logos and display names (gets from market store automatically)
   * @deprecated Use store instead
   */
  @Prop() tokenMetadata: TokenMetadata[] = [];

  /**
   * User's positions in pools
   */
  @Prop() positions: UserPoolPosition[] = [];

  /**
   * Whether the component is in loading state (overrides store loading)
   */
  @Prop() loading: boolean = false;

  /**
   * Connected wallet address
   */
  @Prop() walletAddress: string = '';



  /**
   * Items per page for pagination
   */
  @Prop() itemsPerPage: number = 10;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Liquidity Pools';

  // Internal state
  @State() filteredPools: PoolInfo[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
  @State() filters: PoolFilters = {
    search: '',
    sortBy: 'apr',
    sortOrder: 'desc',
    showMyPools: false,
  };

  // Store data (automatically synced)
  @State() storePools: PoolInfo[] = [];
  @State() storeTokens: TokenMetadata[] = [];
  @State() storeLoading: boolean = false;

  // Events
  @Event() poolSelected: EventEmitter<PoolInfo>;
  @Event() addLiquidity: EventEmitter<PoolInfo>;
  @Event() removeLiquidity: EventEmitter<{ pool: PoolInfo; position: UserPoolPosition }>;
  @Event() stakeTokens: EventEmitter<{ pool: PoolInfo; position?: UserPoolPosition }>;
  @Event() claimRewards: EventEmitter<{ pool: PoolInfo; position: UserPoolPosition }>;
  @Event() filtersChanged: EventEmitter<PoolFilters>;

  componentWillLoad() {
    // Connect to market store for automatic data updates
    this.syncWithStore();

    // Listen for store changes
    marketStore.onChange('pools', () => {
      this.syncWithStore();
      this.applyFilters();
    });

    marketStore.onChange('tokens', () => {
      this.syncWithStore();
    });

    // Initialize filters
    this.applyFilters();
  }

  private syncWithStore() {
    // Use store data if available, fallback to props
    this.storePools = marketStore.state.pools.length > 0 ? marketStore.state.pools : this.pools;
    this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokenMetadata;
    this.storeLoading = marketStore.state.loading;

    // Debug logging
    console.log('🔄 Store sync:', {
      storePools: this.storePools.length,
      storeTokens: this.storeTokens.length,
      storeLoading: this.storeLoading,
      marketStorePools: marketStore.state.pools.length,
      marketStoreTokens: marketStore.state.tokens.length,
      marketStoreLoading: marketStore.state.loading
    });
  }

  @Watch('pools')
  watchPoolsChange() {
    this.applyFilters();
  }

  @Watch('positions')
  watchPositionsChange() {
    this.applyFilters();
  }

  private applyFilters() {
    // Use store data first, fallback to props for backward compatibility
    const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
    let filtered = [...activePools];

    // Apply search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(pool => {
        const token1Meta = this.getTokenMetadata(pool.token_1);
        const token2Meta = this.getTokenMetadata(pool.token_2);
        const token1Name = token1Meta?.displayName || pool.token_1;
        const token2Name = token2Meta?.displayName || pool.token_2;

        return pool.token_1.toLowerCase().includes(searchLower) ||
          pool.token_2.toLowerCase().includes(searchLower) ||
          token1Name.toLowerCase().includes(searchLower) ||
          token2Name.toLowerCase().includes(searchLower) ||
          pool.pool_id.toLowerCase().includes(searchLower);
      });
    }

    // Apply my pools filter
    if (this.filters.showMyPools && this.walletAddress) {
      const myPoolIds = this.positions.map(pos => pos.poolId);
      filtered = filtered.filter(pool => myPoolIds.includes(pool.pool_id));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (this.filters.sortBy) {
        case 'apr':
          aValue = parseFloat((a.apr || '0%').replace('%', ''));
          bValue = parseFloat((b.apr || '0%').replace('%', ''));
          break;
        case 'tvl':
          aValue = parseFloat(a.total_liquidity || '0');
          bValue = parseFloat(b.total_liquidity || '0');
          break;
        case 'volume':
          aValue = parseFloat(a.volume_24h || '0');
          bValue = parseFloat(b.volume_24h || '0');
          break;
        case 'fees':
          aValue = parseFloat(a.fees_24h || '0');
          bValue = parseFloat(b.fees_24h || '0');
          break;
        case 'myLiquidity': {
          const aPosition = this.positions.find(pos => pos.poolId === a.pool_id);
          const bPosition = this.positions.find(pos => pos.poolId === b.pool_id);
          aValue = aPosition ? aPosition.value : 0;
          bValue = bPosition ? bPosition.value : 0;
          break;
        }
        default:
          aValue = parseFloat((a.apr || '0%').replace('%', ''));
          bValue = parseFloat((b.apr || '0%').replace('%', ''));
      }

      if (this.filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Update state only if changed
    const newFilteredLength = filtered.length;
    const currentFilteredLength = this.filteredPools.length;
    const hasChanged = newFilteredLength !== currentFilteredLength ||
      !filtered.every((pool, index) => this.filteredPools[index]?.pool_id === pool.pool_id);

    if (hasChanged) {
      this.filteredPools = filtered;
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

  private getTokenMetadata(tokenId: string): TokenMetadata | null {
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
    return activeTokens.find(token => token.tokenId === tokenId) || null;
  }

  private getUserPosition(poolId: string): UserPoolPosition | null {
    return this.positions.find(pos => pos.poolId === poolId) || null;
  }

  private getTokensWithPools(): { tokenId: string; displayName: string }[] {
    const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;

    // Get unique token IDs that appear in pools
    const tokenIdsInPools = new Set<string>();
    activePools.forEach(pool => {
      tokenIdsInPools.add(pool.token_1);
      tokenIdsInPools.add(pool.token_2);
    });

    // Return only tokens that have pools, with their metadata
    return Array.from(tokenIdsInPools)
      .map(tokenId => {
        const tokenMeta = activeTokens.find(t => t.tokenId === tokenId);
        return {
          tokenId,
          displayName: tokenMeta?.displayName || tokenId.toUpperCase()
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  private getPaginatedPools(): PoolInfo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPools.slice(startIndex, endIndex);
  }

  private handleFiltersChanged = (event: CustomEvent<PoolFilters>) => {
    this.filters = event.detail;
    this.currentPage = 1;
    this.applyFilters();
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  render() {
    const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
    const isLoading = (this.storeLoading || this.loading) && activePools.length === 0;
    const paginatedPools = this.getPaginatedPools();
    const totalTvl = activePools.reduce((sum, pool) => sum + parseFloat(pool.total_liquidity || '0'), 0);

    // Debug logging
    console.log('🎨 Render state:', {
      activePools: activePools.length,
      activeTokens: activeTokens.length,
      filteredPools: this.filteredPools.length,
      paginatedPools: paginatedPools.length,
      isLoading,
      storeLoading: this.storeLoading,
      loading: this.loading
    });

    return (
      <div class="pools-list">
        {/* Header */}
        <div class="pools-header">
          <h3 class="pools-title">{this.cardTitle}</h3>
        </div>

        {/* Filters */}
        <pools-filters
          filters={this.filters}
          walletAddress={this.walletAddress}
          onFiltersChanged={this.handleFiltersChanged}
        />

        {/* Stats */}
        <pools-stats
          totalPools={activePools.length}
          filteredPools={this.filteredPools.length}
          totalTvl={totalTvl}
          userPositions={this.positions.length}
          walletAddress={this.walletAddress}
        />

        {/* Content */}
        <div class="pools-content">
          {isLoading ? (
            <pools-loading count={6} />
          ) : paginatedPools.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
              </svg>
              <span>No pools found matching your criteria</span>
              <button
                class="clear-filters-btn"
                onClick={() => {
                  this.filters = {
                    search: '',
                    sortBy: 'apr',
                    sortOrder: 'desc',
                    showMyPools: false,
                  };
                  this.currentPage = 1;
                  this.applyFilters();
                }}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div class="pools-grid">
              {paginatedPools.map(pool => (
                <pool-item
                  key={pool.pool_id}
                  pool={pool}
                  tokens={activeTokens}
                  position={this.getUserPosition(pool.pool_id)}
                  walletAddress={this.walletAddress}
                  onAddLiquidity={(event) => this.addLiquidity.emit(event.detail)}
                  onRemoveLiquidity={(event) => this.removeLiquidity.emit(event.detail)}
                  onStakeTokens={(event) => this.stakeTokens.emit(event.detail)}
                  onClaimRewards={(event) => this.claimRewards.emit(event.detail)}
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
