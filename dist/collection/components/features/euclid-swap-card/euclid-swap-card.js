import { h } from "@stencil/core";
import { walletStore } from "../../../store/wallet.store";
import { appStore } from "../../../store/app.store";
import { marketStore } from "../../../store/market.store";
import { EUCLID_EVENTS, dispatchEuclidEvent } from "../../../utils/events";
export class EuclidSwapCard {
    constructor() {
        /**
         * Available tokens for swapping (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokens = [];
        // Store data (automatically synced)
        this.storeTokens = [];
        this.storeLoading = false;
        /**
         * Currently selected input token
         */
        this.inputToken = null;
        /**
         * Currently selected output token
         */
        this.outputToken = null;
        /**
         * Input amount value
         */
        this.inputAmount = '';
        /**
         * Whether the component is in loading state
         */
        this.loading = false;
        /**
         * Whether the swap functionality is disabled
         */
        this.disabled = false;
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Whether to show advanced settings
         */
        this.showAdvanced = false;
        /**
         * Default slippage tolerance (0.1 = 0.1%)
         */
        this.defaultSlippage = 0.5;
        /**
         * Card title
         */
        this.cardTitle = 'Swap Tokens';
        // Internal state
        this.outputAmount = '';
        this.isSettingsOpen = false;
        this.tokenSelectorType = 'input';
        this.currentQuote = null;
        this.isQuoting = false;
        this.swapSettings = {
            slippage: this.defaultSlippage,
            deadline: 20,
            infiniteApproval: false,
        };
        // Quote update timer
        this.quoteTimer = null;
        this.handleSwapTokens = () => {
            const tempToken = this.inputToken;
            const tempAmount = this.inputAmount;
            this.inputToken = this.outputToken;
            this.outputToken = tempToken;
            this.inputAmount = this.outputAmount;
            this.outputAmount = tempAmount;
            this.startQuoteTimer();
        };
        this.handleMaxClick = () => {
            if (this.inputToken?.balance) {
                this.inputAmount = this.inputToken.balance;
                this.startQuoteTimer();
            }
        };
        this.openTokenSelector = (type) => {
            console.log('🔧 Opening token selector for:', type);
            this.tokenSelectorType = type;
            appStore.openTokenModal(type);
        };
        this.toggleSettings = () => {
            this.isSettingsOpen = !this.isSettingsOpen;
        };
        this.handleSlippageChange = (slippage) => {
            this.swapSettings = { ...this.swapSettings, slippage };
            this.settingsChanged.emit(this.swapSettings);
            this.startQuoteTimer(); // Recalculate with new slippage
        };
        this.handleSwap = () => {
            // Check if we need to connect wallet first
            if (!this.inputToken || !this.isWalletConnectedForSwap()) {
                // Open wallet modal with chain filter
                appStore.openWalletModal(this.inputToken?.chainUID);
                return;
            }
            if (!this.outputToken || !this.currentQuote)
                return;
            // Emit event to trigger swap execution
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_REQUEST);
            // Emit the swap event with all the data for external listeners
            this.swapInitiated.emit({
                inputToken: this.inputToken,
                outputToken: this.outputToken,
                inputAmount: this.inputAmount,
                outputAmount: this.outputAmount,
                settings: this.swapSettings,
                quote: this.currentQuote,
            });
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic token updates
        this.syncWithStore();
    }
    componentDidLoad() {
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
        // Auto-quote when inputs change
        this.startQuoteTimer();
    }
    syncWithStore() {
        // Use store data if available, fallback to props
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
        this.storeLoading = marketStore.state.loading;
    }
    /**
     * Get available tokens for swap selection
     * Combines store tokens with legacy prop tokens for compatibility
     */
    getAvailableTokens() {
        // Use store tokens if available, fallback to props
        const sourceTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        return sourceTokens.map(token => {
            // Check if this is TokenMetadata from store or legacy SwapToken from props
            if ('tokenId' in token && 'displayName' in token && 'coinDecimal' in token) {
                // Store token format (TokenMetadata)
                return {
                    id: token.tokenId,
                    symbol: token.symbol || token.displayName.toUpperCase(),
                    name: token.displayName,
                    address: token.address || token.tokenId,
                    chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
                    decimals: token.coinDecimal,
                    logoUrl: token.logo || token.image || undefined,
                    balance: undefined, // Would need to fetch from wallet
                    price: token.price ? parseFloat(token.price) : undefined,
                };
            }
            else {
                // Legacy prop format (SwapToken)
                return token;
            }
        });
    }
    /**
     * Get unique chains from available tokens
     */
    getAvailableChains() {
        const tokens = this.getAvailableTokens();
        const chainMap = new Map();
        tokens.forEach(token => {
            if (!chainMap.has(token.chainUID)) {
                chainMap.set(token.chainUID, {
                    chain_uid: token.chainUID,
                    display_name: this.getChainDisplayName(token.chainUID),
                });
            }
        });
        return Array.from(chainMap.values());
    }
    disconnectedCallback() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
    }
    handleInputChange(event) {
        if (event.target === this.element.querySelector('#input-amount')) {
            this.inputAmount = event.detail.value;
            this.startQuoteTimer();
        }
    }
    handleTokenModalSelect(event) {
        // Only handle events from the token modal with proper structure
        if (!event.detail || !event.detail.token || !event.detail.selectorType) {
            return;
        }
        console.log('🔧 Swap - received token selection:', event.detail);
        const { token, selectorType } = event.detail;
        // Convert TokenInfo to SwapToken format
        const selectedToken = {
            id: token.tokenId || token.id,
            symbol: token.symbol,
            name: token.name || token.displayName,
            address: token.address || token.tokenId,
            chainUID: token.chainUID || token.chain_uid,
            decimals: token.decimals || token.coinDecimal,
            logoUrl: token.logoUrl || token.logo,
            balance: token.balance,
            price: token.price,
        };
        if (selectorType === 'input') {
            // If we're selecting the same token that's already in output, swap them
            if (this.outputToken && selectedToken.address === this.outputToken.address) {
                this.outputToken = this.inputToken;
            }
            this.inputToken = selectedToken;
        }
        else {
            // If we're selecting the same token that's already in input, swap them
            if (this.inputToken && selectedToken.address === this.inputToken.address) {
                this.inputToken = this.outputToken;
            }
            this.outputToken = selectedToken;
        }
        // Emit event for external listeners
        this.tokenSelect.emit({
            type: selectorType,
            token: selectedToken,
        });
        // Start quote timer if we have both tokens
        this.startQuoteTimer();
    }
    startQuoteTimer() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
        if (this.inputToken && this.outputToken && this.inputAmount && parseFloat(this.inputAmount) > 0) {
            this.quoteTimer = setTimeout(() => {
                this.requestQuote();
            }, 800); // Debounce for 800ms
        }
        else {
            this.outputAmount = '';
            this.currentQuote = null;
        }
    }
    async requestQuote() {
        if (!this.inputToken || !this.outputToken || !this.inputAmount)
            return;
        this.isQuoting = true;
        this.quoteRequested.emit({
            inputToken: this.inputToken,
            outputToken: this.outputToken,
            inputAmount: this.inputAmount,
        });
        // Simulate quote response (in real app, this would be handled by parent component)
        setTimeout(() => {
            if (this.inputToken && this.outputToken && this.inputAmount) {
                const mockRate = 1.2 + Math.random() * 0.3; // Mock exchange rate
                const calculatedOutput = (parseFloat(this.inputAmount) * mockRate).toFixed(6);
                this.currentQuote = {
                    inputAmount: this.inputAmount,
                    outputAmount: calculatedOutput,
                    exchangeRate: mockRate,
                    priceImpact: Math.random() * 2, // 0-2% impact
                    minimumReceived: (parseFloat(calculatedOutput) * (1 - this.swapSettings.slippage / 100)).toFixed(6),
                    gasEstimate: (0.001 + Math.random() * 0.002).toFixed(4), // Mock gas
                    route: [
                        {
                            protocol: 'Euclid Protocol',
                            poolAddress: '0x123...abc',
                            fee: 0.3,
                            inputToken: this.inputToken.symbol,
                            outputToken: this.outputToken.symbol,
                        },
                    ],
                };
                this.outputAmount = calculatedOutput;
            }
            this.isQuoting = false;
        }, 1000);
    }
    canSwap() {
        // First check if we need wallet connection
        if (!this.inputToken || !this.isWalletConnectedForSwap()) {
            return true; // Button should be clickable for connection
        }
        return !!(this.inputToken &&
            this.outputToken &&
            this.inputAmount &&
            parseFloat(this.inputAmount) > 0 &&
            this.currentQuote &&
            !this.isQuoting &&
            !this.loading &&
            !this.disabled);
    }
    getSwapButtonText() {
        // Check wallet connection for required chain
        if (!this.inputToken || !this.isWalletConnectedForSwap()) {
            const chainName = this.inputToken?.chainUID ?
                this.getChainDisplayName(this.inputToken.chainUID) : 'Wallet';
            return `Connect ${chainName}`;
        }
        if (!this.inputToken)
            return 'Select Input Token';
        if (!this.outputToken)
            return 'Select Output Token';
        if (!this.inputAmount || parseFloat(this.inputAmount) <= 0)
            return 'Enter Amount';
        if (this.isQuoting)
            return 'Getting Quote...';
        if (this.loading)
            return 'Swapping...';
        if (!this.currentQuote)
            return 'Unable to Quote';
        return `Swap ${this.inputToken.symbol} for ${this.outputToken.symbol}`;
    }
    isWalletConnectedForSwap() {
        if (!this.inputToken)
            return false;
        return walletStore.isWalletConnected(this.inputToken.chainUID);
    }
    getChainDisplayName(chainUID) {
        // Simple mapping - in production this would come from chain config
        const chainNames = {
            'ethereum': 'Ethereum',
            'polygon': 'Polygon',
            'arbitrum': 'Arbitrum',
            'optimism': 'Optimism',
            'cosmoshub-4': 'Cosmos Hub',
            'osmosis-1': 'Osmosis',
        };
        return chainNames[chainUID] || 'Wallet';
    }
    render() {
        return (h("div", { key: '5ccf05caa379b87edb753dfae18eb9bb5f20c62b', class: "swap-card" }, h("div", { key: '7f2e41e4dad27e696d22668e91fbc3a9306955ba', class: "swap-header" }, h("h3", { key: '4bcd02d6ce02f97f8f6567af5fdd15fdcdab92dd', class: "swap-title" }, this.cardTitle), h("button", { key: '19f18da33e30257979024612e8f96ec884cc71b2', class: "settings-button", onClick: this.toggleSettings, type: "button", "aria-label": "Swap settings" }, h("svg", { key: '8c976b3ee17c14867ebb713f96274809c382af5b', viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: 'ceb5ee42a4b96203aa1e0572c6cb82329b986329', d: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" })))), this.isSettingsOpen && (h("div", { key: 'c53e695401705e1745445077ae97aa907bd3b435', class: "settings-panel" }, h("div", { key: '4451f4f0e34592aea5184b133c50673189a6b546', class: "setting-item" }, h("label", { key: 'fdedfd88828c25cf3c2c2635c743f38818593249', class: "setting-label" }, "Slippage Tolerance"), h("div", { key: '02f4fbb41303e0646841d577648fbcd5a1ac947d', class: "slippage-buttons" }, [0.1, 0.5, 1.0].map((value) => (h("button", { class: {
                'slippage-btn': true,
                'slippage-btn--active': this.swapSettings.slippage === value,
            }, onClick: () => this.handleSlippageChange(value), type: "button" }, value, "%"))), h("input", { key: 'bcf94b157512ba0325953e290c274d22a641e292', class: "slippage-input", type: "number", min: "0", max: "50", step: "0.1", value: this.swapSettings.slippage, onInput: (e) => this.handleSlippageChange(parseFloat(e.target.value)), placeholder: "Custom" }))), h("div", { key: '9b21e42077482bd5d7ba74ce11178c5791ec2d0e', class: "setting-item" }, h("label", { key: '03b4cb73fa483d2911a657c183d368ceecc991b8', class: "setting-label" }, "Transaction Deadline"), h("div", { key: '2f9c19f67d93eea7dd8dcabb119d9fb02da428c0', class: "deadline-input" }, h("input", { key: 'f4d7eee46ea9e96fbccb3d5a95c83cd93ba03686', type: "number", min: "1", max: "4320", value: this.swapSettings.deadline, onInput: (e) => (this.swapSettings = {
                ...this.swapSettings,
                deadline: parseInt(e.target.value),
            }) }), h("span", { key: '556bb04c97045abd921652d89969587da3f56ea2' }, "minutes"))))), h("div", { key: '37622af2d6a7636b83158a7b30f52501d11b9fae', class: "token-input-section" }, h("div", { key: '3c40f0c66a1cee84d7d835af3998e52471988d97', class: "input-header" }, h("span", { key: '7ba473eeed5d4309544397a8b55ff8dfaa561835', class: "input-label" }, "From"), this.inputToken?.balance && (h("span", { key: '32cd4284ceb8ade0d671449194e814af5ac503d6', class: "balance-label" }, "Balance: ", parseFloat(this.inputToken.balance).toLocaleString()))), h("euclid-token-input", { key: '5c60ba44280e556489a3677b31572059dcffcee0', id: "input-amount", value: this.inputAmount, placeholder: "0.0", "show-max": !!this.inputToken?.balance, "token-selectable": false, onMaxClick: this.handleMaxClick }, h("div", { key: '73bd918a4f6ad94027cff39c139b443626642eaa', slot: "token", class: "token-selector", onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openTokenSelector('input');
            } }, this.inputToken ? (h("div", { class: "selected-token" }, this.inputToken.logoUrl && (h("img", { src: this.inputToken.logoUrl, alt: this.inputToken.symbol, class: "token-logo" })), h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.inputToken.symbol), h("span", { class: "token-name" }, this.inputToken.name)), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))) : (h("div", { class: "select-token-button" }, h("span", null, "Select Token"), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" }))))))), h("div", { key: '3c175a7880a418b3ccd88d584302ef9d896158de', class: "swap-direction" }, h("button", { key: 'd99311933510229a6036e44602d9a818e0e2fcd4', class: "swap-button", onClick: this.handleSwapTokens, type: "button", "aria-label": "Swap token directions" }, h("svg", { key: '75d0986cb8630b792b1995379c73234921b3aec7', viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: 'e3a7341a4fc43aa909ef04f77b344743c7b2a11f', d: "M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" })))), h("div", { key: '5c8078fcc608db80029cf2f316c315758b7db88b', class: "token-input-section" }, h("div", { key: 'af5c0e3fb08a20794351977bbab1b7c43fa3a679', class: "input-header" }, h("span", { key: '5512edeb1d9bd56d0bc7d09534fdc79e3f2ca496', class: "input-label" }, "To"), this.outputToken?.balance && (h("span", { key: '3c7b2dde2f246d35a5bbab44f634c8dcdf50ea97', class: "balance-label" }, "Balance: ", parseFloat(this.outputToken.balance).toLocaleString()))), h("euclid-token-input", { key: 'dd4369d960e2c493495a3472f9b47b5b4b6bbb5a', id: "output-amount", value: this.outputAmount, placeholder: "0.0", disabled: true, loading: this.isQuoting, "token-selectable": false }, h("div", { key: '409a15ad3bbbec15b736298c53256b2c5b87179e', slot: "token", class: "token-selector", onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openTokenSelector('output');
            } }, this.outputToken ? (h("div", { class: "selected-token" }, this.outputToken.logoUrl && (h("img", { src: this.outputToken.logoUrl, alt: this.outputToken.symbol, class: "token-logo" })), h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.outputToken.symbol), h("span", { class: "token-name" }, this.outputToken.name)), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))) : (h("div", { class: "select-token-button" }, h("span", null, "Select Token"), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" }))))))), this.currentQuote && (h("div", { key: '453abad05c15148a151b5fbcd3a37978b6089017', class: "quote-info" }, h("div", { key: 'ab610db9496354b9c11069a0d3d7a69581b1279d', class: "quote-row" }, h("span", { key: '83a830f209c7db7b5174792afc933102ad07d401', class: "quote-label" }, "Rate"), h("span", { key: '816b977644262173b60a17cdf2b99d196d2a1de6', class: "quote-value" }, "1 ", this.inputToken?.symbol, " = ", this.currentQuote.exchangeRate.toFixed(6), " ", this.outputToken?.symbol)), this.currentQuote.priceImpact > 0.1 && (h("div", { key: '5f0e90855a9c77f106ab5c3282e586c7f61a6133', class: "quote-row" }, h("span", { key: '67f963c6ffa0c5b9bbd90781e0232e4bfc067fe2', class: "quote-label" }, "Price Impact"), h("span", { key: 'cdb8dbaf6111a9c9f5a7a65fff03f92642a315d2', class: {
                'quote-value': true,
                'quote-value--warning': this.currentQuote.priceImpact > 3,
                'quote-value--danger': this.currentQuote.priceImpact > 15,
            } }, this.currentQuote.priceImpact.toFixed(2), "%"))), h("div", { key: 'e810fccea9c8fd965097e55f030a42041fff79b3', class: "quote-row" }, h("span", { key: 'e978d45bdbdf50f6290b41949bed931e61c052d1', class: "quote-label" }, "Minimum Received"), h("span", { key: 'acbdf1315c438c297dd98e1c53e4461151b23892', class: "quote-value" }, this.currentQuote.minimumReceived, " ", this.outputToken?.symbol)), h("div", { key: '151a44694c6e2ca171231da32196fb6d4e22b9f6', class: "quote-row" }, h("span", { key: 'c8152bdd70e13cbe0108dfc05a8307a591b5c7c3', class: "quote-label" }, "Network Fee"), h("span", { key: '491098c5a4618446a0f51075fbcd8cdd855f9da3', class: "quote-value" }, this.currentQuote.gasEstimate, " ETH")))), h("euclid-button", { key: '2f1e5369a380a16b083f813196818510c08610cc', variant: "primary", size: "lg", "full-width": true, loading: this.loading, disabled: !this.canSwap(), onClick: this.handleSwap }, this.getSwapButtonText())));
    }
    static get is() { return "euclid-swap-card"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-swap-card.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-swap-card.css"]
        };
    }
    static get properties() {
        return {
            "tokens": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "SwapToken[]",
                    "resolved": "SwapToken[]",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [{
                            "name": "deprecated",
                            "text": "Use store instead"
                        }],
                    "text": "Available tokens for swapping (gets from market store automatically)"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "inputToken": {
                "type": "unknown",
                "mutable": true,
                "complexType": {
                    "original": "SwapToken | null",
                    "resolved": "SwapToken",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Currently selected input token"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "null"
            },
            "outputToken": {
                "type": "unknown",
                "mutable": true,
                "complexType": {
                    "original": "SwapToken | null",
                    "resolved": "SwapToken",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Currently selected output token"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "null"
            },
            "inputAmount": {
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
                    "text": "Input amount value"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "input-amount",
                "defaultValue": "''"
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
                    "text": "Whether the component is in loading state"
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
                    "text": "Whether the swap functionality is disabled"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "walletAddress": {
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
                    "text": "Connected wallet address"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "wallet-address",
                "defaultValue": "''"
            },
            "showAdvanced": {
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
                    "text": "Whether to show advanced settings"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-advanced",
                "defaultValue": "false"
            },
            "defaultSlippage": {
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
                    "text": "Default slippage tolerance (0.1 = 0.1%)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "default-slippage",
                "defaultValue": "0.5"
            },
            "cardTitle": {
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
                    "text": "Card title"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "card-title",
                "defaultValue": "'Swap Tokens'"
            }
        };
    }
    static get states() {
        return {
            "storeTokens": {},
            "storeLoading": {},
            "outputAmount": {},
            "isSettingsOpen": {},
            "tokenSelectorType": {},
            "currentQuote": {},
            "isQuoting": {},
            "swapSettings": {}
        };
    }
    static get events() {
        return [{
                "method": "swapInitiated",
                "name": "swapInitiated",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\n    inputToken: SwapToken;\n    outputToken: SwapToken;\n    inputAmount: string;\n    outputAmount: string;\n    settings: SwapSettings;\n    quote: SwapQuote;\n  }",
                    "resolved": "{ inputToken: SwapToken; outputToken: SwapToken; inputAmount: string; outputAmount: string; settings: SwapSettings; quote: SwapQuote; }",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        },
                        "SwapSettings": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapSettings"
                        },
                        "SwapQuote": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapQuote"
                        }
                    }
                }
            }, {
                "method": "tokenSelect",
                "name": "tokenSelect",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\n    type: 'input' | 'output';\n    token: SwapToken;\n  }",
                    "resolved": "{ type: \"input\" | \"output\"; token: SwapToken; }",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        }
                    }
                }
            }, {
                "method": "quoteRequested",
                "name": "quoteRequested",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\n    inputToken: SwapToken;\n    outputToken: SwapToken;\n    inputAmount: string;\n  }",
                    "resolved": "{ inputToken: SwapToken; outputToken: SwapToken; inputAmount: string; }",
                    "references": {
                        "SwapToken": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapToken"
                        }
                    }
                }
            }, {
                "method": "settingsChanged",
                "name": "settingsChanged",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "SwapSettings",
                    "resolved": "SwapSettings",
                    "references": {
                        "SwapSettings": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/features/euclid-swap-card/euclid-swap-card.tsx",
                            "id": "src/components/features/euclid-swap-card/euclid-swap-card.tsx::SwapSettings"
                        }
                    }
                }
            }];
    }
    static get elementRef() { return "element"; }
    static get listeners() {
        return [{
                "name": "valueChange",
                "method": "handleInputChange",
                "target": undefined,
                "capture": false,
                "passive": false
            }, {
                "name": "tokenSelect",
                "method": "handleTokenModalSelect",
                "target": "document",
                "capture": false,
                "passive": false
            }];
    }
}
//# sourceMappingURL=euclid-swap-card.js.map
