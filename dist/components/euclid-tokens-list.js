import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { m as marketStore } from './p-DYNFp3VG.js';
import { d as defineCustomElement$4 } from './p-clJpddiK.js';
import { d as defineCustomElement$3 } from './p-2xgk3ePm.js';
import { d as defineCustomElement$2 } from './p-DjSA_Cqg.js';

const euclidTokensListCss = ":host{display:block}.tokens-list{display:flex;flex-direction:column;gap:24px;padding:24px;background:var(--euclid-surface);border-radius:var(--euclid-radius-xl);border:1px solid var(--euclid-border)}.tokens-header{display:flex;justify-content:space-between;align-items:center}.tokens-title{margin:0;font-size:24px;font-weight:700;color:var(--euclid-text-primary)}.tokens-stats{display:flex;gap:32px;padding:16px 20px;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);border:1px solid var(--euclid-border)}.stat-item{display:flex;flex-direction:column;gap:4px;text-align:center}.stat-label{font-size:12px;color:var(--euclid-text-secondary);text-transform:uppercase;letter-spacing:0.5px;font-weight:500}.stat-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.tokens-content{min-height:400px}.tokens-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:16px}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:60px 20px;text-align:center;color:var(--euclid-text-secondary)}.empty-state svg{width:64px;height:64px;opacity:0.5}.empty-state span{font-size:16px;font-weight:500}.pagination{display:flex;justify-content:center;align-items:center;gap:8px;padding:20px 0}.pagination-btn{padding:8px 16px;border:1px solid var(--euclid-border);background:var(--euclid-surface);color:var(--euclid-text-primary);border-radius:var(--euclid-radius-md);cursor:pointer;font-weight:500;transition:all 0.2s ease}.pagination-btn:hover:not(:disabled){background:var(--euclid-surface-hover);border-color:var(--euclid-border-hover)}.pagination-btn:disabled{opacity:0.5;cursor:not-allowed}.pagination-pages{display:flex;gap:4px}.pagination-page{width:40px;height:40px;border:1px solid var(--euclid-border);background:var(--euclid-surface);color:var(--euclid-text-primary);border-radius:var(--euclid-radius-md);cursor:pointer;font-weight:500;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center}.pagination-page:hover{background:var(--euclid-surface-hover);border-color:var(--euclid-border-hover)}.pagination-page--active{background:var(--euclid-primary);color:white;border-color:var(--euclid-primary)}@media (max-width: 768px){.tokens-list{padding:16px;gap:16px}.tokens-stats{gap:16px;padding:12px 16px}.tokens-grid{grid-template-columns:1fr;gap:12px}.pagination{flex-wrap:wrap;gap:4px}.pagination-btn{padding:6px 12px;font-size:14px}.pagination-page{width:36px;height:36px}}";

const EuclidTokensList$1 = /*@__PURE__*/ proxyCustomElement(class EuclidTokensList extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.tokenSelected = createEvent(this, "tokenSelected");
        this.filtersChanged = createEvent(this, "filtersChanged");
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
    static get watchers() { return {
        "tokens": ["watchTokensChange"]
    }; }
    static get style() { return euclidTokensListCss; }
}, [257, "euclid-tokens-list", {
        "tokens": [16],
        "loading": [4],
        "itemsPerPage": [2, "items-per-page"],
        "cardTitle": [1, "card-title"],
        "filteredTokens": [32],
        "currentPage": [32],
        "totalPages": [32],
        "filters": [32],
        "storeTokens": [32],
        "storeLoading": [32]
    }, undefined, {
        "tokens": ["watchTokensChange"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-tokens-list", "token-item", "tokens-filters", "tokens-loading"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-tokens-list":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidTokensList$1);
            }
            break;
        case "token-item":
            if (!customElements.get(tagName)) {
                defineCustomElement$4();
            }
            break;
        case "tokens-filters":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "tokens-loading":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const EuclidTokensList = EuclidTokensList$1;
const defineCustomElement = defineCustomElement$1;

export { EuclidTokensList, defineCustomElement };
//# sourceMappingURL=euclid-tokens-list.js.map

//# sourceMappingURL=euclid-tokens-list.js.map