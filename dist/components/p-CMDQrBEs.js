import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';

const poolsFiltersCss = ":host{display:block}.pools-filters{background:var(--euclid-surface);border-bottom:1px solid var(--euclid-border)}.filters-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;gap:16px}.search-container{flex:1;max-width:400px}.search-input{width:100%;padding:12px 16px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-size:14px;background:var(--euclid-surface);color:var(--euclid-text-primary);transition:border-color 0.2s ease}.search-input:focus{outline:none;border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1)}.search-input::placeholder{color:var(--euclid-text-secondary)}.filter-toggle{display:flex;align-items:center;gap:8px;padding:12px 16px;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;transition:all 0.2s ease;font-size:14px;font-weight:500}.filter-toggle:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.filter-toggle svg{width:16px;height:16px}.filters-panel{padding:20px 24px;background:var(--euclid-surface-secondary);border-top:1px solid var(--euclid-border);animation:slideDown 0.2s ease-out}@keyframes slideDown{from{max-height:0;padding-top:0;padding-bottom:0}to{max-height:200px;padding-top:20px;padding-bottom:20px}}.filters-row{display:flex;gap:20px;margin-bottom:16px;align-items:flex-end}.filters-row:last-child{margin-bottom:0}.filter-group{flex:1;min-width:200px}.filter-label{display:block;margin-bottom:8px;font-size:14px;font-weight:500;color:var(--euclid-text-primary)}.filter-select{width:100%;padding:10px 12px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-size:14px;background:var(--euclid-surface);color:var(--euclid-text-primary);transition:border-color 0.2s ease}.filter-select:focus{outline:none;border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1)}.filter-toggles{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.toggle-label{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--euclid-text-secondary);cursor:pointer;user-select:none}.toggle-label input[type=\"checkbox\"]{width:16px;height:16px;accent-color:var(--euclid-interactive-primary)}.clear-btn{padding:8px 16px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s ease}.clear-btn:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}@media (max-width: 768px){.filters-header{flex-direction:column;gap:12px}.search-container{max-width:none}.filters-row{flex-direction:column;gap:16px}.filter-group{min-width:auto}.filter-toggles{gap:16px}}";

const PoolsFilters = /*@__PURE__*/ proxyCustomElement(class PoolsFilters extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.filtersChanged = createEvent(this, "filtersChanged");
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
    static get style() { return poolsFiltersCss; }
}, [257, "pools-filters", {
        "filters": [16],
        "walletAddress": [1, "wallet-address"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["pools-filters"];
    components.forEach(tagName => { switch (tagName) {
        case "pools-filters":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, PoolsFilters);
            }
            break;
    } });
}
defineCustomElement();

export { PoolsFilters as P, defineCustomElement as d };
//# sourceMappingURL=p-CMDQrBEs.js.map

//# sourceMappingURL=p-CMDQrBEs.js.map