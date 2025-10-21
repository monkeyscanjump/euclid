import { h } from "@stencil/core";
export class TokensLoading {
    constructor() {
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
    static get is() { return "tokens-loading"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["tokens-loading.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["tokens-loading.css"]
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
                    "text": "Number of skeleton cards to show"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "count",
                "defaultValue": "8"
            },
            "show": {
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
                    "text": "Whether to show the loading state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show",
                "defaultValue": "true"
            }
        };
    }
}
//# sourceMappingURL=tokens-loading.js.map
