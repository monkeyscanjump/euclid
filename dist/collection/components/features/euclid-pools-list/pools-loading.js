import { h } from "@stencil/core";
export class PoolsLoading {
    constructor() {
        this.count = 6;
    }
    render() {
        return (h("div", { key: 'c3e902a4016fe6c7a9870be9e9b2b53b4bc0e6e7', class: "pools-loading" }, Array.from({ length: this.count }, (_, i) => (h("div", { key: i, class: "pool-skeleton" }, h("div", { class: "skeleton-header" }, h("div", { class: "skeleton-tokens" }, h("div", { class: "skeleton-avatar" }), h("div", { class: "skeleton-avatar skeleton-avatar-overlap" }), h("div", { class: "skeleton-text skeleton-text-lg" })), h("div", { class: "skeleton-metrics" }, h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })))), h("div", { class: "skeleton-actions" }, h("div", { class: "skeleton-button" }), h("div", { class: "skeleton-button" })))))));
    }
    static get is() { return "pools-loading"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["pools-loading.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["pools-loading.css"]
        };
    }
    static get properties() {
        return {
            "count": {
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
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "count",
                "defaultValue": "6"
            }
        };
    }
}
//# sourceMappingURL=pools-loading.js.map
