import { h } from "@stencil/core";
export class EuclidPortfolioOverview {
    constructor() {
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
    static get is() { return "euclid-portfolio-overview"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-portfolio-overview.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-portfolio-overview.css"]
        };
    }
    static get properties() {
        return {
            "tokenBalances": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TokenBalance[]",
                    "resolved": "TokenBalance[]",
                    "references": {
                        "TokenBalance": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::TokenBalance"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "User's token balances"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "poolPositions": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "PoolPosition[]",
                    "resolved": "PoolPosition[]",
                    "references": {
                        "PoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::PoolPosition"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "User's liquidity pool positions"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "stakingPositions": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "StakingPosition[]",
                    "resolved": "StakingPosition[]",
                    "references": {
                        "StakingPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::StakingPosition"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "User's staking positions"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "transactions": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "Transaction[]",
                    "resolved": "Transaction[]",
                    "references": {
                        "Transaction": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::Transaction"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Recent transactions"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "portfolioStats": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "PortfolioStats | null",
                    "resolved": "PortfolioStats",
                    "references": {
                        "PortfolioStats": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::PortfolioStats"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Portfolio statistics"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "null"
            },
            "chartData": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "ChartDataPoint[]",
                    "resolved": "ChartDataPoint[]",
                    "references": {
                        "ChartDataPoint": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::ChartDataPoint"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Chart data for portfolio value over time"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "walletAddress": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Connected wallet address"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "wallet-address",
                "defaultValue": "''"
            },
            "loading": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether the component is in loading state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
            },
            "cardTitle": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Card title"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "card-title",
                "defaultValue": "'Portfolio Overview'"
            },
            "showAnalytics": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether to show detailed analytics"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-analytics",
                "defaultValue": "true"
            },
            "timePeriod": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'",
                    "resolved": "\"1D\" | \"1M\" | \"1W\" | \"1Y\" | \"3M\" | \"ALL\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Time period for charts and stats"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "time-period",
                "defaultValue": "'1W'"
            }
        };
    }
    static get states() {
        return {
            "activeTab": {},
            "selectedPosition": {},
            "showChartTooltip": {},
            "chartTooltipData": {},
            "sortBy": {},
            "sortOrder": {}
        };
    }
    static get events() {
        return [{
                "method": "positionSelected",
                "name": "positionSelected",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolPosition",
                    "resolved": "PoolPosition",
                    "references": {
                        "PoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::PoolPosition"
                        }
                    }
                }
            }, {
                "method": "managePosition",
                "name": "managePosition",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolPosition",
                    "resolved": "PoolPosition",
                    "references": {
                        "PoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::PoolPosition"
                        }
                    }
                }
            }, {
                "method": "stakeMore",
                "name": "stakeMore",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "StakingPosition",
                    "resolved": "StakingPosition",
                    "references": {
                        "StakingPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::StakingPosition"
                        }
                    }
                }
            }, {
                "method": "unstake",
                "name": "unstake",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "StakingPosition",
                    "resolved": "StakingPosition",
                    "references": {
                        "StakingPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::StakingPosition"
                        }
                    }
                }
            }, {
                "method": "claimRewards",
                "name": "claimRewards",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolPosition | StakingPosition",
                    "resolved": "PoolPosition | StakingPosition",
                    "references": {
                        "PoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::PoolPosition"
                        },
                        "StakingPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::StakingPosition"
                        }
                    }
                }
            }, {
                "method": "viewTransaction",
                "name": "viewTransaction",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "Transaction",
                    "resolved": "Transaction",
                    "references": {
                        "Transaction": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx",
                            "id": "src/components/features/euclid-portfolio-overview/euclid-portfolio-overview.tsx::Transaction"
                        }
                    }
                }
            }, {
                "method": "timePeriodChanged",
                "name": "timePeriodChanged",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }];
    }
    static get elementRef() { return "element"; }
    static get listeners() {
        return [{
                "name": "resize",
                "method": "handleResize",
                "target": "window",
                "capture": false,
                "passive": true
            }];
    }
}
//# sourceMappingURL=euclid-portfolio-overview.js.map
