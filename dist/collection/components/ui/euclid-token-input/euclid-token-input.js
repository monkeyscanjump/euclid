import { h } from "@stencil/core";
import { walletStore } from "../../../store/wallet.store";
export class EuclidTokenInput {
    constructor() {
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
    static get is() { return "euclid-token-input"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-token-input.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-token-input.css"]
        };
    }
    static get properties() {
        return {
            "token": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TokenInfo",
                    "resolved": "TokenInfo",
                    "references": {
                        "TokenInfo": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/ui/euclid-token-input/euclid-token-input.tsx",
                            "id": "src/components/ui/euclid-token-input/euclid-token-input.tsx::TokenInfo"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The current token selection"
                },
                "getter": false,
                "setter": false
            },
            "value": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The input value (amount)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "value",
                "defaultValue": "''"
            },
            "placeholder": {
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
                    "text": "Placeholder text for the input"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "placeholder",
                "defaultValue": "'0.0'"
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
                    "text": "Whether the input is disabled"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "showBalance": {
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
                    "text": "Whether to show the balance"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-balance",
                "defaultValue": "true"
            },
            "showMax": {
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
                    "text": "Whether to show the max button"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-max",
                "defaultValue": "true"
            },
            "label": {
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
                    "text": "Label for the input"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "label"
            },
            "error": {
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
                    "text": "Error message to display"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "error"
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
                    "text": "Loading state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
            },
            "tokenSelectable": {
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
                    "text": "Whether the token selector is clickable"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "token-selectable",
                "defaultValue": "true"
            }
        };
    }
    static get states() {
        return {
            "focused": {},
            "hasError": {},
            "userBalance": {}
        };
    }
    static get events() {
        return [{
                "method": "valueChange",
                "name": "valueChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the input value changes"
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }, {
                "method": "tokenSelect",
                "name": "tokenSelect",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the token selector is clicked"
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "maxClick",
                "name": "maxClick",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the max button is clicked"
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "value",
                "methodName": "onValueChange"
            }, {
                "propName": "error",
                "methodName": "onErrorChange"
            }, {
                "propName": "token",
                "methodName": "onTokenChange"
            }];
    }
}
//# sourceMappingURL=euclid-token-input.js.map
