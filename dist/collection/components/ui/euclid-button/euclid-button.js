import { h, Host } from "@stencil/core";
export class EuclidButton {
    constructor() {
        this.variant = 'primary';
        this.size = 'md';
        this.loading = false;
        this.disabled = false;
        this.fullWidth = false;
        this.type = 'button';
        this.handleClick = (event) => {
            if (this.disabled || this.loading) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        };
    }
    render() {
        const classes = {
            'euclid-button': true,
            [`euclid-button--${this.variant}`]: true,
            [`euclid-button--${this.size}`]: true,
            'euclid-button--loading': this.loading,
            'euclid-button--disabled': this.disabled,
            'euclid-button--full-width': this.fullWidth,
        };
        const commonProps = {
            class: classes,
            disabled: this.disabled || this.loading,
            onClick: this.handleClick,
            'aria-busy': this.loading ? 'true' : 'false',
        };
        // If href is provided, render as a link
        if (this.href && !this.disabled && !this.loading) {
            return (h(Host, null, h("a", { href: this.href, class: classes, role: "button", "aria-busy": this.loading ? 'true' : 'false' }, this.loading && (h("span", { class: "euclid-button__spinner", "aria-hidden": "true" }, h("svg", { viewBox: "0 0 24 24", class: "euclid-button__spinner-icon" }, h("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", "stroke-width": "2", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "60", "stroke-dashoffset": "60" })))), h("span", { class: { 'euclid-button__content': true, 'euclid-button__content--hidden': this.loading } }, h("slot", null)))));
        }
        // Render as button
        return (h(Host, null, h("button", { type: this.type, ...commonProps }, this.loading && (h("span", { class: "euclid-button__spinner", "aria-hidden": "true" }, h("svg", { viewBox: "0 0 24 24", class: "euclid-button__spinner-icon" }, h("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", "stroke-width": "2", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "60", "stroke-dashoffset": "60" })))), h("span", { class: { 'euclid-button__content': true, 'euclid-button__content--hidden': this.loading } }, h("slot", null)))));
    }
    static get is() { return "euclid-button"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-button.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-button.css"]
        };
    }
    static get properties() {
        return {
            "variant": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ButtonVariant",
                    "resolved": "\"danger\" | \"ghost\" | \"primary\" | \"secondary\"",
                    "references": {
                        "ButtonVariant": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/ui/euclid-button/euclid-button.tsx",
                            "id": "src/components/ui/euclid-button/euclid-button.tsx::ButtonVariant"
                        }
                    }
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
                "attribute": "variant",
                "defaultValue": "'primary'"
            },
            "size": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ButtonSize",
                    "resolved": "\"lg\" | \"md\" | \"sm\"",
                    "references": {
                        "ButtonSize": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/ui/euclid-button/euclid-button.tsx",
                            "id": "src/components/ui/euclid-button/euclid-button.tsx::ButtonSize"
                        }
                    }
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
                "attribute": "size",
                "defaultValue": "'md'"
            },
            "loading": {
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
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
            },
            "disabled": {
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
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "fullWidth": {
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
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "full-width",
                "defaultValue": "false"
            },
            "type": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'button' | 'submit' | 'reset'",
                    "resolved": "\"button\" | \"reset\" | \"submit\"",
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
                "attribute": "type",
                "defaultValue": "'button'"
            },
            "href": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "href"
            }
        };
    }
}
//# sourceMappingURL=euclid-button.js.map
