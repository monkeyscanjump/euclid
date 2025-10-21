import { h } from "@stencil/core";
import { marketStore } from "../../../store/market.store";
export class EuclidPoolsList {
    constructor() {
        /**
         * Available pools data (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.pools = [];
        /**
         * Token metadata for logos and display names (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokenMetadata = [];
        /**
         * User's positions in pools
         */
        this.positions = [];
        /**
         * Whether the component is in loading state (overrides store loading)
         */
        this.loading = false;
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Items per page for pagination
         */
        this.itemsPerPage = 10;
        /**
         * Card title
         */
        this.cardTitle = 'Liquidity Pools';
        // Internal state
        this.filteredPools = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            search: '',
            sortBy: 'apr',
            sortOrder: 'desc',
            showMyPools: false,
        };
        // Store data (automatically synced)
        this.storePools = [];
        this.storeTokens = [];
        this.storeLoading = false;
        this.handleFiltersChanged = (event) => {
            this.filters = event.detail;
            this.currentPage = 1;
            this.applyFilters();
        };
        this.handlePageChange = (page) => {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        };
    }
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
    syncWithStore() {
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
    watchPoolsChange() {
        this.applyFilters();
    }
    watchPositionsChange() {
        this.applyFilters();
    }
    applyFilters() {
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
            let aValue, bValue;
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
            }
            else {
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
    getTokenMetadata(tokenId) {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
        return activeTokens.find(token => token.tokenId === tokenId) || null;
    }
    getUserPosition(poolId) {
        return this.positions.find(pos => pos.poolId === poolId) || null;
    }
    getTokensWithPools() {
        const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
        // Get unique token IDs that appear in pools
        const tokenIdsInPools = new Set();
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
    getPaginatedPools() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredPools.slice(startIndex, endIndex);
    }
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
        return (h("div", { key: 'ee8cd3221635ae068a8d7707c128ccc51ad98bdf', class: "pools-list" }, h("div", { key: '8c5a36dff34b3662a569719e700229587ec4cd08', class: "pools-header" }, h("h3", { key: '49ca59d21d81ff5b17209ce984fc080002ec64e0', class: "pools-title" }, this.cardTitle)), h("pools-filters", { key: '9d006a402943b6c13ee75b1f4207b2799a5baed2', filters: this.filters, walletAddress: this.walletAddress, onFiltersChanged: this.handleFiltersChanged }), h("pools-stats", { key: 'b26ac8b9520425a46cd58748cf227043154ae434', totalPools: activePools.length, filteredPools: this.filteredPools.length, totalTvl: totalTvl, userPositions: this.positions.length, walletAddress: this.walletAddress }), h("div", { key: '9ec301d9c1053070d22f5a69981ee9dd80da3a98', class: "pools-content" }, isLoading ? (h("pools-loading", { count: 6 })) : paginatedPools.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No pools found matching your criteria"), h("button", { class: "clear-filters-btn", onClick: () => {
                this.filters = {
                    search: '',
                    sortBy: 'apr',
                    sortOrder: 'desc',
                    showMyPools: false,
                };
                this.currentPage = 1;
                this.applyFilters();
            }, type: "button" }, "Clear Filters"))) : (h("div", { class: "pools-grid" }, paginatedPools.map(pool => (h("pool-item", { key: pool.pool_id, pool: pool, tokens: activeTokens, position: this.getUserPosition(pool.pool_id), walletAddress: this.walletAddress, onAddLiquidity: (event) => this.addLiquidity.emit(event.detail), onRemoveLiquidity: (event) => this.removeLiquidity.emit(event.detail), onStakeTokens: (event) => this.stakeTokens.emit(event.detail), onClaimRewards: (event) => this.claimRewards.emit(event.detail) })))))), this.totalPages > 1 && (h("div", { key: '00ef8872b32c0a7026641101bd5c141dad963efa', class: "pagination" }, h("button", { key: '515f5f02ee25ad9002bab9480fe3094fbbf2a9bb', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage - 1), disabled: this.currentPage === 1, type: "button" }, "Previous"), h("div", { key: 'a02e9fd63fa1ecbc01ffd6a89f1760e708ecb1a5', class: "pagination-pages" }, Array.from({ length: this.totalPages }, (_, i) => i + 1).map(page => (h("button", { key: page, class: {
                'pagination-page': true,
                'pagination-page--active': page === this.currentPage,
            }, onClick: () => this.handlePageChange(page), type: "button" }, page)))), h("button", { key: 'a1a783aa40ef3a16416a35e804aa1d25608c82a5', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage + 1), disabled: this.currentPage === this.totalPages, type: "button" }, "Next")))));
    }
    static get is() { return "euclid-pools-list"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-pools-list.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-pools-list.css"]
        };
    }
    static get properties() {
        return {
            "pools": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "PoolInfo[]",
                    "resolved": "PoolInfo[]",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [{
                            "name": "deprecated",
                            "text": "Use store instead"
                        }],
                    "text": "Available pools data (gets from market store automatically)"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "tokenMetadata": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TokenMetadata[]",
                    "resolved": "TokenMetadata[]",
                    "references": {
                        "TokenMetadata": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::TokenMetadata"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [{
                            "name": "deprecated",
                            "text": "Use store instead"
                        }],
                    "text": "Token metadata for logos and display names (gets from market store automatically)"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "positions": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "UserPoolPosition[]",
                    "resolved": "UserPoolPosition[]",
                    "references": {
                        "UserPoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/euclid-pools-list.tsx",
                            "id": "src/components/features/euclid-pools-list/euclid-pools-list.tsx::UserPoolPosition"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "User's positions in pools"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
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
                    "text": "Whether the component is in loading state (overrides store loading)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
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
            "itemsPerPage": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Items per page for pagination"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "items-per-page",
                "defaultValue": "10"
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
                "defaultValue": "'Liquidity Pools'"
            }
        };
    }
    static get states() {
        return {
            "filteredPools": {},
            "currentPage": {},
            "totalPages": {},
            "filters": {},
            "storePools": {},
            "storeTokens": {},
            "storeLoading": {}
        };
    }
    static get events() {
        return [{
                "method": "poolSelected",
                "name": "poolSelected",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolInfo",
                    "resolved": "PoolInfo",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        }
                    }
                }
            }, {
                "method": "addLiquidity",
                "name": "addLiquidity",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolInfo",
                    "resolved": "PoolInfo",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        }
                    }
                }
            }, {
                "method": "removeLiquidity",
                "name": "removeLiquidity",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ pool: PoolInfo; position: UserPoolPosition }",
                    "resolved": "{ pool: PoolInfo; position: UserPoolPosition; }",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        },
                        "UserPoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/euclid-pools-list.tsx",
                            "id": "src/components/features/euclid-pools-list/euclid-pools-list.tsx::UserPoolPosition"
                        }
                    }
                }
            }, {
                "method": "stakeTokens",
                "name": "stakeTokens",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ pool: PoolInfo; position?: UserPoolPosition }",
                    "resolved": "{ pool: PoolInfo; position?: UserPoolPosition; }",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        },
                        "UserPoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/euclid-pools-list.tsx",
                            "id": "src/components/features/euclid-pools-list/euclid-pools-list.tsx::UserPoolPosition"
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
                    "original": "{ pool: PoolInfo; position: UserPoolPosition }",
                    "resolved": "{ pool: PoolInfo; position: UserPoolPosition; }",
                    "references": {
                        "PoolInfo": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::PoolInfo"
                        },
                        "UserPoolPosition": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/euclid-pools-list.tsx",
                            "id": "src/components/features/euclid-pools-list/euclid-pools-list.tsx::UserPoolPosition"
                        }
                    }
                }
            }, {
                "method": "filtersChanged",
                "name": "filtersChanged",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PoolFilters",
                    "resolved": "PoolFilters",
                    "references": {
                        "PoolFilters": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/euclid-pools-list.tsx",
                            "id": "src/components/features/euclid-pools-list/euclid-pools-list.tsx::PoolFilters"
                        }
                    }
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "pools",
                "methodName": "watchPoolsChange"
            }, {
                "propName": "positions",
                "methodName": "watchPositionsChange"
            }];
    }
}
//# sourceMappingURL=euclid-pools-list.js.map
