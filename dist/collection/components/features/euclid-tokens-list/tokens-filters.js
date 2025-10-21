import { h } from "@stencil/core";
export class TokensFilters {
    constructor() {
        this.chains = [];
        this.handleSearchChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({ ...this.filters, search: target.value });
        };
        this.handleSortChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({
                ...this.filters,
                sortBy: target.value
            });
        };
        this.handleChainChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({ ...this.filters, chainFilter: target.value });
        };
    }
    render() {
        return (h("div", { key: 'cfbaf1e8b8fd0afd51f507d5b6f16d432e1df21c', class: "tokens-filters" }, h("input", { key: 'ba819794b9ad6736a936bf02b1ea620a89d9c79a', class: "search-input", type: "text", placeholder: "Search tokens by name or symbol...", value: this.filters.search, onInput: this.handleSearchChange }), h("select", { key: '7fc0c54ef762143fecbe7f50f46df8a528fca805', class: "sort-select", onChange: this.handleSortChange }, h("option", { key: 'beac1b7a37c6fc6e7116ae01ecd8d39bc51ea7f2', value: "name", selected: this.filters.sortBy === 'name' }, "Name (A-Z)"), h("option", { key: '5c9cf975621e7857f2d6b3bd83a7af1fd67f9c5e', value: "price", selected: this.filters.sortBy === 'price' }, "Price (High to Low)"), h("option", { key: '4b6fbaefdbb9b53ae8360063ff0b3f805d0052fb', value: "volume", selected: this.filters.sortBy === 'volume' }, "Volume (High to Low)"), h("option", { key: '3ecfbb4083f5f14172447e29be61b91090dc907f', value: "marketCap", selected: this.filters.sortBy === 'marketCap' }, "Market Cap")), this.chains.length > 0 && (h("select", { key: '5b5dd7885cec695c00fc75e07fe4cf96acfd69ca', class: "chain-select", onChange: this.handleChainChange }, h("option", { key: 'bffc5dcaf48e9b9bfb679391a51831035fededdd', value: "", selected: this.filters.chainFilter === '' }, "All Chains"), this.chains.map(chain => (h("option", { key: chain, value: chain, selected: this.filters.chainFilter === chain }, chain)))))));
    }
    static get is() { return "tokens-filters"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["tokens-filters.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["tokens-filters.css"]
        };
    }
    static get properties() {
        return {
            "filters": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TokenFilters",
                    "resolved": "TokenFilters",
                    "references": {
                        "TokenFilters": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-tokens-list/tokens-filters.tsx",
                            "id": "src/components/features/euclid-tokens-list/tokens-filters.tsx::TokenFilters"
                        }
                    }
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "chains": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "string[]",
                    "resolved": "string[]",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            }
        };
    }
    static get events() {
        return [{
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
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-tokens-list/tokens-filters.tsx",
                            "id": "src/components/features/euclid-tokens-list/tokens-filters.tsx::TokenFilters"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=tokens-filters.js.map
