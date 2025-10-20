import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';

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
   * Available pools data
   */
  @Prop() pools: PoolData[] = [];

  /**
   * User's positions in pools
   */
  @Prop() positions: UserPoolPosition[] = [];

  /**
   * Available tokens for filtering
   */
  @Prop() tokens: PoolToken[] = [];

  /**
   * Whether the component is in loading state
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
   * Items per page for pagination
   */
  @Prop() itemsPerPage: number = 10;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Liquidity Pools';

  // Internal state
  @State() filteredPools: PoolData[] = [];
  @State() currentPage: number = 1;
  @State() totalPages: number = 1;
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
  @State() selectedPool: PoolData | null = null;

  // Events
  @Event() poolSelected: EventEmitter<PoolData>;
  @Event() addLiquidity: EventEmitter<PoolData>;
  @Event() removeLiquidity: EventEmitter<{ pool: PoolData; position: UserPoolPosition }>;
  @Event() stakeTokens: EventEmitter<{ pool: PoolData; position?: UserPoolPosition }>;
  @Event() claimRewards: EventEmitter<{ pool: PoolData; position: UserPoolPosition }>;
  @Event() filtersChanged: EventEmitter<PoolFilters>;

  componentDidLoad() {
    this.applyFilters();
  }

  componentDidUpdate() {
    this.applyFilters();
  }

  @Listen('resize', { target: 'window' })
  handleResize() {
    // Handle responsive changes if needed
  }

  private applyFilters() {
    let filtered = [...this.pools];

    // Apply search filter
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      filtered = filtered.filter(pool =>
        pool.tokenA.symbol.toLowerCase().includes(searchLower) ||
        pool.tokenB.symbol.toLowerCase().includes(searchLower) ||
        pool.tokenA.name.toLowerCase().includes(searchLower) ||
        pool.tokenB.name.toLowerCase().includes(searchLower) ||
        pool.lpTokenSymbol.toLowerCase().includes(searchLower)
      );
    }

    // Apply token filter
    if (this.filters.tokenFilter) {
      filtered = filtered.filter(pool =>
        pool.tokenA.symbol === this.filters.tokenFilter ||
        pool.tokenB.symbol === this.filters.tokenFilter
      );
    }

    // Apply TVL range filter
    if (this.filters.minTvl > 0) {
      filtered = filtered.filter(pool => pool.tvl >= this.filters.minTvl);
    }
    if (this.filters.maxTvl < Infinity) {
      filtered = filtered.filter(pool => pool.tvl <= this.filters.maxTvl);
    }

    // Apply my pools filter
    if (this.filters.showMyPools && this.walletAddress) {
      const myPoolIds = this.positions.map(pos => pos.poolId);
      filtered = filtered.filter(pool => myPoolIds.includes(pool.id));
    }

    // Apply stakable pools filter
    if (this.filters.showStakablePools) {
      filtered = filtered.filter(pool => pool.isStakable);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (this.filters.sortBy) {
        case 'apy':
          aValue = a.apy;
          bValue = b.apy;
          break;
        case 'tvl':
          aValue = a.tvl;
          bValue = b.tvl;
          break;
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'fees':
          aValue = a.fees24h;
          bValue = b.fees24h;
          break;
        case 'myLiquidity': {
          const aPosition = this.positions.find(pos => pos.poolId === a.id);
          const bPosition = this.positions.find(pos => pos.poolId === b.id);
          aValue = aPosition ? aPosition.value : 0;
          bValue = bPosition ? bPosition.value : 0;
          break;
        }
        default:
          aValue = a.apy;
          bValue = b.apy;
      }

      if (this.filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    this.filteredPools = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Reset to first page if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.filtersChanged.emit(this.filters);
  }

  private handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filters = { ...this.filters, search: target.value };
    this.currentPage = 1;
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
  };

  private handlePageChange = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  };

  private handlePoolSelect = (pool: PoolData) => {
    this.selectedPool = pool;
    this.poolSelected.emit(pool);
  };

  private handleAddLiquidity = (pool: PoolData) => {
    this.addLiquidity.emit(pool);
  };

  private handleRemoveLiquidity = (pool: PoolData) => {
    const position = this.positions.find(pos => pos.poolId === pool.id);
    if (position) {
      this.removeLiquidity.emit({ pool, position });
    }
  };

  private handleStakeTokens = (pool: PoolData) => {
    const position = this.positions.find(pos => pos.poolId === pool.id);
    this.stakeTokens.emit({ pool, position });
  };

  private handleClaimRewards = (pool: PoolData) => {
    const position = this.positions.find(pos => pos.poolId === pool.id);
    if (position) {
      this.claimRewards.emit({ pool, position });
    }
  };

  private getUserPosition(poolId: string): UserPoolPosition | null {
    return this.positions.find(pos => pos.poolId === poolId) || null;
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

  private getPaginatedPools(): PoolData[] {
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
                  {this.tokens.map(token => (
                    <option
                      key={token.symbol}
                      value={token.symbol}
                      selected={this.filters.tokenFilter === token.symbol}
                    >
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div class="filters-row">
              <div class="filter-toggles">
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
            <span class="stat-value">{this.pools.length}</span>
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
            <span class="stat-value">${this.formatNumber(this.pools.reduce((sum, pool) => sum + pool.tvl, 0))}</span>
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
              {this.loading ? (
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
                  const position = this.getUserPosition(pool.id);
                  return (
                    <tr key={pool.id} class="pool-row">
                      <td class="pool-cell">
                        <div class="pool-info">
                          <div class="token-pair">
                            {pool.tokenA.logoUrl && (
                              <img src={pool.tokenA.logoUrl} alt={pool.tokenA.symbol} class="token-logo" />
                            )}
                            {pool.tokenB.logoUrl && (
                              <img src={pool.tokenB.logoUrl} alt={pool.tokenB.symbol} class="token-logo token-logo--overlap" />
                            )}
                          </div>
                          <div class="pool-details">
                            <div class="pool-name">
                              {pool.tokenA.symbol}/{pool.tokenB.symbol}
                            </div>
                            <div class="pool-fee">{pool.fee}% Fee</div>
                            {pool.isStakable && (
                              <div class="stakable-badge">Stakable</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td class="apy-cell">
                        <div class="apy-info">
                          <div class="apy-main">{pool.apy.toFixed(2)}%</div>
                          {pool.stakingApr && (
                            <div class="apy-staking">+{pool.stakingApr.toFixed(2)}% staking</div>
                          )}
                        </div>
                      </td>

                      <td class="tvl-cell">
                        <div class="metric-value">${this.formatNumber(pool.tvl)}</div>
                        <div class="metric-change">
                          {pool.priceChange24h >= 0 ? '+' : ''}{pool.priceChange24h.toFixed(2)}%
                        </div>
                      </td>

                      <td class="volume-cell">
                        <div class="metric-value">${this.formatNumber(pool.volume24h)}</div>
                      </td>

                      <td class="fees-cell">
                        <div class="metric-value">${this.formatNumber(pool.fees24h)}</div>
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

                          {pool.isStakable && position && (
                            <euclid-button
                              variant="primary"
                              size="sm"
                              onClick={() => this.handleStakeTokens(pool)}
                            >
                              Stake
                            </euclid-button>
                          )}

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
              )}
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
