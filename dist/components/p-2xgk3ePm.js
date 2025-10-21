import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';

const tokensFiltersCss = ":host{display:block}.tokens-filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.search-input,.sort-select,.chain-select{padding:12px 16px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:14px;transition:all 0.2s ease}.search-input{flex:1;min-width:200px}.search-input:focus,.sort-select:focus,.chain-select:focus{outline:none;border-color:var(--euclid-primary);box-shadow:0 0 0 3px var(--euclid-primary-alpha)}.search-input::placeholder{color:var(--euclid-text-secondary)}.sort-select,.chain-select{min-width:140px;cursor:pointer}.sort-select:hover,.chain-select:hover{border-color:var(--euclid-border-hover)}@media (max-width: 768px){.tokens-filters{flex-direction:column;align-items:stretch;gap:8px}.search-input{min-width:auto}.sort-select,.chain-select{min-width:auto}}";

const TokensFilters = /*@__PURE__*/ proxyCustomElement(class TokensFilters extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.filtersChanged = createEvent(this, "filtersChanged");
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
    static get style() { return tokensFiltersCss; }
}, [257, "tokens-filters", {
        "filters": [16],
        "chains": [16]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["tokens-filters"];
    components.forEach(tagName => { switch (tagName) {
        case "tokens-filters":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, TokensFilters);
            }
            break;
    } });
}
defineCustomElement();

export { TokensFilters as T, defineCustomElement as d };
//# sourceMappingURL=p-2xgk3ePm.js.map

//# sourceMappingURL=p-2xgk3ePm.js.map