import { p as proxyCustomElement, H } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { m as marketStore } from './p-DYNFp3VG.js';
import { W as WalletAdapterFactory } from './p-BMm0inSs.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';

const EuclidWalletController = /*@__PURE__*/ proxyCustomElement(class EuclidWalletController extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.isInitialized = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    async initialize() {
        console.log('🔗 Initializing Wallet Controller...');
        // Check for available wallets on page load
        await this.detectAvailableWallets();
        // Set up wallet event listeners
        this.setupWalletEventListeners();
        this.isInitialized = true;
        console.log('✅ Wallet Controller initialized');
    }
    async detectAvailableWallets() {
        const availableWallets = [];
        // Check for Keplr (Cosmos wallets)
        if (window.keplr) {
            availableWallets.push('keplr');
        }
        // Check for MetaMask (EVM wallets)
        if (window.ethereum?.isMetaMask) {
            availableWallets.push('metamask');
        }
        // Check for Cosmostation
        if (window.cosmostation) {
            availableWallets.push('cosmostation');
        }
        console.log('🔍 Available wallets detected:', availableWallets);
        return availableWallets;
    }
    setupWalletEventListeners() {
        // Listen for MetaMask account changes
        if (window.ethereum) {
            // MetaMask's ethereum object has event emitter methods not defined in our interface
            const ethProvider = window.ethereum;
            if (ethProvider.on) {
                ethProvider.on('accountsChanged', (accounts) => {
                    console.log('MetaMask accounts changed:', accounts);
                    this.handleEvmAccountChange(accounts);
                });
                ethProvider.on('chainChanged', (chainId) => {
                    console.log('MetaMask chain changed:', chainId);
                    this.handleEvmChainChange(chainId);
                });
            }
        }
        // Listen for Keplr events
        window.addEventListener('keplr_keystorechange', () => {
            console.log('Keplr keystore changed');
            this.handleKeplrKeystoreChange();
        });
    }
    async handleEvmAccountChange(accounts) {
        if (accounts.length === 0) {
            // User disconnected
            this.disconnectEvmWallets();
        }
    }
    handleEvmChainChange(chainId) {
        // Handle EVM chain changes
        console.log('Chain changed to:', chainId);
        // TODO: Update wallet store with new chain info
    }
    handleKeplrKeystoreChange() {
        // Handle Keplr keystore changes (account switches, etc.)
        // TODO: Update all Cosmos chain wallets
    }
    disconnectEvmWallets() {
        // Disconnect all EVM wallets
        const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'manta', 'sepolia'];
        evmChains.forEach(chainUID => {
            walletStore.removeWallet(chainUID);
        });
    }
    async handleWalletConnectionRequest(event) {
        const { chainUID, walletType } = event.detail;
        console.log('🔗 Wallet connection requested:', { chainUID, walletType });
        try {
            await this.connectWallet(chainUID, walletType);
        }
        catch (error) {
            console.error('Failed to connect wallet:', error);
            // Emit connection failure event
            dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_FAILED, {
                chainUID,
                walletType,
                error: error.message
            });
        }
    }
    handleWalletDisconnectionRequest(event) {
        const { chainUID } = event.detail;
        console.log('🔌 Wallet disconnection requested:', chainUID);
        walletStore.disconnectWallet(chainUID);
        // Emit disconnection success event
        dispatchEuclidEvent(EUCLID_EVENTS.WALLET.DISCONNECT_SUCCESS, { chainUID });
    }
    async connectWallet(chainUID, walletType) {
        // Get chain configuration
        const chainConfig = marketStore.getChain(chainUID);
        if (!chainConfig) {
            throw new Error(`Chain configuration not found for ${chainUID}`);
        }
        // Validate wallet type
        const validWalletTypes = ['keplr', 'metamask', 'cosmostation', 'walletconnect'];
        if (!validWalletTypes.includes(walletType)) {
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }
        // Use the wallet adapter factory for proper separation of concerns
        const result = await WalletAdapterFactory.connectWallet(walletType, chainConfig);
        if (result.success && result.address) {
            // Add wallet to store
            walletStore.addWallet(chainUID, {
                address: result.address,
                name: walletType,
                walletType: walletType,
                type: walletType, // legacy alias
                isConnected: true,
                balances: []
            });
            // Emit connection success event
            dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_SUCCESS, {
                chainUID,
                walletType,
                address: result.address
            });
        }
        else {
            throw new Error(result.error || 'Failed to connect wallet');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
}, [256, "euclid-wallet-controller", {
        "isInitialized": [32]
    }, [[8, "euclid:wallet:connect-request", "handleWalletConnectionRequest"], [8, "euclid:wallet:disconnect-request", "handleWalletDisconnectionRequest"]]]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-wallet-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-wallet-controller":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidWalletController);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidWalletController as E, defineCustomElement as d };
//# sourceMappingURL=p-BieMpO51.js.map

//# sourceMappingURL=p-BieMpO51.js.map