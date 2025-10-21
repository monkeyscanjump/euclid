import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { d as defineCustomElement$2 } from './p-bUJ-P9iR.js';

const euclidPortfolioOverviewCss = ":host{display:block;width:100%;font-family:var(--euclid-font-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)}.portfolio-overview{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);overflow:hidden;box-shadow:var(--euclid-shadow-sm)}.portfolio-overview.loading,.portfolio-overview.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;text-align:center;color:var(--euclid-text-secondary)}.loading-spinner{display:inline-block;width:32px;height:32px;border:3px solid var(--euclid-border);border-top-color:var(--euclid-interactive-primary);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px}@keyframes spin{to{transform:rotate(360deg)}}.empty-state{display:flex;flex-direction:column;align-items:center;gap:16px}.empty-state svg{width:64px;height:64px;color:var(--euclid-text-muted, #9ca3af)}.empty-state span{font-size:18px;color:var(--euclid-text-secondary)}.portfolio-header{display:flex;justify-content:space-between;align-items:center;padding:24px;border-bottom:1px solid var(--euclid-border);background:var(--euclid-surface-secondary)}.portfolio-title{margin:0;font-size:24px;font-weight:600;color:var(--euclid-text-primary)}.wallet-info{display:flex;align-items:center;gap:8px}.wallet-address{padding:6px 12px;background:var(--euclid-bg-tertiary, #f1f5f9);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:14px;color:var(--euclid-text-secondary)}.portfolio-tabs{display:flex;border-bottom:1px solid var(--euclid-border);background:var(--euclid-surface-secondary);overflow-x:auto}.tab-btn{padding:16px 24px;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--euclid-text-secondary);font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;white-space:nowrap}.tab-btn:hover{background:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.tab-btn--active{color:var(--euclid-interactive-primary);border-bottom-color:var(--euclid-interactive-primary);background:var(--euclid-interactive-primary)}.portfolio-content{padding:24px}.overview-tab{display:flex;flex-direction:column;gap:32px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px}.stat-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);display:flex;flex-direction:column;gap:8px}.stat-label{font-size:14px;color:var(--euclid-text-muted, #6b7280);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.stat-value{font-size:24px;font-weight:700;color:var(--euclid-text-primary);line-height:1.2}.stat-value--positive{color:var(--euclid-success-color, #10b981)}.stat-value--negative{color:var(--euclid-error-color, #ef4444)}.stat-change{font-size:12px;font-weight:500}.stat-change--positive{color:var(--euclid-success-color, #10b981)}.stat-change--negative{color:var(--euclid-error-color, #ef4444)}.chart-section{display:flex;flex-direction:column;gap:16px}.chart-header{display:flex;justify-content:space-between;align-items:center}.chart-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.time-period-selector{display:flex;gap:4px;background:var(--euclid-bg-tertiary, #f1f5f9);border-radius:var(--euclid-radius-lg);padding:4px}.period-btn{padding:6px 12px;background:transparent;border:none;border-radius:var(--euclid-border-radius-sm, 6px);color:var(--euclid-text-secondary);font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.period-btn:hover{background:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.period-btn--active{background:var(--euclid-interactive-primary);color:white}.chart-container{height:200px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);padding:20px;display:flex;align-items:center;justify-content:center}.allocation-section{display:flex;flex-direction:column;gap:16px}.allocation-section h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.allocation-grid{display:flex;flex-direction:column;gap:12px}.allocation-item{display:flex;align-items:center;justify-content:space-between;padding:16px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);transition:background-color 0.2s ease}.allocation-item:hover{background:var(--euclid-surface-secondary)}.token-info{display:flex;align-items:center;gap:12px;flex:1}.token-logo{width:32px;height:32px;border-radius:50%}.token-details{display:flex;flex-direction:column;gap:2px}.token-symbol{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.token-balance{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.token-value{display:flex;flex-direction:column;align-items:flex-end;gap:2px;margin-right:20px}.value-primary{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.allocation-percent{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.price-change{font-size:12px;font-weight:500;min-width:60px;text-align:right}.price-change--positive{color:var(--euclid-success-color, #10b981)}.price-change--negative{color:var(--euclid-error-color, #ef4444)}.positions-tab{display:flex;flex-direction:column;gap:20px}.positions-header{display:flex;justify-content:space-between;align-items:center}.positions-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.sort-controls{display:flex;gap:8px}.sort-btn{display:flex;align-items:center;gap:4px;padding:8px 12px;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.sort-btn:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.sort-btn--active{background:var(--euclid-interactive-primary);border-color:var(--euclid-interactive-primary);color:white}.sort-arrow{width:12px;height:12px;transition:transform 0.2s ease}.sort-arrow--desc{transform:rotate(180deg)}.positions-list{display:flex;flex-direction:column;gap:16px}.position-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);cursor:pointer;transition:all 0.2s ease}.position-card:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover);box-shadow:var(--euclid-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.07))}.position-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.token-pair{display:flex;align-items:center;gap:8px}.token-logo--overlap{margin-left:-8px}.pair-name{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.position-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.position-details{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:16px}.detail-item{display:flex;flex-direction:column;gap:4px}.detail-label{font-size:12px;color:var(--euclid-text-muted, #6b7280);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.detail-value{font-size:14px;font-weight:600;color:var(--euclid-text-primary)}.detail-value--positive{color:var(--euclid-success-color, #10b981)}.detail-value--negative{color:var(--euclid-error-color, #ef4444)}.apy-value{color:var(--euclid-success-color, #10b981)}.rewards-section{padding:12px 0;border-top:1px solid var(--euclid-border);border-bottom:1px solid var(--euclid-border);margin-bottom:16px}.reward-item{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--euclid-text-secondary);margin-bottom:8px}.reward-item:last-child{margin-bottom:0}.position-actions{display:flex;gap:8px;justify-content:flex-end}.staking-tab{display:flex;flex-direction:column;gap:20px}.staking-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.staking-list{display:flex;flex-direction:column;gap:16px}.staking-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl)}.staking-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.token-symbol{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.token-name{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.staking-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.staking-details{display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:16px;margin-bottom:20px}.staking-actions{display:flex;gap:8px;flex-wrap:wrap}.transactions-tab{display:flex;flex-direction:column;gap:20px}.transactions-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.transactions-list{display:flex;flex-direction:column;gap:12px}.transaction-card{padding:16px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);cursor:pointer;transition:all 0.2s ease}.transaction-card:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.transaction-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.transaction-type{display:flex;align-items:center;gap:8px}.type-label{font-weight:500;color:var(--euclid-text-primary);font-size:14px}.status-badge{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.status-badge--pending{background:var(--euclid-warning-color-10, rgba(245, 158, 11, 0.1));color:var(--euclid-warning-color, #f59e0b)}.status-badge--confirmed{background:var(--euclid-success-color-10, rgba(16, 185, 129, 0.1));color:var(--euclid-success-color, #10b981)}.status-badge--failed{background:var(--euclid-error-color-10, rgba(239, 68, 68, 0.1));color:var(--euclid-error-color, #ef4444)}.transaction-value{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.transaction-details{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}.transaction-time{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.token-amounts{font-size:12px;color:var(--euclid-text-secondary);font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace}.transaction-hash{font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:11px;color:var(--euclid-text-muted, #6b7280);padding:4px 8px;background:var(--euclid-bg-tertiary, #f1f5f9);border-radius:var(--euclid-border-radius-sm, 6px);display:inline-block}@media (max-width: 1024px){.stats-grid{grid-template-columns:repeat(2, 1fr)}.position-details{grid-template-columns:repeat(2, 1fr)}.staking-details{grid-template-columns:1fr}}@media (max-width: 768px){.portfolio-header{padding:16px;flex-direction:column;align-items:flex-start;gap:12px}.portfolio-content{padding:16px}.stats-grid{grid-template-columns:1fr;gap:12px}.chart-header{flex-direction:column;align-items:flex-start;gap:12px}.time-period-selector{align-self:stretch;justify-content:center}.positions-header{flex-direction:column;align-items:flex-start;gap:12px}.sort-controls{align-self:stretch;justify-content:center}.position-details{grid-template-columns:1fr;gap:12px}.position-actions,.staking-actions{flex-direction:column}.allocation-item{padding:12px}.token-value{margin-right:8px}}@media (max-width: 640px){.portfolio-title{font-size:20px}.tab-btn{padding:12px 16px;font-size:12px}.stat-card{padding:16px}.stat-value{font-size:20px}.position-card,.staking-card,.transaction-card{padding:16px}.position-header{flex-direction:column;align-items:flex-start;gap:8px}.token-pair{gap:6px}.pair-name{font-size:14px}.position-value,.staking-value{font-size:16px}}";

const EuclidPortfolioOverview$1 = /*@__PURE__*/ proxyCustomElement(class EuclidPortfolioOverview extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.positionSelected = createEvent(this, "positionSelected");
        this.managePosition = createEvent(this, "managePosition");
        this.stakeMore = createEvent(this, "stakeMore");
        this.unstake = createEvent(this, "unstake");
        this.claimRewards = createEvent(this, "claimRewards");
        this.viewTransaction = createEvent(this, "viewTransaction");
        this.timePeriodChanged = createEvent(this, "timePeriodChanged");
        /**
         * User's token balances
         */
        this.tokenBalances = [];
        /**
         * User's liquidity pool positions
         */
        this.poolPositions = [];
        /**
         * User's staking positions
         */
        this.stakingPositions = [];
        /**
         * Recent transactions
         */
        this.transactions = [];
        /**
         * Portfolio statistics
         */
        this.portfolioStats = null;
        /**
         * Chart data for portfolio value over time
         */
        this.chartData = [];
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Whether the component is in loading state
         */
        this.loading = false;
        /**
         * Card title
         */
        this.cardTitle = 'Portfolio Overview';
        /**
         * Whether to show detailed analytics
         */
        this.showAnalytics = true;
        /**
         * Time period for charts and stats
         */
        this.timePeriod = '1W';
        // Internal state
        this.activeTab = 'overview';
        this.selectedPosition = null;
        this.showChartTooltip = false;
        this.chartTooltipData = null;
        this.sortBy = 'value';
        this.sortOrder = 'desc';
        this.handleTabChange = (tab) => {
            this.activeTab = tab;
        };
        this.handleTimePeriodChange = (period) => {
            this.timePeriod = period;
            this.timePeriodChanged.emit(period);
        };
        this.handleSortChange = (sortBy) => {
            if (this.sortBy === sortBy) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            }
            else {
                this.sortBy = sortBy;
                this.sortOrder = 'desc';
            }
        };
        this.handlePositionClick = (position) => {
            this.selectedPosition = position;
            this.positionSelected.emit(position);
        };
        this.handleManagePosition = (position) => {
            this.managePosition.emit(position);
        };
        this.handleClaimRewards = (position) => {
            this.claimRewards.emit(position);
        };
        this.handleStakeMore = (position) => {
            this.stakeMore.emit(position);
        };
        this.handleUnstake = (position) => {
            this.unstake.emit(position);
        };
        this.handleViewTransaction = (transaction) => {
            this.viewTransaction.emit(transaction);
        };
    }
    componentDidLoad() {
        this.setupChart();
    }
    handleResize() {
        this.setupChart();
    }
    setupChart() {
        // Simple chart setup - in a real implementation, you'd use a charting library
        if (this.chartData.length > 0 && this.showAnalytics) {
            this.renderChart();
        }
    }
    renderChart() {
        // This is a simplified chart implementation
        // In practice, you'd integrate with libraries like Chart.js, D3, or similar
        const chartContainer = this.element.shadowRoot?.querySelector('.chart-container');
        if (!chartContainer)
            return;
        // Clear previous chart
        chartContainer.innerHTML = '';
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 800 200');
        const data = this.chartData;
        if (data.length === 0)
            return;
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
    formatNumber(value, decimals = 2) {
        if (value >= 1e9) {
            return `${(value / 1e9).toFixed(decimals)}B`;
        }
        else if (value >= 1e6) {
            return `${(value / 1e6).toFixed(decimals)}M`;
        }
        else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(decimals)}K`;
        }
        return value.toFixed(decimals);
    }
    formatPercent(value, decimals = 2) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    }
    getSortedPositions() {
        const sorted = [...this.poolPositions].sort((a, b) => {
            let aValue, bValue;
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
    renderOverviewTab() {
        const stats = this.portfolioStats;
        if (!stats)
            return null;
        return (h("div", { class: "overview-tab" }, h("div", { class: "stats-grid" }, h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Value"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalValue)), h("div", { class: {
                'stat-change': true,
                'stat-change--positive': stats.dayChange >= 0,
                'stat-change--negative': stats.dayChange < 0,
            } }, this.formatPercent(stats.dayChangePercent), " (24h)")), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total P&L"), h("div", { class: {
                'stat-value': true,
                'stat-value--positive': stats.totalPnL >= 0,
                'stat-value--negative': stats.totalPnL < 0,
            } }, "$", this.formatNumber(stats.totalPnL)), h("div", { class: {
                'stat-change': true,
                'stat-change--positive': stats.totalPnLPercent >= 0,
                'stat-change--negative': stats.totalPnLPercent < 0,
            } }, this.formatPercent(stats.totalPnLPercent))), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Rewards"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalRewards)), h("div", { class: "stat-change" }, stats.activePositions, " active positions")), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Staked"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalStaked)), h("div", { class: "stat-change" }, this.stakingPositions.length, " staking positions"))), this.showAnalytics && (h("div", { class: "chart-section" }, h("div", { class: "chart-header" }, h("h3", null, "Portfolio Value"), h("div", { class: "time-period-selector" }, ['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(period => (h("button", { key: period, class: {
                'period-btn': true,
                'period-btn--active': period === this.timePeriod,
            }, onClick: () => this.handleTimePeriodChange(period), type: "button" }, period))))), h("div", { class: "chart-container" }))), h("div", { class: "allocation-section" }, h("h3", null, "Asset Allocation"), h("div", { class: "allocation-grid" }, this.tokenBalances
            .filter(token => token.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map(token => (h("div", { key: token.symbol, class: "allocation-item" }, h("div", { class: "token-info" }, token.logoUrl && (h("img", { src: token.logoUrl, alt: token.symbol, class: "token-logo" })), h("div", { class: "token-details" }, h("div", { class: "token-symbol" }, token.symbol), h("div", { class: "token-balance" }, parseFloat(token.balance).toFixed(4)))), h("div", { class: "token-value" }, h("div", { class: "value-primary" }, "$", this.formatNumber(token.value)), h("div", { class: "allocation-percent" }, token.allocation.toFixed(1), "%")), h("div", { class: {
                'price-change': true,
                'price-change--positive': token.priceChange24h >= 0,
                'price-change--negative': token.priceChange24h < 0,
            } }, this.formatPercent(token.priceChange24h)))))))));
    }
    renderPositionsTab() {
        const sortedPositions = this.getSortedPositions();
        return (h("div", { class: "positions-tab" }, h("div", { class: "positions-header" }, h("h3", null, "Liquidity Positions"), h("div", { class: "sort-controls" }, h("button", { class: {
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'value',
            }, onClick: () => this.handleSortChange('value'), type: "button" }, "Value", this.sortBy === 'value' && (h("svg", { class: {
                'sort-arrow': true,
                'sort-arrow--desc': this.sortOrder === 'desc',
            }, viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))), h("button", { class: {
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'apy',
            }, onClick: () => this.handleSortChange('apy'), type: "button" }, "APY"))), h("div", { class: "positions-list" }, sortedPositions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No liquidity positions found"))) : (sortedPositions.map(position => (h("div", { key: position.poolId, class: "position-card", onClick: () => this.handlePositionClick(position) }, h("div", { class: "position-header" }, h("div", { class: "token-pair" }, position.tokenA.logoUrl && (h("img", { src: position.tokenA.logoUrl, alt: position.tokenA.symbol, class: "token-logo" })), position.tokenB.logoUrl && (h("img", { src: position.tokenB.logoUrl, alt: position.tokenB.symbol, class: "token-logo token-logo--overlap" })), h("span", { class: "pair-name" }, position.tokenA.symbol, "/", position.tokenB.symbol)), h("div", { class: "position-value" }, "$", this.formatNumber(position.totalValue))), h("div", { class: "position-details" }, h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "APY"), h("span", { class: "detail-value apy-value" }, position.apy.toFixed(2), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Share"), h("span", { class: "detail-value" }, position.shareOfPool.toFixed(4), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "IL"), h("span", { class: {
                'detail-value': true,
                'detail-value--positive': position.impermanentLoss >= 0,
                'detail-value--negative': position.impermanentLoss < 0,
            } }, this.formatPercent(position.impermanentLoss)))), (position.unclaimedRewards || position.stakingRewards) && (h("div", { class: "rewards-section" }, position.unclaimedRewards && position.unclaimedRewards > 0 && (h("div", { class: "reward-item" }, h("span", null, "Unclaimed: $", this.formatNumber(position.unclaimedRewards)), h("euclid-button", { variant: "ghost", size: "sm", onClick: (e) => {
                e.stopPropagation();
                this.handleClaimRewards(position);
            } }, "Claim"))), position.stakingRewards && position.stakingRewards > 0 && (h("div", { class: "reward-item" }, h("span", null, "Staking: $", this.formatNumber(position.stakingRewards)))))), h("div", { class: "position-actions" }, h("euclid-button", { variant: "secondary", size: "sm", onClick: (e) => {
                e.stopPropagation();
                this.handleManagePosition(position);
            } }, "Manage")))))))));
    }
    renderStakingTab() {
        return (h("div", { class: "staking-tab" }, h("div", { class: "staking-header" }, h("h3", null, "Staking Positions")), h("div", { class: "staking-list" }, this.stakingPositions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No staking positions found"))) : (this.stakingPositions.map(position => (h("div", { key: position.id, class: "staking-card" }, h("div", { class: "staking-header" }, h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, position.tokenSymbol), h("span", { class: "token-name" }, position.tokenName)), h("div", { class: "staking-value" }, "$", this.formatNumber(position.stakedValue))), h("div", { class: "staking-details" }, h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Staked Amount"), h("span", { class: "detail-value" }, parseFloat(position.stakedAmount).toFixed(4), " ", position.tokenSymbol)), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "APR"), h("span", { class: "detail-value apy-value" }, position.apr.toFixed(2), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Rewards"), h("span", { class: "detail-value" }, "$", this.formatNumber(position.rewards))), position.unlockDate && (h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Unlock Date"), h("span", { class: "detail-value" }, position.unlockDate.toLocaleDateString())))), h("div", { class: "staking-actions" }, h("euclid-button", { variant: "primary", size: "sm", onClick: () => this.handleStakeMore(position) }, "Stake More"), h("euclid-button", { variant: "secondary", size: "sm", onClick: () => this.handleUnstake(position), disabled: position.unlockDate ? position.unlockDate > new Date() : false }, "Unstake"), position.rewards > 0 && (h("euclid-button", { variant: "ghost", size: "sm", onClick: () => this.handleClaimRewards(position) }, "Claim"))))))))));
    }
    renderTransactionsTab() {
        const recentTransactions = this.transactions.slice(0, 20);
        return (h("div", { class: "transactions-tab" }, h("div", { class: "transactions-header" }, h("h3", null, "Recent Transactions")), h("div", { class: "transactions-list" }, recentTransactions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No transactions found"))) : (recentTransactions.map(transaction => (h("div", { key: transaction.id, class: "transaction-card", onClick: () => this.handleViewTransaction(transaction) }, h("div", { class: "transaction-header" }, h("div", { class: "transaction-type" }, h("span", { class: "type-label" }, transaction.type.replace('_', ' ').toUpperCase()), h("span", { class: {
                'status-badge': true,
                [`status-badge--${transaction.status}`]: true,
            } }, transaction.status)), h("div", { class: "transaction-value" }, "$", this.formatNumber(transaction.value))), h("div", { class: "transaction-details" }, h("div", { class: "transaction-time" }, transaction.timestamp.toLocaleDateString(), " ", transaction.timestamp.toLocaleTimeString()), transaction.tokenA && (h("div", { class: "token-amounts" }, h("span", null, parseFloat(transaction.amountA || '0').toFixed(4), " ", transaction.tokenA.symbol), transaction.tokenB && transaction.amountB && (h("span", null, "\u2192 ", parseFloat(transaction.amountB).toFixed(4), " ", transaction.tokenB.symbol))))), h("div", { class: "transaction-hash" }, transaction.hash.slice(0, 10), "...", transaction.hash.slice(-8)))))))));
    }
    render() {
        if (this.loading) {
            return (h("div", { class: "portfolio-overview loading" }, h("div", { class: "loading-spinner" }), h("span", null, "Loading portfolio data...")));
        }
        if (!this.walletAddress) {
            return (h("div", { class: "portfolio-overview empty" }, h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "Connect your wallet to view portfolio"))));
        }
        return (h("div", { class: "portfolio-overview" }, h("div", { class: "portfolio-header" }, h("h2", { class: "portfolio-title" }, this.cardTitle), h("div", { class: "wallet-info" }, h("span", { class: "wallet-address" }, this.walletAddress.slice(0, 6), "...", this.walletAddress.slice(-4)))), h("div", { class: "portfolio-tabs" }, h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'overview',
            }, onClick: () => this.handleTabChange('overview'), type: "button" }, "Overview"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'positions',
            }, onClick: () => this.handleTabChange('positions'), type: "button" }, "Positions (", this.poolPositions.length, ")"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'staking',
            }, onClick: () => this.handleTabChange('staking'), type: "button" }, "Staking (", this.stakingPositions.length, ")"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'transactions',
            }, onClick: () => this.handleTabChange('transactions'), type: "button" }, "Transactions")), h("div", { class: "portfolio-content" }, this.activeTab === 'overview' && this.renderOverviewTab(), this.activeTab === 'positions' && this.renderPositionsTab(), this.activeTab === 'staking' && this.renderStakingTab(), this.activeTab === 'transactions' && this.renderTransactionsTab())));
    }
    get element() { return this; }
    static get style() { return euclidPortfolioOverviewCss; }
}, [257, "euclid-portfolio-overview", {
        "tokenBalances": [16],
        "poolPositions": [16],
        "stakingPositions": [16],
        "transactions": [16],
        "portfolioStats": [16],
        "chartData": [16],
        "walletAddress": [1, "wallet-address"],
        "loading": [4],
        "cardTitle": [1, "card-title"],
        "showAnalytics": [4, "show-analytics"],
        "timePeriod": [1, "time-period"],
        "activeTab": [32],
        "selectedPosition": [32],
        "showChartTooltip": [32],
        "chartTooltipData": [32],
        "sortBy": [32],
        "sortOrder": [32]
    }, [[9, "resize", "handleResize"]]]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-portfolio-overview", "euclid-button"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-portfolio-overview":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidPortfolioOverview$1);
            }
            break;
        case "euclid-button":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const EuclidPortfolioOverview = EuclidPortfolioOverview$1;
const defineCustomElement = defineCustomElement$1;

export { EuclidPortfolioOverview, defineCustomElement };
//# sourceMappingURL=euclid-portfolio-overview.js.map

//# sourceMappingURL=euclid-portfolio-overview.js.map