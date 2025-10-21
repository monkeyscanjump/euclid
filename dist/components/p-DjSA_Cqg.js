import { p as proxyCustomElement, H, h } from './p-neZz74Yz.js';

const tokensLoadingCss = ":host{display:block}.tokens-loading{padding:20px 0}.tokens-skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:16px}.token-skeleton{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);padding:20px;position:relative;overflow:hidden}.token-skeleton::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(\n    90deg,\n    transparent,\n    rgba(255, 255, 255, 0.08),\n    transparent\n  );animation:shimmer 1.5s infinite ease-in-out}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}.token-skeleton__content{display:flex;flex-direction:column;gap:16px}.token-skeleton__header{display:flex;align-items:center;gap:12px}.token-skeleton__icon{width:40px;height:40px;border-radius:50%;background:var(--euclid-skeleton);flex-shrink:0}.token-skeleton__info{flex:1;display:flex;flex-direction:column;gap:8px}.token-skeleton__line{height:16px;background:var(--euclid-skeleton);border-radius:4px}.token-skeleton__line--title{width:80%;height:18px}.token-skeleton__line--subtitle{width:60%;height:14px}.token-skeleton__line--small{width:40%;height:12px}.token-skeleton__line--medium{width:70%;height:16px}.token-skeleton__stats{display:flex;justify-content:space-between;gap:16px}.token-skeleton__stat{flex:1;display:flex;flex-direction:column;gap:6px}.token-skeleton__tags{display:flex;gap:8px;flex-wrap:wrap}.token-skeleton__tag{width:60px;height:24px;background:var(--euclid-skeleton);border-radius:12px}@media (prefers-color-scheme: dark){.token-skeleton::before{background:linear-gradient(\n      90deg,\n      transparent,\n      rgba(255, 255, 255, 0.05),\n      transparent\n    )}}@media (max-width: 768px){.tokens-skeleton-grid{grid-template-columns:1fr;gap:12px}.token-skeleton{padding:16px}.token-skeleton__content{gap:12px}.token-skeleton__header{gap:10px}.token-skeleton__icon{width:32px;height:32px}}";

const TokensLoading = /*@__PURE__*/ proxyCustomElement(class TokensLoading extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        /**
         * Number of skeleton cards to show
         */
        this.count = 8;
        /**
         * Whether to show the loading state
         */
        this.show = true;
    }
    renderSkeletonCard() {
        return (h("div", { class: "token-skeleton" }, h("div", { class: "token-skeleton__content" }, h("div", { class: "token-skeleton__header" }, h("div", { class: "token-skeleton__icon" }), h("div", { class: "token-skeleton__info" }, h("div", { class: "token-skeleton__line token-skeleton__line--title" }), h("div", { class: "token-skeleton__line token-skeleton__line--subtitle" }))), h("div", { class: "token-skeleton__stats" }, h("div", { class: "token-skeleton__stat" }, h("div", { class: "token-skeleton__line token-skeleton__line--small" }), h("div", { class: "token-skeleton__line token-skeleton__line--medium" })), h("div", { class: "token-skeleton__stat" }, h("div", { class: "token-skeleton__line token-skeleton__line--small" }), h("div", { class: "token-skeleton__line token-skeleton__line--medium" }))), h("div", { class: "token-skeleton__tags" }, h("div", { class: "token-skeleton__tag" }), h("div", { class: "token-skeleton__tag" })))));
    }
    render() {
        if (!this.show) {
            return null;
        }
        return (h("div", { class: "tokens-loading" }, h("div", { class: "tokens-skeleton-grid" }, Array.from({ length: this.count }, (_, index) => (h("div", { key: index }, this.renderSkeletonCard()))))));
    }
    static get style() { return tokensLoadingCss; }
}, [257, "tokens-loading", {
        "count": [2],
        "show": [4]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["tokens-loading"];
    components.forEach(tagName => { switch (tagName) {
        case "tokens-loading":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, TokensLoading);
            }
            break;
    } });
}
defineCustomElement();

export { TokensLoading as T, defineCustomElement as d };
//# sourceMappingURL=p-DjSA_Cqg.js.map

//# sourceMappingURL=p-DjSA_Cqg.js.map