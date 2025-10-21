import { h } from "@stencil/core";
import { marketStore } from "../../../store/market.store";
export class EuclidTokensList {
    constructor() {
        /**
         * Available tokens data (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokens = [];
        /**
         * Whether the component is in loading state (overrides store loading)
         */
        this.loading = false;
        /**
         * Items per page for pagination
         */
        this.itemsPerPage = 20;
        /**
         * Card title
         */
        this.cardTitle = 'Available Tokens';
        // Internal state
        this.filteredTokens = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            search: '',
            sortBy: 'name',
            sortOrder: 'asc',
            showFavorites: false,
            chainFilter: '',
        };
        // Store data (automatically synced)
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
        this.handleTokenClick = (token) => {
            this.tokenSelected.emit(token);
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic data updates
        this.syncWithStore();
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
            this.applyFilters();
        });
        // Initialize filters
        this.applyFilters();
    }
    syncWithStore() {
        // Use store data if available, fallback to props
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokens;
        this.storeLoading = marketStore.state.loading;
        // Debug logging
        console.log('🔄 Tokens store sync:', {
            storeTokens: this.storeTokens.length,
            storeLoading: this.storeLoading,
            marketStoreTokens: marketStore.state.tokens.length,
            marketStoreLoading: marketStore.state.loading
        });
    }
    watchTokensChange() {
        this.applyFilters();
    }
    applyFilters() {
        // Use store data first, fallback to props for backward compatibility
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        let filtered = [...activeTokens];
        // Apply search filter
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(token => token.displayName.toLowerCase().includes(searchLower) ||
                token.tokenId.toLowerCase().includes(searchLower) ||
                token.description?.toLowerCase().includes(searchLower));
        }
        // Apply chain filter
        if (this.filters.chainFilter) {
            filtered = filtered.filter(token => token.chain_uids?.includes(this.filters.chainFilter));
        }
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (this.filters.sortBy) {
                case 'name':
                    aValue = a.displayName.toLowerCase();
                    bValue = b.displayName.toLowerCase();
                    break;
                case 'price':
                    aValue = parseFloat(a.price || '0');
                    bValue = parseFloat(b.price || '0');
                    break;
                case 'volume':
                    aValue = a.total_volume_24h || 0;
                    bValue = b.total_volume_24h || 0;
                    break;
                case 'marketCap':
                    aValue = parseFloat(a.price || '0'); // Simplified - would be price * supply
                    bValue = parseFloat(b.price || '0');
                    break;
                default:
                    aValue = a.displayName.toLowerCase();
                    bValue = b.displayName.toLowerCase();
            }
            if (typeof aValue === 'string') {
                if (this.filters.sortOrder === 'asc') {
                    return aValue.localeCompare(bValue);
                }
                else {
                    return bValue.localeCompare(aValue);
                }
            }
            else {
                if (this.filters.sortOrder === 'asc') {
                    return aValue - bValue;
                }
                else {
                    return bValue - aValue;
                }
            }
        });
        // Update state only if changed
        const newFilteredLength = filtered.length;
        const currentFilteredLength = this.filteredTokens.length;
        const hasChanged = newFilteredLength !== currentFilteredLength ||
            !filtered.every((token, index) => this.filteredTokens[index]?.tokenId === token.tokenId);
        if (hasChanged) {
            this.filteredTokens = filtered;
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
    getPaginatedTokens() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredTokens.slice(startIndex, endIndex);
    }
    getUniqueChains() {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        const chains = new Set();
        activeTokens.forEach(token => {
            token.chain_uids?.forEach(chain => chains.add(chain));
        });
        return Array.from(chains).sort();
    }
    formatPrice(price) {
        if (!price || price === '0')
            return '$0.00';
        const numPrice = parseFloat(price);
        if (numPrice < 0.01)
            return `$${numPrice.toFixed(6)}`;
        if (numPrice < 1)
            return `$${numPrice.toFixed(4)}`;
        return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    formatVolume(volume) {
        if (volume >= 1e9)
            return `$${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e6)
            return `$${(volume / 1e6).toFixed(2)}M`;
        if (volume >= 1e3)
            return `$${(volume / 1e3).toFixed(2)}K`;
        return `$${volume.toFixed(2)}`;
    }
    render() {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        const isLoading = (this.storeLoading || this.loading) && activeTokens.length === 0;
        const paginatedTokens = this.getPaginatedTokens();
        const uniqueChains = this.getUniqueChains();
        console.log('🎨 Tokens render state:', {
            activeTokens: activeTokens.length,
            filteredTokens: this.filteredTokens.length,
            paginatedTokens: paginatedTokens.length,
            isLoading,
            storeLoading: this.storeLoading,
            loading: this.loading
        });
        return (h("div", { key: '050d62a50ee62befe09e53d54fafcdf73f452f9c', class: "tokens-list" }, h("div", { key: '5d37b31e73ea4191c11bdb2ad79f81d25fd862bc', class: "tokens-header" }, h("h3", { key: '5e35bad70cb21dc7190b7b699016cb7b4d09ecd0', class: "tokens-title" }, this.cardTitle)), h("tokens-filters", { key: '3140d4cf1b2a71efe741443e358d58a03a0d95f2', filters: this.filters, chains: uniqueChains, onFiltersChanged: this.handleFiltersChanged }), h("div", { key: '717658bacb32cfa0855ff2aa091ecdf9d9da48e0', class: "tokens-stats" }, h("div", { key: '5d64ad9d585ceb74326e2239ae8169c0db8aafe3', class: "stat-item" }, h("span", { key: 'a049adddef36f8d1cfe455b3275c68d2c1c0bbb7', class: "stat-label" }, "Total Tokens"), h("span", { key: 'bc9b5862fd2970fab105dbb6381888b1c65c33b0', class: "stat-value" }, activeTokens.length)), h("div", { key: '22289eb4727ea728baf83d267f4d0ba984fb3103', class: "stat-item" }, h("span", { key: '24ee411cc75bc636b280ba1cae61fed6e8d01b9f', class: "stat-label" }, "Filtered"), h("span", { key: '65c4e509beb3c0c9abbb7c40f7eddf587a8e5b62', class: "stat-value" }, this.filteredTokens.length)), h("div", { key: 'eb46ba0acbd0f5a9a579c498c56caf2c940142b1', class: "stat-item" }, h("span", { key: '06ef345e216f2eba90942c61e51ee439b4846725', class: "stat-label" }, "Chains"), h("span", { key: '9cd07b196a79629f05aba53e0f6865567cb9f350', class: "stat-value" }, uniqueChains.length))), h("div", { key: 'df1b3b2e67710a2fdce02163f4d488b2a26eee04', class: "tokens-content" }, isLoading ? (h("tokens-loading", { count: 6 })) : paginatedTokens.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No tokens found matching your criteria"))) : (h("div", { class: "tokens-grid" }, paginatedTokens.map(token => (h("token-item", { key: token.tokenId, token: token, onClick: () => this.handleTokenClick(token) })))))), this.totalPages > 1 && (h("div", { key: 'fafc78c6d6e2c827b73ea28ea5d6dd47b48460cf', class: "pagination" }, h("button", { key: '5c99abaf7fd87ac6f7e4828cd1620511467fd745', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage - 1), disabled: this.currentPage === 1, type: "button" }, "Previous"), h("div", { key: '138d3bd9639b99c96b07f005d02dc9c044cd8396', class: "pagination-pages" }, Array.from({ length: this.totalPages }, (_, i) => i + 1).map(page => (h("button", { key: page, class: {
                'pagination-page': true,
                'pagination-page--active': page === this.currentPage,
            }, onClick: () => this.handlePageChange(page), type: "button" }, page)))), h("button", { key: '812508668c82d531fd274cb8085e1880e41e3619', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage + 1), disabled: this.currentPage === this.totalPages, type: "button" }, "Next")))));
    }
    static get is() { return "euclid-tokens-list"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-tokens-list.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-tokens-list.css"]
        };
    }
    static get properties() {
        return {
            "tokens": {
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
                    "text": "Available tokens data (gets from market store automatically)"
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
                "defaultValue": "20"
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
                "defaultValue": "'Available Tokens'"
            }
        };
    }
    static get states() {
        return {
            "filteredTokens": {},
            "currentPage": {},
            "totalPages": {},
            "filters": {},
            "storeTokens": {},
            "storeLoading": {}
        };
    }
    static get events() {
        return [{
                "method": "tokenSelected",
                "name": "tokenSelected",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "TokenMetadata",
                    "resolved": "TokenMetadata",
                    "references": {
                        "TokenMetadata": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::TokenMetadata"
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
                    "original": "TokenFilters",
                    "resolved": "TokenFilters",
                    "references": {
                        "TokenFilters": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-tokens-list/euclid-tokens-list.tsx",
                            "id": "src/components/features/euclid-tokens-list/euclid-tokens-list.tsx::TokenFilters"
                        }
                    }
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "tokens",
                "methodName": "watchTokensChange"
            }];
    }
}
//# sourceMappingURL=euclid-tokens-list.js.map
