import { Component, Prop, h, State, Event, EventEmitter, Listen, Element, Watch } from '@stencil/core';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';
import { marketStore } from '../../../store/market.store';

export interface PoolToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}

export interface PoolData {
  id: string;
  address: string;
  tokenA: PoolToken;
  tokenB: PoolToken;
  reserveA: string;
  reserveB: string;
  totalSupply: string;
  lpTokenSymbol: string;
  fee: number; // 0.3 = 0.3%
  apy: number;
  apr: number;
  tvl: number;
  volume24h: number;
  volumeWeek: number;
  fees24h: number;
  feesWeek: number;
  priceChange24h: number;
  totalRewards?: number;
  isStakable?: boolean;
  stakingApr?: number;
}

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
  sortBy: 'apy' | 'tvl' | 'volume' | 'fees' | 'myLiquidity';
  sortOrder: 'asc' | 'desc';
  showMyPools: boolean;
  showStakablePools: boolean;
  minTvl: number;
  maxTvl: number;
  tokenFilter: string;
}

@Component({
  tag: 'euclid-pools-list',
  styleUrl: 'euclid-pools-list.css',
  shadow: true,
})
export class EuclidPoolsList {
  @Element() element!: HTMLElement;

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

  // Internal state
  @State() filteredPools: PoolInfo[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;

  /**
   * User's positions in pools
   */
  @Prop() positions: UserPoolPosition[] = [];

  /**
   * Available tokens for filtering
   */
  @Prop() tokens: PoolToken[] = [];

  /**
   * Whether the component is in loading state (overrides store loading)
   */
  @Prop() loading: boolean = false;

  /**
   * Connected wallet address
   */
  @Prop() walletAddress: string = '';

  /**
   * Whether to show user positions
   */
  @Prop() showPositions: boolean = true;

  /**
   * Whether to show staking options
   */
  @Prop() showStaking: boolean = true;

  /**
   * Whether to show only verified pools (default: true)
   */
  @Prop() showVerifiedOnly: boolean = true;

  /**
   * Items per page for pagination
   */
  @Prop() itemsPerPage: number = 10;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Liquidity Pools';
  @State() filters: PoolFilters = {
    search: '',
    sortBy: 'apy',
    sortOrder: 'desc',
    showMyPools: false,
    showStakablePools: false,
    minTvl: 0,
    maxTvl: Infinity,
    tokenFilter: '',
  };
  @State() isFilterOpen: boolean = false;
  @State() selectedPool: PoolInfo | null = null;

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
  @Event() verifiedToggleChanged: EventEmitter<boolean>;

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

    // Initialize filters on component load to avoid re-render warnings
    this.applyFilters();
  }

  private syncWithStore() {
    // Use store data if available, fallback to props
    this.storePools = marketStore.state.pools.length > 0 ? marketStore.state.pools : this.pools;
    this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokenMetadata;
    this.storeLoading = marketStore.state.loading;
  }

  componentDidLoad() {
    // Component is ready, no state changes needed here
  }

  componentDidUpdate() {
    // Only apply filters when pools data changes, not when internal state changes
    // This prevents infinite loops from filteredPools state changes
  }

  @Watch('pools')
  watchPoolsChange() {
    // Only re-apply filters when pools prop actually changes
    this.applyFilters();
  }

  @Watch('positions')
  watchPositionsChange() {
    // Re-apply filters when user positions change
    this.applyFilters();
  }

  @Listen('resize', { target: 'window' })
  handleResize() {
    // Handle responsive changes if needed
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

    // Apply token filter
    if (this.filters.tokenFilter) {
      filtered = filtered.filter(pool =>
        pool.token_1 === this.filters.tokenFilter ||
        pool.token_2 === this.filters.tokenFilter
      );
    }

    // Apply TVL range filter
    if (this.filters.minTvl > 0) {
      filtered = filtered.filter(pool => parseFloat(pool.total_liquidity || '0') >= this.filters.minTvl);
    }
    if (this.filters.maxTvl < Infinity) {
      filtered = filtered.filter(pool => parseFloat(pool.total_liquidity || '0') <= this.filters.maxTvl);
    }

    // Apply my pools filter
    if (this.filters.showMyPools && this.walletAddress) {
      const myPoolIds = this.positions.map(pos => pos.poolId);
      filtered = filtered.filter(pool => myPoolIds.includes(pool.pool_id));
    }

    // Apply stakable pools filter - skip for now since API doesn't provide this info
    if (this.filters.showStakablePools) {
      // filtered = filtered.filter(pool => pool.isStakable);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (this.filters.sortBy) {
        case 'apy':
          aValue = parseFloat(a.apr || '0');
          bValue = parseFloat(b.apr || '0');
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
          aValue = parseFloat(a.apr || '0');
          bValue = parseFloat(b.apr || '0');
      }

      if (this.filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Only update state if the filtered results have actually changed
    // This prevents infinite loops
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

  private handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filters = { ...this.filters, search: target.value };
    this.currentPage = 1;
    this.applyFilters();
  };

  private handleSortChange = (sortBy: PoolFilters['sortBy']) => {
    if (this.filters.sortBy === sortBy) {
      // Toggle sort order if same column
      this.filters = {
        ...this.filters,
        sortOrder: this.filters.sortOrder === 'asc' ? 'desc' : 'asc',
      };
    } else {
      // Set new sort column with default desc order
      this.filters = {
        ...this.filters,
        sortBy,
        sortOrder: 'desc',
      };
    }
    this.applyFilters();
  };

  private handleFilterToggle = (filterKey: keyof PoolFilters, value?: unknown) => {
    if (typeof this.filters[filterKey] === 'boolean') {
      this.filters = {
        ...this.filters,
        [filterKey]: !this.filters[filterKey],
      };
    } else if (value !== undefined) {
      this.filters = {
        ...this.filters,
        [filterKey]: value,
      };
    }
    this.currentPage = 1;
    this.applyFilters();
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  private handlePoolSelect = (pool: PoolInfo) => {
    this.selectedPool = pool;
    this.poolSelected.emit(pool);
  };

  private handleAddLiquidity = (pool: PoolInfo) => {
    this.addLiquidity.emit(pool);
  };

  private handleRemoveLiquidity = (pool: PoolInfo) => {
    const position = this.positions.find(pos => pos.poolId === pool.pool_id);
    if (position) {
      this.removeLiquidity.emit({ pool, position });
    }
  };

  private handleStakeTokens = (pool: PoolInfo) => {
    const position = this.positions.find(pos => pos.poolId === pool.pool_id);
    this.stakeTokens.emit({ pool, position });
  };

  private handleClaimRewards = (pool: PoolInfo) => {
    const position = this.positions.find(pos => pos.poolId === pool.pool_id);
    if (position) {
      this.claimRewards.emit({ pool, position });
    }
  };

  private getUserPosition(poolId: string): UserPoolPosition | null {
    return this.positions.find(pos => pos.poolId === poolId) || null;
  }

  private getTokenMetadata(tokenId: string): TokenMetadata | null {
    // Use store data first, fallback to props for backward compatibility
    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
    return activeTokens.find(token => token.tokenId === tokenId) || null;
  }

  private formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(decimals)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(decimals)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
  }

  private getPaginatedPools(): PoolInfo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPools.slice(startIndex, endIndex);
  }

  render() {
    const paginatedPools = this.getPaginatedPools();

    return (
      <div class="pools-list">
        {/* Header */}
        <div class="pools-header">
          <h3 class="pools-title">{this.cardTitle}</h3>
          <button
            class="filter-toggle"
            onClick={() => this.isFilterOpen = !this.isFilterOpen}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,2H21V2H21V4H20.92L14,10.92V22.91L10,18.91V10.92L3.09,4H3V2Z"/>
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {this.isFilterOpen && (
          <div class="filters-panel">
            <div class="filters-row">
              <div class="filter-group">
                <label class="filter-label">Search Pools</label>
                <input
                  class="search-input"
                  type="text"
                  placeholder="Search by token symbol or name..."
                  value={this.filters.search}
                  onInput={this.handleSearchChange}
                />
              </div>

              <div class="filter-group">
                <label class="filter-label">Token</label>
                <select
                  class="filter-select"
                  onChange={(e) => this.handleFilterToggle('tokenFilter', (e.target as HTMLSelectElement).value)}
                >
                  <option value="" selected={this.filters.tokenFilter === ''}>All Tokens</option>
                  {(() => {
                    const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
                    return activeTokens.map(token => (
                      <option
                        key={token.tokenId}
                        value={token.tokenId}
                        selected={this.filters.tokenFilter === token.tokenId}
                      >
                        {token.displayName}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>

            <div class="filters-row">
              <div class="filter-toggles">
                <label class="toggle-label">
                  <input
                    type="checkbox"
                    checked={this.showVerifiedOnly}
                    onChange={() => {
                      this.showVerifiedOnly = !this.showVerifiedOnly;
                      this.verifiedToggleChanged.emit(this.showVerifiedOnly);
                    }}
                  />
                  <span>Verified Pools Only</span>
                </label>

                <label class="toggle-label">
                  <input
                    type="checkbox"
                    checked={this.filters.showMyPools}
                    onChange={() => this.handleFilterToggle('showMyPools')}
                  />
                  <span>My Pools Only</span>
                </label>

                <label class="toggle-label">
                  <input
                    type="checkbox"
                    checked={this.filters.showStakablePools}
                    onChange={() => this.handleFilterToggle('showStakablePools')}
                  />
                  <span>Stakable Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">Total Pools</span>
            <span class="stat-value">{(() => {
              const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
              return activePools.length;
            })()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Filtered</span>
            <span class="stat-value">{this.filteredPools.length}</span>
          </div>
          {this.walletAddress && (
            <div class="stat-item">
              <span class="stat-label">My Positions</span>
              <span class="stat-value">{this.positions.length}</span>
            </div>
          )}
          <div class="stat-item">
            <span class="stat-label">Total TVL</span>
            <span class="stat-value">${(() => {
              const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
              return this.formatNumber(activePools.reduce((sum, pool) => sum + parseFloat(pool.total_liquidity || '0'), 0));
            })()}</span>
          </div>
        </div>

        {/* Pools Table */}
        <div class="pools-table-container">
          <table class="pools-table">
            <thead>
              <tr>
                <th class="sortable" onClick={() => this.handleSortChange('apy')}>
                  <span>Pool</span>
                </th>
                <th class="sortable" onClick={() => this.handleSortChange('apy')}>
                  <span>APY</span>
                  {this.filters.sortBy === 'apy' && (
                    <svg class={{
                      'sort-arrow': true,
                      'sort-arrow--desc': this.filters.sortOrder === 'desc',
                    }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  )}
                </th>
                <th class="sortable" onClick={() => this.handleSortChange('tvl')}>
                  <span>TVL</span>
                  {this.filters.sortBy === 'tvl' && (
                    <svg class={{
                      'sort-arrow': true,
                      'sort-arrow--desc': this.filters.sortOrder === 'desc',
                    }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  )}
                </th>
                <th class="sortable" onClick={() => this.handleSortChange('volume')}>
                  <span>24h Volume</span>
                  {this.filters.sortBy === 'volume' && (
                    <svg class={{
                      'sort-arrow': true,
                      'sort-arrow--desc': this.filters.sortOrder === 'desc',
                    }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  )}
                </th>
                <th class="sortable" onClick={() => this.handleSortChange('fees')}>
                  <span>24h Fees</span>
                  {this.filters.sortBy === 'fees' && (
                    <svg class={{
                      'sort-arrow': true,
                      'sort-arrow--desc': this.filters.sortOrder === 'desc',
                    }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  )}
                </th>
                {this.walletAddress && (
                  <th class="sortable" onClick={() => this.handleSortChange('myLiquidity')}>
                    <span>My Liquidity</span>
                    {this.filters.sortBy === 'myLiquidity' && (
                      <svg class={{
                        'sort-arrow': true,
                        'sort-arrow--desc': this.filters.sortOrder === 'desc',
                      }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    )}
                  </th>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const isLoading = this.storeLoading || this.loading;
                return isLoading ? (
                <tr>
                  <td colSpan={this.walletAddress ? 7 : 6} class="loading-cell">
                    <div class="loading-spinner"></div>
                    <span>Loading pools...</span>
                  </td>
                </tr>
              ) : paginatedPools.length === 0 ? (
                <tr>
                  <td colSpan={this.walletAddress ? 7 : 6} class="empty-cell">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
                      </svg>
                      <span>No pools found matching your criteria</span>
                      <button
                        class="clear-filters-btn"
                        onClick={() => {
                          this.filters = {
                            search: '',
                            sortBy: 'apy',
                            sortOrder: 'desc',
                            showMyPools: false,
                            showStakablePools: false,
                            minTvl: 0,
                            maxTvl: Infinity,
                            tokenFilter: '',
                          };
                          this.applyFilters();
                        }}
                        type="button"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPools.map(pool => {
                  const position = this.getUserPosition(pool.pool_id);
                  return (
                    <tr key={pool.pool_id} class="pool-row">
                      <td class="pool-cell">
                        <div class="pool-info">
                          <div class="token-pair">
                            <div class="token-logos">
                              {(() => {
                                const token1Meta = this.getTokenMetadata(pool.token_1);
                                const token2Meta = this.getTokenMetadata(pool.token_2);
                                return (
                                  <div class="logo-pair">
                                    <img
                                      src={token1Meta?.image || '/assets/default-token.svg'}
                                      alt={token1Meta?.displayName || pool.token_1}
                                      class="token-logo token-logo-1"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/default-token.svg';
                                      }}
                                    />
                                    <img
                                      src={token2Meta?.image || '/assets/default-token.svg'}
                                      alt={token2Meta?.displayName || pool.token_2}
                                      class="token-logo token-logo-2"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/default-token.svg';
                                      }}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          <div class="pool-details">
                            <div class="pool-name">
                              {(() => {
                                const token1Meta = this.getTokenMetadata(pool.token_1);
                                const token2Meta = this.getTokenMetadata(pool.token_2);
                                const token1Name = token1Meta?.displayName || pool.token_1.toUpperCase();
                                const token2Name = token2Meta?.displayName || pool.token_2.toUpperCase();
                                return `${token1Name}/${token2Name}`;
                              })()}
                            </div>
                            <div class="pool-fee">0.3% Fee</div>
                          </div>
                        </div>
                      </td>

                      <td class="apy-cell">
                        <div class="apy-info">
                          <div class="apy-main">{parseFloat(pool.apr || '0').toFixed(2)}%</div>
                        </div>
                      </td>

                      <td class="tvl-cell">
                        <div class="metric-value">${this.formatNumber(parseFloat(pool.total_liquidity || '0'))}</div>
                        <div class="metric-change">+0.00%</div>
                      </td>

                      <td class="volume-cell">
                        <div class="metric-value">${this.formatNumber(parseFloat(pool.volume_24h || '0'))}</div>
                      </td>

                      <td class="fees-cell">
                        <div class="metric-value">${this.formatNumber(parseFloat(pool.fees_24h || '0'))}</div>
                      </td>

                      {this.walletAddress && (
                        <td class="position-cell">
                          {position ? (
                            <div class="position-info">
                              <div class="position-value">${this.formatNumber(position.value)}</div>
                              <div class="position-share">{position.shareOfPool.toFixed(4)}%</div>
                              {position.unclaimedRewards && position.unclaimedRewards > 0 && (
                                <div class="unclaimed-rewards">
                                  ${this.formatNumber(position.unclaimedRewards)} rewards
                                </div>
                              )}
                            </div>
                          ) : (
                            <span class="no-position">—</span>
                          )}
                        </td>
                      )}

                      <td class="actions-cell">
                        <div class="pool-actions">
                          <euclid-button
                            variant="primary"
                            size="sm"
                            onClick={() => this.handleAddLiquidity(pool)}
                          >
                            Add
                          </euclid-button>

                          {position && (
                            <euclid-button
                              variant="secondary"
                              size="sm"
                              onClick={() => this.handleRemoveLiquidity(pool)}
                            >
                              Remove
                            </euclid-button>
                          )}

                          {/* Stakable property not available in PoolInfo API, commenting out */}
                          {/* {pool.isStakable && position && (
                            <euclid-button
                              variant="primary"
                              size="sm"
                              onClick={() => this.handleStakeTokens(pool)}
                            >
                              Stake
                            </euclid-button>
                          )} */}

                          {position && position.unclaimedRewards && position.unclaimedRewards > 0 && (
                            <euclid-button
                              variant="ghost"
                              size="sm"
                              onClick={() => this.handleClaimRewards(pool)}
                            >
                              Claim
                            </euclid-button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              );
              })()}
            </tbody>
          </table>
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
