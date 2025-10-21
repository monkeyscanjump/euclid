import { h } from "@stencil/core";
export class PoolsFilters {
    constructor() {
        this.walletAddress = '';
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
        this.handleMyPoolsToggle = () => {
            this.filtersChanged.emit({ ...this.filters, showMyPools: !this.filters.showMyPools });
        };
        this.clearFilters = () => {
            this.filtersChanged.emit({
                search: '',
                sortBy: 'apr',
                sortOrder: 'desc',
                showMyPools: false,
            });
        };
    }
    render() {
        const hasWallet = !!this.walletAddress;
        return (h("div", { key: '2d0096cb0e241fc1e7950cecb2f29eb302a23865', class: "pools-filters" }, h("input", { key: '9efdb1848a2441ba966a7ccc8f55ab6fa6c60c39', class: "search-input", type: "text", placeholder: "Search pools by token name...", value: this.filters.search, onInput: this.handleSearchChange }), h("select", { key: 'b8f7946435df62757758cfddf821dedf2407c6d6', class: "sort-select", onChange: this.handleSortChange }, h("option", { key: 'f3c0d129fc6b32934c9e037b68bf62af3309ee90', value: "apr", selected: this.filters.sortBy === 'apr' }, "APR (High to Low)"), h("option", { key: '7005cc3d189a26f79aae5d800df63231757c9e36', value: "tvl", selected: this.filters.sortBy === 'tvl' }, "TVL (High to Low)"), h("option", { key: '3e52d1332f5910922514ff51ac0e7a563ad65671', value: "volume", selected: this.filters.sortBy === 'volume' }, "Volume (High to Low)"), h("option", { key: '5c97b975a46ed88f54ad77446b583295acca2656', value: "fees", selected: this.filters.sortBy === 'fees' }, "Fees (High to Low)"), hasWallet && h("option", { key: '9c8d8a6d974381eca35411cb7352582eb0915e9c', value: "myLiquidity", selected: this.filters.sortBy === 'myLiquidity' }, "My Liquidity")), hasWallet && (h("label", { key: 'ede2b36982cb925f15c31fcf41b07ef500073764', class: "my-pools-checkbox" }, h("input", { key: 'd8983f3a28068d065e1eab71aebc0dfc789da944', type: "checkbox", checked: this.filters.showMyPools, onChange: this.handleMyPoolsToggle }), "My Pools Only"))));
    }
    static get is() { return "pools-filters"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["pools-filters.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["pools-filters.css"]
        };
    }
    static get properties() {
        return {
            "filters": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "PoolFilters",
                    "resolved": "PoolFilters",
                    "references": {
                        "PoolFilters": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/pools-filters.tsx",
                            "id": "src/components/features/euclid-pools-list/pools-filters.tsx::PoolFilters"
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
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "wallet-address",
                "defaultValue": "''"
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
                    "original": "PoolFilters",
                    "resolved": "PoolFilters",
                    "references": {
                        "PoolFilters": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-pools-list/pools-filters.tsx",
                            "id": "src/components/features/euclid-pools-list/pools-filters.tsx::PoolFilters"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=pools-filters.js.map
