import { p as proxyCustomElement, H, h } from './p-neZz74Yz.js';

const poolsLoadingCss = ":host{display:block}.pools-loading{display:flex;flex-direction:column;gap:16px;padding:24px}.pool-skeleton{display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-xl)}.skeleton-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.skeleton-tokens{display:flex;align-items:center;gap:12px}.skeleton-avatar{width:32px;height:32px;border-radius:50%;background:var(--euclid-border);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}.skeleton-avatar-overlap{margin-left:-12px}.skeleton-text{background:var(--euclid-border);border-radius:var(--euclid-radius-sm);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}.skeleton-text-sm{height:12px;width:60px}.skeleton-text-md{height:16px;width:80px}.skeleton-text-lg{height:20px;width:120px}.skeleton-metrics{display:flex;gap:24px;align-items:center}.skeleton-metric{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.skeleton-actions{display:flex;gap:12px;align-items:center}.skeleton-button{height:36px;width:100px;background:var(--euclid-border);border-radius:var(--euclid-radius-lg);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}@media (max-width: 768px){.skeleton-header{flex-direction:column;gap:16px}.skeleton-metrics{width:100%;justify-content:space-between}.skeleton-metric{align-items:flex-start}.skeleton-actions{width:100%}.skeleton-button{flex:1}}";

const PoolsLoading = /*@__PURE__*/ proxyCustomElement(class PoolsLoading extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.count = 6;
    }
    render() {
        return (h("div", { key: 'c3e902a4016fe6c7a9870be9e9b2b53b4bc0e6e7', class: "pools-loading" }, Array.from({ length: this.count }, (_, i) => (h("div", { key: i, class: "pool-skeleton" }, h("div", { class: "skeleton-header" }, h("div", { class: "skeleton-tokens" }, h("div", { class: "skeleton-avatar" }), h("div", { class: "skeleton-avatar skeleton-avatar-overlap" }), h("div", { class: "skeleton-text skeleton-text-lg" })), h("div", { class: "skeleton-metrics" }, h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })))), h("div", { class: "skeleton-actions" }, h("div", { class: "skeleton-button" }), h("div", { class: "skeleton-button" })))))));
    }
    static get style() { return poolsLoadingCss; }
}, [257, "pools-loading", {
        "count": [2]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["pools-loading"];
    components.forEach(tagName => { switch (tagName) {
        case "pools-loading":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, PoolsLoading);
            }
            break;
    } });
}
defineCustomElement();

export { PoolsLoading as P, defineCustomElement as d };
//# sourceMappingURL=p-Bd_LDF0j.js.map

//# sourceMappingURL=p-Bd_LDF0j.js.map