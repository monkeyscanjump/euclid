import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  balance: string;
  value: number;
  price: number;
  priceChange24h: number;
  allocation: number;
}

export interface PoolPosition {
  poolId: string;
  poolAddress: string;
  tokenA: TokenBalance;
  tokenB: TokenBalance;
  lpTokenBalance: string;
  lpTokenSymbol: string;
  shareOfPool: number;
  tokenAAmount: string;
  tokenBAmount: string;
  totalValue: number;
  apy: number;
  fees24h: number;
  feesWeek: number;
  unclaimedRewards?: number;
  stakingRewards?: number;
  impermanentLoss: number;
  entryPrice: number;
  entryDate: Date;
}

export interface StakingPosition {
  id: string;
  poolId?: string;
  tokenSymbol: string;
  tokenName: string;
  stakedAmount: string;
  stakedValue: number;
  rewards: number;
  apr: number;
  lockupPeriod?: number;
  unlockDate?: Date;
  autoCompound: boolean;
}

export interface Transaction {
  id: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'stake' | 'unstake' | 'claim';
  hash: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  tokenA?: TokenBalance;
  tokenB?: TokenBalance;
  amountA?: string;
  amountB?: string;
  value: number;
  gasUsed?: string;
  gasFee?: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  weekChangePercent: number;
  totalRewards: number;
  totalStaked: number;
  activePositions: number;
  totalTransactions: number;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

@Component({
  tag: 'euclid-portfolio-overview',
  styleUrl: 'euclid-portfolio-overview.css',
  shadow: true,
})
export class EuclidPortfolioOverview {
  @Element() element!: HTMLElement;

  /**
   * User's token balances
   */
  @Prop() tokenBalances: TokenBalance[] = [];

  /**
   * User's liquidity pool positions
   */
  @Prop() poolPositions: PoolPosition[] = [];

  /**
   * User's staking positions
   */
  @Prop() stakingPositions: StakingPosition[] = [];

  /**
   * Recent transactions
   */
  @Prop() transactions: Transaction[] = [];

  /**
   * Portfolio statistics
   */
  @Prop() portfolioStats: PortfolioStats | null = null;

  /**
   * Chart data for portfolio value over time
   */
  @Prop() chartData: ChartDataPoint[] = [];

  /**
   * Connected wallet address
   */
  @Prop() walletAddress: string = '';

  /**
   * Whether the component is in loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Portfolio Overview';

  /**
   * Whether to show detailed analytics
   */
  @Prop() showAnalytics: boolean = true;

  /**
   * Time period for charts and stats
   */
  @Prop() timePeriod: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL' = '1W';

  // Internal state
  @State() activeTab: 'overview' | 'positions' | 'staking' | 'transactions' | 'analytics' = 'overview';
  @State() selectedPosition: PoolPosition | null = null;
  @State() showChartTooltip: boolean = false;
  @State() chartTooltipData: ChartDataPoint | null = null;
  @State() sortBy: 'value' | 'pnl' | 'apy' | 'allocation' = 'value';
  @State() sortOrder: 'asc' | 'desc' = 'desc';

  // Events
  @Event() positionSelected: EventEmitter<PoolPosition>;
  @Event() managePosition: EventEmitter<PoolPosition>;
  @Event() stakeMore: EventEmitter<StakingPosition>;
  @Event() unstake: EventEmitter<StakingPosition>;
  @Event() claimRewards: EventEmitter<PoolPosition | StakingPosition>;
  @Event() viewTransaction: EventEmitter<Transaction>;
  @Event() timePeriodChanged: EventEmitter<string>;

  componentDidLoad() {
    this.setupChart();
  }

  @Listen('resize', { target: 'window' })
  handleResize() {
    this.setupChart();
  }

  private setupChart() {
    // Simple chart setup - in a real implementation, you'd use a charting library
    if (this.chartData.length > 0 && this.showAnalytics) {
      this.renderChart();
    }
  }

  private renderChart() {
    // This is a simplified chart implementation
    // In practice, you'd integrate with libraries like Chart.js, D3, or similar
    const chartContainer = this.element.shadowRoot?.querySelector('.chart-container');
    if (!chartContainer) return;

    // Clear previous chart
    chartContainer.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 800 200');

    const data = this.chartData;
    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * 800;
        const y = 180 - ((point.value - minValue) / valueRange) * 160;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'var(--euclid-primary-color, #3b82f6)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');

    svg.appendChild(path);
    chartContainer.appendChild(svg);
  }

  private handleTabChange = (tab: typeof this.activeTab) => {
    this.activeTab = tab;
  };

  private handleTimePeriodChange = (period: typeof this.timePeriod) => {
    this.timePeriod = period;
    this.timePeriodChanged.emit(period);
  };

  private handleSortChange = (sortBy: typeof this.sortBy) => {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
  };

  private handlePositionClick = (position: PoolPosition) => {
    this.selectedPosition = position;
    this.positionSelected.emit(position);
  };

  private handleManagePosition = (position: PoolPosition) => {
    this.managePosition.emit(position);
  };

  private handleClaimRewards = (position: PoolPosition | StakingPosition) => {
    this.claimRewards.emit(position);
  };

  private handleStakeMore = (position: StakingPosition) => {
    this.stakeMore.emit(position);
  };

  private handleUnstake = (position: StakingPosition) => {
    this.unstake.emit(position);
  };

  private handleViewTransaction = (transaction: Transaction) => {
    this.viewTransaction.emit(transaction);
  };

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

  private formatPercent(value: number, decimals: number = 2): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  }

  private getSortedPositions(): PoolPosition[] {
    const sorted = [...this.poolPositions].sort((a, b) => {
      let aValue: number, bValue: number;

      switch (this.sortBy) {
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'pnl':
          aValue = a.impermanentLoss;
          bValue = b.impermanentLoss;
          break;
        case 'apy':
          aValue = a.apy;
          bValue = b.apy;
          break;
        case 'allocation':
          aValue = this.portfolioStats ? (a.totalValue / this.portfolioStats.totalValue) * 100 : 0;
          bValue = this.portfolioStats ? (b.totalValue / this.portfolioStats.totalValue) * 100 : 0;
          break;
        default:
          aValue = a.totalValue;
          bValue = b.totalValue;
      }

      return this.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }

  private renderOverviewTab() {
    const stats = this.portfolioStats;
    if (!stats) return null;

    return (
      <div class="overview-tab">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Value</div>
            <div class="stat-value">${this.formatNumber(stats.totalValue)}</div>
            <div class={{
              'stat-change': true,
              'stat-change--positive': stats.dayChange >= 0,
              'stat-change--negative': stats.dayChange < 0,
            }}>
              {this.formatPercent(stats.dayChangePercent)} (24h)
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total P&L</div>
            <div class={{
              'stat-value': true,
              'stat-value--positive': stats.totalPnL >= 0,
              'stat-value--negative': stats.totalPnL < 0,
            }}>
              ${this.formatNumber(stats.totalPnL)}
            </div>
            <div class={{
              'stat-change': true,
              'stat-change--positive': stats.totalPnLPercent >= 0,
              'stat-change--negative': stats.totalPnLPercent < 0,
            }}>
              {this.formatPercent(stats.totalPnLPercent)}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Rewards</div>
            <div class="stat-value">${this.formatNumber(stats.totalRewards)}</div>
            <div class="stat-change">
              {stats.activePositions} active positions
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Staked</div>
            <div class="stat-value">${this.formatNumber(stats.totalStaked)}</div>
            <div class="stat-change">
              {this.stakingPositions.length} staking positions
            </div>
          </div>
        </div>

        {this.showAnalytics && (
          <div class="chart-section">
            <div class="chart-header">
              <h3>Portfolio Value</h3>
              <div class="time-period-selector">
                {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map(period => (
                  <button
                    key={period}
                    class={{
                      'period-btn': true,
                      'period-btn--active': period === this.timePeriod,
                    }}
                    onClick={() => this.handleTimePeriodChange(period)}
                    type="button"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div class="chart-container"></div>
          </div>
        )}

        <div class="allocation-section">
          <h3>Asset Allocation</h3>
          <div class="allocation-grid">
            {this.tokenBalances
              .filter(token => token.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map(token => (
                <div key={token.symbol} class="allocation-item">
                  <div class="token-info">
                    {token.logoUrl && (
                      <img src={token.logoUrl} alt={token.symbol} class="token-logo" />
                    )}
                    <div class="token-details">
                      <div class="token-symbol">{token.symbol}</div>
                      <div class="token-balance">{parseFloat(token.balance).toFixed(4)}</div>
                    </div>
                  </div>
                  <div class="token-value">
                    <div class="value-primary">${this.formatNumber(token.value)}</div>
                    <div class="allocation-percent">{token.allocation.toFixed(1)}%</div>
                  </div>
                  <div class={{
                    'price-change': true,
                    'price-change--positive': token.priceChange24h >= 0,
                    'price-change--negative': token.priceChange24h < 0,
                  }}>
                    {this.formatPercent(token.priceChange24h)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  private renderPositionsTab() {
    const sortedPositions = this.getSortedPositions();

    return (
      <div class="positions-tab">
        <div class="positions-header">
          <h3>Liquidity Positions</h3>
          <div class="sort-controls">
            <button
              class={{
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'value',
              }}
              onClick={() => this.handleSortChange('value')}
              type="button"
            >
              Value
              {this.sortBy === 'value' && (
                <svg class={{
                  'sort-arrow': true,
                  'sort-arrow--desc': this.sortOrder === 'desc',
                }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              )}
            </button>
            <button
              class={{
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'apy',
              }}
              onClick={() => this.handleSortChange('apy')}
              type="button"
            >
              APY
            </button>
          </div>
        </div>

        <div class="positions-list">
          {sortedPositions.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
              </svg>
              <span>No liquidity positions found</span>
            </div>
          ) : (
            sortedPositions.map(position => (
              <div
                key={position.poolId}
                class="position-card"
                onClick={() => this.handlePositionClick(position)}
              >
                <div class="position-header">
                  <div class="token-pair">
                    {position.tokenA.logoUrl && (
                      <img src={position.tokenA.logoUrl} alt={position.tokenA.symbol} class="token-logo" />
                    )}
                    {position.tokenB.logoUrl && (
                      <img src={position.tokenB.logoUrl} alt={position.tokenB.symbol} class="token-logo token-logo--overlap" />
                    )}
                    <span class="pair-name">{position.tokenA.symbol}/{position.tokenB.symbol}</span>
                  </div>
                  <div class="position-value">${this.formatNumber(position.totalValue)}</div>
                </div>

                <div class="position-details">
                  <div class="detail-item">
                    <span class="detail-label">APY</span>
                    <span class="detail-value apy-value">{position.apy.toFixed(2)}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Share</span>
                    <span class="detail-value">{position.shareOfPool.toFixed(4)}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">IL</span>
                    <span class={{
                      'detail-value': true,
                      'detail-value--positive': position.impermanentLoss >= 0,
                      'detail-value--negative': position.impermanentLoss < 0,
                    }}>
                      {this.formatPercent(position.impermanentLoss)}
                    </span>
                  </div>
                </div>

                {(position.unclaimedRewards || position.stakingRewards) && (
                  <div class="rewards-section">
                    {position.unclaimedRewards && position.unclaimedRewards > 0 && (
                      <div class="reward-item">
                        <span>Unclaimed: ${this.formatNumber(position.unclaimedRewards)}</span>
                        <euclid-button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleClaimRewards(position);
                          }}
                        >
                          Claim
                        </euclid-button>
                      </div>
                    )}
                    {position.stakingRewards && position.stakingRewards > 0 && (
                      <div class="reward-item">
                        <span>Staking: ${this.formatNumber(position.stakingRewards)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div class="position-actions">
                  <euclid-button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.handleManagePosition(position);
                    }}
                  >
                    Manage
                  </euclid-button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  private renderStakingTab() {
    return (
      <div class="staking-tab">
        <div class="staking-header">
          <h3>Staking Positions</h3>
        </div>

        <div class="staking-list">
          {this.stakingPositions.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
              </svg>
              <span>No staking positions found</span>
            </div>
          ) : (
            this.stakingPositions.map(position => (
              <div key={position.id} class="staking-card">
                <div class="staking-header">
                  <div class="token-info">
                    <span class="token-symbol">{position.tokenSymbol}</span>
                    <span class="token-name">{position.tokenName}</span>
                  </div>
                  <div class="staking-value">${this.formatNumber(position.stakedValue)}</div>
                </div>

                <div class="staking-details">
                  <div class="detail-item">
                    <span class="detail-label">Staked Amount</span>
                    <span class="detail-value">{parseFloat(position.stakedAmount).toFixed(4)} {position.tokenSymbol}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">APR</span>
                    <span class="detail-value apy-value">{position.apr.toFixed(2)}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Rewards</span>
                    <span class="detail-value">${this.formatNumber(position.rewards)}</span>
                  </div>
                  {position.unlockDate && (
                    <div class="detail-item">
                      <span class="detail-label">Unlock Date</span>
                      <span class="detail-value">{position.unlockDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div class="staking-actions">
                  <euclid-button
                    variant="primary"
                    size="sm"
                    onClick={() => this.handleStakeMore(position)}
                  >
                    Stake More
                  </euclid-button>
                  <euclid-button
                    variant="secondary"
                    size="sm"
                    onClick={() => this.handleUnstake(position)}
                    disabled={position.unlockDate ? position.unlockDate > new Date() : false}
                  >
                    Unstake
                  </euclid-button>
                  {position.rewards > 0 && (
                    <euclid-button
                      variant="ghost"
                      size="sm"
                      onClick={() => this.handleClaimRewards(position)}
                    >
                      Claim
                    </euclid-button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  private renderTransactionsTab() {
    const recentTransactions = this.transactions.slice(0, 20);

    return (
      <div class="transactions-tab">
        <div class="transactions-header">
          <h3>Recent Transactions</h3>
        </div>

        <div class="transactions-list">
          {recentTransactions.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
              </svg>
              <span>No transactions found</span>
            </div>
          ) : (
            recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                class="transaction-card"
                onClick={() => this.handleViewTransaction(transaction)}
              >
                <div class="transaction-header">
                  <div class="transaction-type">
                    <span class="type-label">{transaction.type.replace('_', ' ').toUpperCase()}</span>
                    <span class={{
                      'status-badge': true,
                      [`status-badge--${transaction.status}`]: true,
                    }}>
                      {transaction.status}
                    </span>
                  </div>
                  <div class="transaction-value">${this.formatNumber(transaction.value)}</div>
                </div>

                <div class="transaction-details">
                  <div class="transaction-time">
                    {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
                  </div>
                  {transaction.tokenA && (
                    <div class="token-amounts">
                      <span>{parseFloat(transaction.amountA || '0').toFixed(4)} {transaction.tokenA.symbol}</span>
                      {transaction.tokenB && transaction.amountB && (
                        <span>→ {parseFloat(transaction.amountB).toFixed(4)} {transaction.tokenB.symbol}</span>
                      )}
                    </div>
                  )}
                </div>

                <div class="transaction-hash">
                  {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.loading) {
      return (
        <div class="portfolio-overview loading">
          <div class="loading-spinner"></div>
          <span>Loading portfolio data...</span>
        </div>
      );
    }

    if (!this.walletAddress) {
      return (
        <div class="portfolio-overview empty">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
            </svg>
            <span>Connect your wallet to view portfolio</span>
          </div>
        </div>
      );
    }

    return (
      <div class="portfolio-overview">
        <div class="portfolio-header">
          <h2 class="portfolio-title">{this.cardTitle}</h2>
          <div class="wallet-info">
            <span class="wallet-address">
              {this.walletAddress.slice(0, 6)}...{this.walletAddress.slice(-4)}
            </span>
          </div>
        </div>

        <div class="portfolio-tabs">
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'overview',
            }}
            onClick={() => this.handleTabChange('overview')}
            type="button"
          >
            Overview
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'positions',
            }}
            onClick={() => this.handleTabChange('positions')}
            type="button"
          >
            Positions ({this.poolPositions.length})
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'staking',
            }}
            onClick={() => this.handleTabChange('staking')}
            type="button"
          >
            Staking ({this.stakingPositions.length})
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'transactions',
            }}
            onClick={() => this.handleTabChange('transactions')}
            type="button"
          >
            Transactions
          </button>
        </div>

        <div class="portfolio-content">
          {this.activeTab === 'overview' && this.renderOverviewTab()}
          {this.activeTab === 'positions' && this.renderPositionsTab()}
          {this.activeTab === 'staking' && this.renderStakingTab()}
          {this.activeTab === 'transactions' && this.renderTransactionsTab()}
        </div>
      </div>
    );
  }
}
