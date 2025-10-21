import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';

const euclidTokenInputCss = ":host{display:block;width:100%}.token-input-wrapper{width:100%}.token-input-label{display:block;font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-medium);color:var(--euclid-text-secondary);margin-bottom:var(--euclid-space-2)}.token-input{position:relative;background:var(--euclid-surface);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);transition:all var(--euclid-transition-fast);overflow:hidden}.token-input:hover:not(.token-input--disabled){border-color:var(--euclid-border-hover)}.token-input--focused{border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(37, 99, 235, 0.1)}.token-input--disabled{background:var(--euclid-surface-secondary);border-color:var(--euclid-border);opacity:0.6;cursor:not-allowed}.token-input--error{border-color:var(--euclid-danger-500);box-shadow:0 0 0 3px rgba(239, 68, 68, 0.1)}.token-input--loading{pointer-events:none}.token-input-main{display:flex;align-items:center;min-height:3.5rem;padding:var(--euclid-space-3) var(--euclid-space-4)}.input-section{flex:1;position:relative;display:flex;align-items:center}.amount-input{width:100%;background:transparent;border:none;outline:none;font-size:var(--euclid-text-lg);font-weight:var(--euclid-font-medium);color:var(--euclid-text-primary);padding:0;margin:0}.amount-input::placeholder{color:var(--euclid-text-muted);font-weight:var(--euclid-font-normal)}.amount-input:disabled{cursor:not-allowed}.loading-spinner{position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem}.spinner{width:1rem;height:1rem;border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite}.token-selector{display:flex;align-items:center;margin-left:var(--euclid-space-4);padding:var(--euclid-space-2) var(--euclid-space-3);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);transition:all var(--euclid-transition-fast);min-width:120px;justify-content:center}.token-selector--clickable{cursor:pointer}.token-selector--clickable:hover:not(.token-selector--empty){background:var(--euclid-surface-secondary);transform:translateY(-1px)}.token-selector--empty{border-style:dashed;color:var(--euclid-text-muted)}.token-selector--clickable.token-selector--empty:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-interactive-primary);color:var(--euclid-interactive-primary)}.token-info{display:flex;align-items:center;gap:var(--euclid-space-2);font-weight:var(--euclid-font-medium);color:var(--euclid-text-primary)}.token-logo{width:var(--euclid-space-6);height:var(--euclid-space-6);border-radius:50%;background:var(--euclid-surface-secondary)}.token-symbol{font-size:var(--euclid-text-base);font-weight:var(--euclid-font-semibold)}.select-token{display:flex;align-items:center;gap:var(--euclid-space-2);font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-medium)}.chevron-icon{width:1rem;height:1rem;transition:transform var(--euclid-transition-fast);color:var(--euclid-text-muted)}.token-selector--clickable:hover .chevron-icon{color:var(--euclid-interactive-primary);transform:translateY(1px)}.token-input-footer{display:flex;align-items:center;justify-content:space-between;padding:var(--euclid-space-2) var(--euclid-space-4);background:var(--euclid-surface-secondary);border-top:1px solid var(--euclid-border)}.balance-section{display:flex;align-items:center;gap:var(--euclid-space-1);font-size:var(--euclid-text-sm)}.balance-label{color:var(--euclid-text-secondary);font-weight:var(--euclid-font-normal)}.balance-value{color:var(--euclid-text-primary);font-weight:var(--euclid-font-medium)}.max-button{padding:var(--euclid-space-1) var(--euclid-space-3);background:var(--euclid-interactive-primary);color:var(--euclid-white);border:none;border-radius:var(--euclid-radius-lg);font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-semibold);cursor:pointer;transition:all var(--euclid-transition-fast)}.max-button:hover:not(:disabled){background:var(--euclid-interactive-primary-hover);transform:translateY(-1px)}.max-button:active:not(:disabled){transform:translateY(0)}.max-button:disabled{background:var(--euclid-text-muted);cursor:not-allowed;transform:none}.error-message{margin-top:var(--euclid-space-2);font-size:var(--euclid-text-sm);color:var(--euclid-danger-500);font-weight:var(--euclid-font-medium)}@media (max-width: 640px){.token-input-main{min-height:3rem;flex-direction:column;align-items:stretch;gap:var(--euclid-space-3)}.input-section{order:2}.token-selector{order:1;margin-left:0;justify-content:flex-start}}@media (prefers-reduced-motion: reduce){.token-selector,.max-button,.spinner,.chevron-icon{animation:none !important;transition:none !important}}.token-selector--clickable:focus-visible,.max-button:focus-visible{outline:2px solid var(--euclid-interactive-primary);outline-offset:2px}.amount-input:focus-visible{outline:none}@media (prefers-color-scheme: dark){:host{--gray-100:#212529;--gray-200:#343a40;--gray-300:#495057;--gray-400:#6c757d;--gray-500:#adb5bd;--gray-600:#ced4da;--gray-700:#dee2e6;--gray-800:#e9ecef;--gray-900:#f8f9fa;--white-color:#212529;--dark-color:#f8f9fa}}.token-input-wrapper{width:100%}.token-input-label{display:block;font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);color:var(--gray-700);margin-bottom:0.5rem}.token-input{position:relative;background:var(--white-color);border:2px solid var(--gray-300);border-radius:var(--border-radius-lg);transition:all var(--transition-fast);overflow:hidden}.token-input:hover:not(.token-input--disabled){border-color:var(--gray-400)}.token-input--focused{border-color:var(--primary-color);box-shadow:0 0 0 3px rgba(0, 123, 255, 0.1)}.token-input--disabled{background:var(--gray-100);border-color:var(--gray-200);opacity:0.6;cursor:not-allowed}.token-input--error{border-color:var(--danger-color);box-shadow:0 0 0 3px rgba(220, 53, 69, 0.1)}.token-input--loading{pointer-events:none}.token-input-main{display:flex;align-items:center;min-height:3.5rem;padding:0.75rem 1rem}.input-section{flex:1;position:relative;display:flex;align-items:center}.amount-input{width:100%;background:transparent;border:none;outline:none;font-size:var(--font-size-lg);font-weight:var(--font-weight-medium);color:var(--gray-900);padding:0;margin:0}.amount-input::placeholder{color:var(--gray-400);font-weight:var(--font-weight-normal)}.amount-input:disabled{cursor:not-allowed}.loading-spinner{position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem}.spinner{width:1rem;height:1rem;border:2px solid var(--gray-300);border-top:2px solid var(--primary-color);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.token-selector{display:flex;align-items:center;margin-left:1rem;padding:0.5rem 0.75rem;border-radius:var(--border-radius);background:var(--gray-100);border:1px solid var(--gray-200);transition:all var(--transition-fast);min-width:120px;justify-content:center}.token-selector--clickable{cursor:pointer}.token-selector--clickable:hover:not(.token-selector--empty){background:var(--gray-200);transform:translateY(-1px)}.token-selector--empty{border-style:dashed;color:var(--gray-500)}.token-selector--clickable.token-selector--empty:hover{background:var(--gray-200);border-color:var(--primary-color);color:var(--primary-color)}.token-info{display:flex;align-items:center;gap:0.5rem;font-weight:var(--font-weight-medium);color:var(--gray-900)}.token-logo{width:1.5rem;height:1.5rem;border-radius:50%;background:var(--gray-200)}.token-symbol{font-size:var(--font-size-base);font-weight:var(--font-weight-semibold)}.select-token{display:flex;align-items:center;gap:0.5rem;font-size:var(--font-size-sm);font-weight:var(--font-weight-medium)}.chevron-icon{width:1rem;height:1rem;transition:transform var(--transition-fast);color:var(--gray-500)}.token-selector--clickable:hover .chevron-icon{color:var(--primary-color);transform:translateY(1px)}.token-input-footer{display:flex;align-items:center;justify-content:space-between;padding:0.5rem 1rem;background:var(--gray-50);border-top:1px solid var(--gray-200)}@media (prefers-color-scheme: dark){.token-input-footer{background:var(--gray-200)}}.balance-section{display:flex;align-items:center;gap:0.25rem;font-size:var(--font-size-sm)}.balance-label{color:var(--gray-600);font-weight:var(--font-weight-normal)}.balance-value{color:var(--gray-900);font-weight:var(--font-weight-medium)}.max-button{padding:0.25rem 0.75rem;background:var(--primary-color);color:var(--white-color);border:none;border-radius:var(--border-radius);font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);cursor:pointer;transition:all var(--transition-fast)}.max-button:hover:not(:disabled){background:var(--primary-color-dark);transform:translateY(-1px)}.max-button:active:not(:disabled){transform:translateY(0)}.max-button:disabled{background:var(--gray-400);cursor:not-allowed;transform:none}.error-message{margin-top:0.5rem;font-size:var(--font-size-sm);color:var(--danger-color);font-weight:var(--font-weight-medium)}@media (max-width: 640px){.token-input-main{flex-direction:column;align-items:stretch;gap:0.75rem;padding:1rem}.input-section{order:2}.token-selector{order:1;margin-left:0;justify-content:space-between;min-width:auto}.token-input-footer{flex-direction:column;gap:0.5rem;align-items:stretch}.balance-section{justify-content:center}.max-button{align-self:stretch}}@media (prefers-contrast: high){.token-input{border-width:3px}.token-input--focused{box-shadow:0 0 0 4px rgba(0, 123, 255, 0.3)}.token-input--error{box-shadow:0 0 0 4px rgba(220, 53, 69, 0.3)}}@media (prefers-reduced-motion: reduce){*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}.spinner{animation:none}}.token-selector--clickable:focus-visible,.max-button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.amount-input:focus-visible{outline:none;}";

const EuclidTokenInput = /*@__PURE__*/ proxyCustomElement(class EuclidTokenInput extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.valueChange = createEvent(this, "valueChange");
        this.tokenSelect = createEvent(this, "tokenSelect");
        this.maxClick = createEvent(this, "maxClick");
        /**
         * The input value (amount)
         */
        this.value = '';
        /**
         * Placeholder text for the input
         */
        this.placeholder = '0.0';
        /**
         * Whether the input is disabled
         */
        this.disabled = false;
        /**
         * Whether to show the balance
         */
        this.showBalance = true;
        /**
         * Whether to show the max button
         */
        this.showMax = true;
        /**
         * Loading state
         */
        this.loading = false;
        /**
         * Whether the token selector is clickable
         */
        this.tokenSelectable = true;
        this.focused = false;
        this.hasError = false;
        this.handleInputChange = (event) => {
            const target = event.target;
            let value = target.value;
            // Allow only numbers and decimal point
            value = value.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Limit decimal places based on token decimals
            if (this.token?.decimals && parts.length === 2) {
                const decimalPart = parts[1];
                if (decimalPart.length > this.token.decimals) {
                    value = parts[0] + '.' + decimalPart.slice(0, this.token.decimals);
                }
            }
            this.value = value;
            target.value = value;
            this.valueChange.emit(value);
        };
        this.handleInputFocus = () => {
            this.focused = true;
        };
        this.handleInputBlur = () => {
            this.focused = false;
        };
        this.handleTokenClick = () => {
            if (this.tokenSelectable && !this.disabled) {
                this.tokenSelect.emit();
            }
        };
        this.handleMaxClick = () => {
            if (this.token?.balance && !this.disabled) {
                this.value = this.token.balance;
                if (this.inputRef) {
                    this.inputRef.value = this.token.balance;
                }
                this.valueChange.emit(this.token.balance);
                this.maxClick.emit();
            }
        };
    }
    onValueChange(newValue) {
        this.validateInput(newValue);
    }
    onErrorChange(newError) {
        this.hasError = !!newError;
    }
    onTokenChange() {
        this.updateUserBalance();
    }
    componentWillLoad() {
        this.setupStoreSubscriptions();
        this.updateUserBalance();
    }
    disconnectedCallback() {
        // Cleanup store subscriptions if needed
    }
    setupStoreSubscriptions() {
        // Subscribe to wallet balance changes
        walletStore.onChange('balances', () => {
            this.updateUserBalance();
        });
    }
    updateUserBalance() {
        if (this.token?.symbol) {
            // Get balance from wallet store for current token
            // Note: This requires knowing which chain - for now, get from primary connected wallet
            const connectedWallets = walletStore.getAllConnectedWallets();
            if (connectedWallets.length > 0) {
                const primaryChain = connectedWallets[0].chainUID;
                const balance = walletStore.getWalletBalance(primaryChain, this.token.symbol);
                this.userBalance = balance?.amount || '0';
            }
            else {
                this.userBalance = '0';
            }
        }
    }
    validateInput(value) {
        // Reset error state
        this.hasError = false;
        if (!value)
            return;
        // Check if it's a valid number
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            this.hasError = true;
            return;
        }
        // Check balance if available
        if (this.token?.balance && this.showBalance) {
            const balance = parseFloat(this.token.balance);
            if (numValue > balance) {
                this.hasError = true;
                return;
            }
        }
    }
    formatBalance(balance) {
        const num = parseFloat(balance);
        if (isNaN(num))
            return '0';
        if (num < 0.001)
            return '<0.001';
        if (num < 1)
            return num.toFixed(6);
        if (num < 1000)
            return num.toFixed(3);
        if (num < 1000000)
            return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }
    render() {
        const containerClass = {
            'token-input': true,
            'token-input--focused': this.focused,
            'token-input--disabled': this.disabled,
            'token-input--error': this.hasError || !!this.error,
            'token-input--loading': this.loading,
        };
        const tokenSelectorClass = {
            'token-selector': true,
            'token-selector--clickable': this.tokenSelectable && !this.disabled,
            'token-selector--empty': !this.token,
        };
        return (h("div", { key: '5b44f7b2a92848b3e1fc0937350372b916289bd3', class: "token-input-wrapper" }, this.label && (h("label", { key: '7859f020522d1cd3cbbd6dc284a7daaf4281b3a2', class: "token-input-label" }, this.label)), h("div", { key: '94cb16b07de2c98fec464954011a04a60aeee752', class: containerClass }, h("div", { key: '722496353b8b140481bb4bcf798e7791c46e86e6', class: "token-input-main" }, h("div", { key: '9e95f7e623d9707a404e84e30fa4379af569309b', class: "input-section" }, h("input", { key: '5066ac03e0c13ee715a940c422a51402d28ab171', ref: (el) => this.inputRef = el, type: "text", inputMode: "decimal", placeholder: this.placeholder, value: this.value, disabled: this.disabled, onInput: this.handleInputChange, onFocus: this.handleInputFocus, onBlur: this.handleInputBlur, class: "amount-input" }), this.loading && (h("div", { key: '96754332ea2d72e8b4e9a2b5c7b522ed7837f898', class: "loading-spinner" }, h("div", { key: 'd65acc61de231819959528a921428a4a5230f6bb', class: "spinner" })))), h("div", { key: '40ee299ae0e3cb977cdeef96e719c9eec4a70a65', class: tokenSelectorClass, onClick: this.tokenSelectable && !this.disabled ? this.handleTokenClick : undefined }, h("slot", { key: '55ed37a54af107f20ee38bd921b5913dd3a5525d', name: "token" }, this.token ? (h("div", { class: "token-info" }, this.token.logoUrl && (h("img", { src: this.token.logoUrl, alt: this.token.symbol, class: "token-logo" })), h("span", { class: "token-symbol" }, this.token.symbol), this.tokenSelectable && !this.disabled && (h("svg", { class: "chevron-icon", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" }))))) : (h("div", { class: "select-token" }, h("span", null, "Select Token"), this.tokenSelectable && !this.disabled && (h("svg", { class: "chevron-icon", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" })))))))), (this.showBalance || this.showMax) && this.token && (h("div", { key: '429b26ee893b93c3e065d51dac8d60f0cd4352ad', class: "token-input-footer" }, this.showBalance && (this.userBalance || this.token.balance) && (h("div", { key: '916d3f57dfb0eb9b60d77c25cb6c844df367ecc3', class: "balance-section" }, h("span", { key: 'fef002f0c3672f74166a03cc486a3871a27f4890', class: "balance-label" }, "Balance:"), h("span", { key: '664189d28b9f3f5bcb65dc49ae91e8fb226ad6ba', class: "balance-value" }, this.formatBalance(this.userBalance || this.token.balance || '0'), " ", this.token.symbol))), this.showMax && this.token.balance && (h("button", { key: '069b22a4b4bd2093cbb1a0896c1a97ae020f76df', class: "max-button", onClick: this.handleMaxClick, disabled: this.disabled, type: "button" }, "MAX"))))), (this.error || this.hasError) && (h("div", { key: 'f336014eaaac08df2ecd267ad610347abf7dc0aa', class: "error-message" }, this.error || 'Invalid amount'))));
    }
    static get watchers() { return {
        "value": ["onValueChange"],
        "error": ["onErrorChange"],
        "token": ["onTokenChange"]
    }; }
    static get style() { return euclidTokenInputCss; }
}, [257, "euclid-token-input", {
        "token": [16],
        "value": [1025],
        "placeholder": [1],
        "disabled": [4],
        "showBalance": [4, "show-balance"],
        "showMax": [4, "show-max"],
        "label": [1],
        "error": [1],
        "loading": [4],
        "tokenSelectable": [4, "token-selectable"],
        "focused": [32],
        "hasError": [32],
        "userBalance": [32]
    }, undefined, {
        "value": ["onValueChange"],
        "error": ["onErrorChange"],
        "token": ["onTokenChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-token-input"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-token-input":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidTokenInput);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidTokenInput as E, defineCustomElement as d };
//# sourceMappingURL=p-DhUeaqyu.js.map

//# sourceMappingURL=p-DhUeaqyu.js.map