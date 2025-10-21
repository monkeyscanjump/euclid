import { p as proxyCustomElement, H, h, e as Host } from './p-neZz74Yz.js';

const euclidButtonCss = ":host{display:inline-block}.euclid-button{display:inline-flex;align-items:center;justify-content:center;gap:var(--euclid-space-2);font-family:var(--euclid-font-sans);font-weight:var(--euclid-button-font-weight);text-decoration:none;cursor:pointer;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;transition:var(--euclid-button-transition);border:var(--euclid-border-1) solid transparent;border-radius:var(--euclid-button-border-radius);position:relative;overflow:hidden;outline:none;vertical-align:middle}.euclid-button:focus-visible{outline:2px solid var(--euclid-interactive-primary);outline-offset:2px}.euclid-button--sm{padding:var(--euclid-space-2) var(--euclid-space-3);font-size:var(--euclid-text-sm);min-height:var(--euclid-space-8);line-height:var(--euclid-leading-tight)}.euclid-button--md{padding:var(--euclid-space-3) var(--euclid-space-4);font-size:var(--euclid-text-base);min-height:var(--euclid-space-10);line-height:var(--euclid-leading-normal)}.euclid-button--lg{padding:var(--euclid-space-4) var(--euclid-space-6);font-size:var(--euclid-text-lg);min-height:var(--euclid-space-12);line-height:var(--euclid-leading-normal)}.euclid-button--primary{background-color:var(--euclid-interactive-primary);color:var(--euclid-text-inverse);box-shadow:var(--euclid-button-shadow)}.euclid-button--primary:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-interactive-primary-hover);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--primary:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-interactive-primary-active);transform:translateY(0);box-shadow:var(--euclid-button-shadow)}.euclid-button--secondary{background-color:var(--euclid-surface);color:var(--euclid-text-primary);border-color:var(--euclid-border);box-shadow:var(--euclid-button-shadow)}.euclid-button--secondary:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--secondary:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-background-secondary);transform:translateY(0)}.euclid-button--danger{background-color:var(--euclid-danger-600);color:var(--euclid-text-inverse);box-shadow:var(--euclid-button-shadow)}.euclid-button--danger:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-danger-700);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--danger:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-danger-700);transform:translateY(0);box-shadow:var(--euclid-button-shadow)}.euclid-button--ghost{background-color:transparent;color:var(--euclid-text-secondary);border-color:transparent}.euclid-button--ghost:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.euclid-button--ghost:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-background-secondary)}.euclid-button--disabled{opacity:0.5;cursor:not-allowed;transform:none !important;box-shadow:none !important}.euclid-button--loading{cursor:default;pointer-events:none}.euclid-button--full-width{width:100%}.euclid-button__content{display:flex;align-items:center;justify-content:center;gap:var(--euclid-space-2);transition:opacity var(--euclid-transition-fast)}.euclid-button__content--hidden{opacity:0}.euclid-button__spinner{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:flex;align-items:center;justify-content:center}.euclid-button__spinner-icon{width:1rem;height:1rem;animation:euclid-spin 1s linear infinite;border:2px solid currentColor;border-top-color:transparent;border-radius:var(--euclid-radius-full)}.euclid-button--sm .euclid-button__spinner-icon{width:0.875rem;height:0.875rem}.euclid-button--lg .euclid-button__spinner-icon{width:1.25rem;height:1.25rem}@media (prefers-contrast: high){.euclid-button{border-width:var(--euclid-border-2)}.euclid-button--primary{border-color:var(--euclid-interactive-primary)}.euclid-button--secondary{border-color:var(--euclid-text-primary)}.euclid-button--danger{border-color:var(--euclid-danger-600)}}@media (prefers-reduced-motion: reduce){.euclid-button{transition:none}.euclid-button:hover{transform:none}.euclid-button__spinner-icon{animation:none}}@media (pointer: coarse){.euclid-button--sm{min-height:var(--euclid-space-10);padding:var(--euclid-space-2_5) var(--euclid-space-4)}.euclid-button--md{min-height:var(--euclid-space-12);padding:var(--euclid-space-3_5) var(--euclid-space-5)}.euclid-button--lg{min-height:var(--euclid-space-16);padding:var(--euclid-space-5) var(--euclid-space-7)}}";

const EuclidButton = /*@__PURE__*/ proxyCustomElement(class EuclidButton extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
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
    static get style() { return euclidButtonCss; }
}, [257, "euclid-button", {
        "variant": [1],
        "size": [1],
        "loading": [4],
        "disabled": [4],
        "fullWidth": [4, "full-width"],
        "type": [1],
        "href": [1]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-button"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-button":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidButton);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidButton as E, defineCustomElement as d };
//# sourceMappingURL=p-bUJ-P9iR.js.map

//# sourceMappingURL=p-bUJ-P9iR.js.map