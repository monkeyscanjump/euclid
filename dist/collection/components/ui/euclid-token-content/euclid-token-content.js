import { h } from "@stencil/core";
import { appStore } from "../../../store/app.store";
import { marketStore } from "../../../store/market.store";
export class EuclidTokenContent {
    constructor() {
        this.searchQuery = '';
        this.storeTokens = [];
        this.storeLoading = false;
        this.filteredTokens = [];
        this.handleSearchInput = (event) => {
            const target = event.target;
            this.searchQuery = target.value || '';
            this.updateFilteredTokens();
        };
        this.handleTokenSelect = (token) => {
            const selectorType = appStore.state.tokenSelectorType || 'input';
            this.tokenSelect.emit({
                token,
                selectorType
            });
            appStore.closeTokenModal();
        };
    }
    componentWillLoad() {
        this.syncWithStore();
    }
    componentDidLoad() {
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
    }
    syncWithStore() {
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
        this.storeLoading = marketStore.state.loading;
        this.updateFilteredTokens();
    }
    convertStoreTokenToTokenInfo(token) {
        return {
            tokenId: token.tokenId,
            symbol: token.symbol || token.displayName.toUpperCase(),
            name: token.displayName,
            decimals: token.coinDecimal,
            logoUrl: token.logo || token.image,
            balance: '0', // Would need to fetch from wallet
            displayName: token.displayName,
            coinDecimal: token.coinDecimal,
            chain_uid: token.chain_uid || token.chain_uids?.[0] || '',
            chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
            address: token.address || token.tokenId,
            logo: token.logo || token.image,
            price: token.price ? parseFloat(token.price) : undefined,
            priceUsd: token.price,
        };
    }
    getAvailableTokens() {
        return this.storeTokens.map(token => this.convertStoreTokenToTokenInfo(token));
    }
    updateFilteredTokens() {
        let tokens = this.getAvailableTokens();
        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            tokens = tokens.filter(token => token.symbol.toLowerCase().includes(query) ||
                token.name.toLowerCase().includes(query) ||
                (token.address && token.address.toLowerCase().includes(query)));
        }
        // Sort tokens: those with balances first, then by market cap/price
        tokens.sort((a, b) => {
            const balanceA = parseFloat(a.balance || '0');
            const balanceB = parseFloat(b.balance || '0');
            // Prioritize tokens with balances
            if (balanceA > 0 && balanceB === 0)
                return -1;
            if (balanceA === 0 && balanceB > 0)
                return 1;
            // Then sort by price (higher first)
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            if (priceA !== priceB)
                return priceB - priceA;
            // Finally alphabetically
            return a.symbol.localeCompare(b.symbol);
        });
        this.filteredTokens = tokens;
    }
    render() {
        // Show loading only if we're loading AND don't have tokens yet
        const isLoading = this.storeLoading && this.storeTokens.length === 0;
        return (h("div", { key: '53ce19e56ea47206d417d9a2400664b5a7a5b20b', class: "token-content" }, h("div", { key: '64d7ec6ed2ebb3d275a1d7d88e271e6fcd07a143', class: "search-section" }, h("div", { key: '672bf6ba1cab8061c03fcfc93f7431022ff57ac9', class: "search-input-container" }, h("svg", { key: '9b8cc389149d64e2b22c538452e6a1ab9dbc0f5d', class: "search-icon", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: '7a5deb8aa8b63167540a8d6813675ba5bfe7f8a0', d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" })), h("input", { key: 'f5e82fd1abbb66389da77bba5db07b700ad75c98', type: "text", class: "search-input", placeholder: "Search tokens...", value: this.searchQuery, onInput: this.handleSearchInput }))), isLoading ? (h("div", { class: "loading-state" }, h("div", { class: "loading-spinner" }), h("span", null, "Loading tokens..."))) : this.filteredTokens.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No tokens found"))) : (h("div", { class: "token-list" }, this.filteredTokens.map(token => (h("button", { key: token.tokenId, class: "token-item", onClick: () => this.handleTokenSelect(token), type: "button" }, h("div", { class: "token-logo" }, token.logoUrl ? (h("img", { src: token.logoUrl, alt: token.symbol })) : (token.symbol.substring(0, 2).toUpperCase())), h("div", { class: "token-info" }, h("div", { class: "token-symbol" }, token.symbol), h("div", { class: "token-name" }, token.name)), token.balance && parseFloat(token.balance) > 0 && (h("div", { class: "token-balance" }, this.formatBalance(token.balance))))))))));
    }
    formatBalance(balance) {
        const num = parseFloat(balance || '0');
        if (isNaN(num) || num === 0)
            return '0';
        if (num < 0.001)
            return '<0.001';
        if (num < 1)
            return num.toFixed(6);
        if (num < 1000)
            return num.toFixed(3);
        if (num < 1000000)
            return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }
    static get is() { return "euclid-token-content"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-token-content.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-token-content.css"]
        };
    }
    static get states() {
        return {
            "searchQuery": {},
            "storeTokens": {},
            "storeLoading": {},
            "filteredTokens": {}
        };
    }
    static get events() {
        return [{
                "method": "tokenSelect",
                "name": "tokenSelect",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\n    token: TokenInfo;\n    selectorType: 'input' | 'output';\n  }",
                    "resolved": "{ token: TokenInfo; selectorType: \"input\" | \"output\"; }",
                    "references": {
                        "TokenInfo": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/ui/euclid-token-content/euclid-token-content.tsx",
                            "id": "src/components/ui/euclid-token-content/euclid-token-content.tsx::TokenInfo"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=euclid-token-content.js.map
