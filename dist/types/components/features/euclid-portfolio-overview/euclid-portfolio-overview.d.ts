import { EventEmitter } from '../../../stencil-public-runtime';
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
export declare class EuclidPortfolioOverview {
    element: HTMLElement;
    /**
     * User's token balances
     */
    tokenBalances: TokenBalance[];
    /**
     * User's liquidity pool positions
     */
    poolPositions: PoolPosition[];
    /**
     * User's staking positions
     */
    stakingPositions: StakingPosition[];
    /**
     * Recent transactions
     */
    transactions: Transaction[];
    /**
     * Portfolio statistics
     */
    portfolioStats: PortfolioStats | null;
    /**
     * Chart data for portfolio value over time
     */
    chartData: ChartDataPoint[];
    /**
     * Connected wallet address
     */
    walletAddress: string;
    /**
     * Whether the component is in loading state
     */
    loading: boolean;
    /**
     * Card title
     */
    cardTitle: string;
    /**
     * Whether to show detailed analytics
     */
    showAnalytics: boolean;
    /**
     * Time period for charts and stats
     */
    timePeriod: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
    activeTab: 'overview' | 'positions' | 'staking' | 'transactions' | 'analytics';
    selectedPosition: PoolPosition | null;
    showChartTooltip: boolean;
    chartTooltipData: ChartDataPoint | null;
    sortBy: 'value' | 'pnl' | 'apy' | 'allocation';
    sortOrder: 'asc' | 'desc';
    positionSelected: EventEmitter<PoolPosition>;
    managePosition: EventEmitter<PoolPosition>;
    stakeMore: EventEmitter<StakingPosition>;
    unstake: EventEmitter<StakingPosition>;
    claimRewards: EventEmitter<PoolPosition | StakingPosition>;
    viewTransaction: EventEmitter<Transaction>;
    timePeriodChanged: EventEmitter<string>;
    componentDidLoad(): void;
    handleResize(): void;
    private setupChart;
    private renderChart;
    private handleTabChange;
    private handleTimePeriodChange;
    private handleSortChange;
    private handlePositionClick;
    private handleManagePosition;
    private handleClaimRewards;
    private handleStakeMore;
    private handleUnstake;
    private handleViewTransaction;
    private formatNumber;
    private formatPercent;
    private getSortedPositions;
    private renderOverviewTab;
    private renderPositionsTab;
    private renderStakingTab;
    private renderTransactionsTab;
    render(): any;
}
//# sourceMappingURL=euclid-portfolio-overview.d.ts.map