import { p as proxyCustomElement, H, h, e as Host } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as appStore } from './p-nYiGBV1C.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';
import { d as defineCustomElement$a } from './p-Bfu1xZ0p.js';
import { d as defineCustomElement$9 } from './p-7SIWrB4f.js';
import { d as defineCustomElement$8 } from './p-B_RCt9QF.js';
import { d as defineCustomElement$7 } from './p-DDbN2KEt.js';
import { d as defineCustomElement$6 } from './p-BFaq5wRO.js';
import { d as defineCustomElement$5 } from './p-DewXFKNX.js';
import { d as defineCustomElement$4 } from './p-B5-fHFCm.js';
import { d as defineCustomElement$3 } from './p-DYCg_zbS.js';
import { d as defineCustomElement$2 } from './p-BieMpO51.js';

const euclidCoreProviderCss = ":host{display:block;width:100%;height:100%}.euclid-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;padding:var(--euclid-spacing-8);text-align:center;color:var(--euclid-text-secondary);font-family:var(--euclid-font-family-sans)}.loading-spinner{width:var(--euclid-spacing-8);height:var(--euclid-spacing-8);border:3px solid var(--euclid-border);border-top:3px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite;margin-bottom:var(--euclid-spacing-4)}.euclid-loading p{margin:0;font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium)}.euclid-provider-content{width:100%;height:100%}euclid-wallet-controller,euclid-market-data-controller,euclid-user-data-controller{display:none}";

const EuclidCoreProvider$1 = /*@__PURE__*/ proxyCustomElement(class EuclidCoreProvider extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.isInitialized = false;
        this.handleWalletConnectFromModal = (event) => {
            const { provider, chainId } = event.detail;
            console.log('🔗 Wallet connection request from modal:', provider.type, chainId);
            // Dispatch wallet connection request
            dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_REQUEST, {
                chainUID: chainId || 'ethereum',
                walletType: provider.type
            });
            appStore.closeWalletModal();
        };
        this.handleTokenSelectFromModal = (event) => {
            const { token } = event.detail;
            console.log('🪙 Token selection from modal:', token.symbol);
            // Emit token selection for consuming components
            dispatchEuclidEvent(EUCLID_EVENTS.UI.TOKEN_SELECTED, {
                tokenId: token.id,
                data: token
            });
            appStore.closeTokenModal();
        };
    }
    async componentDidLoad() {
        await this.initialize();
    }
    async initialize() {
        console.log('🌌 Initializing Euclid Protocol Core Provider...');
        // Initialize app store
        appStore.initialize();
        // Initialize wallet store
        walletStore.initialize();
        // Load initial market data
        await this.loadInitialMarketData();
        this.isInitialized = true;
        console.log('✅ Euclid Protocol Core Provider initialized successfully');
    }
    async loadInitialMarketData() {
        console.log('📊 Delegating initial market data loading to Market Data Controller...');
        // Delegate to market data controller via events
        dispatchEuclidEvent(EUCLID_EVENTS.MARKET.LOAD_INITIAL);
    }
    handleWalletConnect(event) {
        console.log('🔗 Wallet connection event received:', event.detail);
        // Handle wallet connection logic here
    }
    handleWalletDisconnect(event) {
        console.log('🔌 Wallet disconnection event received:', event.detail);
        // Handle wallet disconnection logic here
    }
    render() {
        return (h(Host, { key: 'ff16368b7e9fdcd6fb93ff8881a7f3e12a48d204' }, !this.isInitialized && (h("div", { key: 'ade166583958c3f441ca395e39afe3716282381d', class: "euclid-loading" }, h("div", { key: '032bd8901b7471cd789a815a8818f991bb46d36e', class: "loading-spinner" }), h("p", { key: '579490fa607edc29c94abb24f96c5edba863854c' }, "Initializing Euclid Protocol..."))), h("euclid-wallet-controller", { key: '474d417b17c231f5ad20cdebf02ed783d54b7146' }), h("euclid-market-data-controller", { key: 'fd3407339e8cd9a4d7e0f44f753da04f6d1f97c0' }), h("euclid-user-data-controller", { key: '9b90a554c30bbd7d204e119ee854a7123160f6f6' }), h("euclid-swap-controller", { key: '2ed0b95b39cc2eae9027e525e37e56fd1b878f8b' }), h("euclid-liquidity-controller", { key: 'cf94a2d83e9a6cb9aa47b8dec2f5582b316e960a' }), h("euclid-tx-tracker-controller", { key: '2dcc971fd3cffd8fef9ddcb48a4d07d2f2b10140' }), h("euclid-modal", { key: 'b252d325fcd72f88e32a098841b7b5ee11319cd8' }), h("div", { key: '3d79c6936817ad87b0ccbadf2f50a8a77c565dd4', class: "euclid-provider-content" }, h("slot", { key: 'a4df73336ae4236aa3418bf72392b585aaeac366' }))));
    }
    static get style() { return euclidCoreProviderCss; }
}, [257, "euclid-core-provider", {
        "isInitialized": [32]
    }, [[8, "euclid:wallet:connect-success", "handleWalletConnect"], [8, "euclid:wallet:disconnect-success", "handleWalletDisconnect"]]]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-core-provider", "euclid-liquidity-controller", "euclid-market-data-controller", "euclid-modal", "euclid-swap-controller", "euclid-token-content", "euclid-tx-tracker-controller", "euclid-user-data-controller", "euclid-wallet-content", "euclid-wallet-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-core-provider":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidCoreProvider$1);
            }
            break;
        case "euclid-liquidity-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$a();
            }
            break;
        case "euclid-market-data-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$9();
            }
            break;
        case "euclid-modal":
            if (!customElements.get(tagName)) {
                defineCustomElement$8();
            }
            break;
        case "euclid-swap-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$7();
            }
            break;
        case "euclid-token-content":
            if (!customElements.get(tagName)) {
                defineCustomElement$6();
            }
            break;
        case "euclid-tx-tracker-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$5();
            }
            break;
        case "euclid-user-data-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$4();
            }
            break;
        case "euclid-wallet-content":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "euclid-wallet-controller":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const EuclidCoreProvider = EuclidCoreProvider$1;
const defineCustomElement = defineCustomElement$1;

export { EuclidCoreProvider, defineCustomElement };
//# sourceMappingURL=euclid-core-provider.js.map

//# sourceMappingURL=euclid-core-provider.js.map