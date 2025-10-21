import { r as registerInstance, h, H as Host } from './index-DQPEQJEF.js';
import { w as walletStore } from './wallet.store--j01c46J.js';
import { a as appStore } from './app.store-DFrncGaU.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './events-CKexLjV3.js';

const euclidCoreProviderCss = ":host{display:block;width:100%;height:100%}.euclid-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;padding:var(--euclid-spacing-8);text-align:center;color:var(--euclid-text-secondary);font-family:var(--euclid-font-family-sans)}.loading-spinner{width:var(--euclid-spacing-8);height:var(--euclid-spacing-8);border:3px solid var(--euclid-border);border-top:3px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite;margin-bottom:var(--euclid-spacing-4)}.euclid-loading p{margin:0;font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium)}.euclid-provider-content{width:100%;height:100%}euclid-wallet-controller,euclid-market-data-controller,euclid-user-data-controller{display:none}";

const EuclidCoreProvider = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
};
EuclidCoreProvider.style = euclidCoreProviderCss;

export { EuclidCoreProvider as euclid_core_provider };
//# sourceMappingURL=euclid-core-provider.entry.js.map
