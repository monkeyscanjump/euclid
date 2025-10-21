import { p as proxyCustomElement, H } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as apiClient } from './p-Wc26abo-.js';
import { D as DEFAULTS } from './p-a3yxdMSu.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';

const EuclidUserDataController = /*@__PURE__*/ proxyCustomElement(class EuclidUserDataController extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.isInitialized = false;
        this.isLoading = false;
        this.error = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.clearPeriodicRefresh();
        walletStore.dispose?.();
    }
    async initialize() {
        console.log('👤 Initializing User Data Controller...');
        // Listen for wallet connection changes
        walletStore.onChange('wallets', async (wallets) => {
            const connectedWallets = Array.from(wallets.values()).filter(wallet => wallet.isConnected);
            if (connectedWallets.length > 0) {
                await this.handleWalletConnection(connectedWallets);
            }
            else {
                this.handleWalletDisconnection();
            }
        });
        // Initial check for already connected wallets
        const connectedWallets = walletStore.getAllConnectedWallets();
        if (connectedWallets.length > 0) {
            await this.handleWalletConnection(connectedWallets);
        }
        this.isInitialized = true;
        console.log('✅ User Data Controller initialized');
    }
    async handleWalletConnection(_wallets) {
        try {
            this.isLoading = true;
            this.error = null;
            console.log('🔗 Wallets connected, loading user data...');
            // Load user data for each connected wallet
            await Promise.all([
                this.loadUserBalances(),
                this.loadLiquidityPositions(),
                this.loadUserTransactions()
            ]);
            // Start periodic refresh
            this.setupPeriodicRefresh();
            // Reset retry count on success
            this.retryCount = 0;
        }
        catch (error) {
            console.error('❌ Failed to load user data:', error);
            await this.handleLoadError(error);
        }
        finally {
            this.isLoading = false;
        }
    }
    handleWalletDisconnection() {
        console.log('🔌 Wallets disconnected, clearing user data...');
        this.clearPeriodicRefresh();
        this.retryCount = 0;
        // Clear all wallet data
        walletStore.clear();
    }
    async loadUserBalances() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`💰 Loading balances for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                const balanceResponse = await apiClient.getBalance(wallet.address, wallet.chainUID);
                if (balanceResponse.success && balanceResponse.data) {
                    const balanceData = balanceResponse.data;
                    if (balanceData.balance?.all) {
                        const chainBalances = balanceData.balance.all.map(item => ({
                            amount: item.amount,
                            token_id: item.denom,
                            // Legacy compatibility fields
                            token: item.denom,
                            balance: item.amount,
                            chain_uid: wallet.chainUID,
                            token_type: { native: { denom: item.denom } }
                        }));
                        // Update wallet store with balances for this chain
                        walletStore.updateWalletBalances(wallet.chainUID, chainBalances);
                    }
                }
            }
            catch (error) {
                console.warn(`⚠️ Failed to load balance for ${wallet.chainUID}:`, error.message);
                // Continue loading other addresses even if one fails
            }
        }
        console.log(`✅ Updated balances for connected wallets`);
    }
    async loadLiquidityPositions() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`🏊 Loading liquidity positions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                // Stub implementation - to be completed later
                console.log('Liquidity positions loading - implementation pending');
                // TODO: Implement proper liquidity position loading
                // const poolsResponse = await apiClient.getUserPools(wallet.address);
                // Process and update walletStore.updateWalletPositions(wallet.chainUID, positions);
            }
            catch (error) {
                console.warn(`⚠️ Failed to load liquidity positions for ${wallet.chainUID}:`, error.message);
            }
        }
    }
    async loadUserTransactions() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`📊 Loading transactions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                // Stub implementation - to be completed later
                console.log('Transactions loading - implementation pending');
                // TODO: Implement proper transaction loading
                // const txResponse = await apiClient.getUserTransactions(wallet.address, wallet.chainUID);
                // Process and update walletStore.updateWalletTransactions(wallet.chainUID, transactions);
            }
            catch (error) {
                console.warn(`⚠️ Failed to load transactions for ${wallet.chainUID}:`, error.message);
            }
        }
    }
    calculatePoolShare(lpTokenBalance, poolInfo) {
        try {
            const lpBalance = parseFloat(lpTokenBalance);
            const totalSupply = parseFloat(String(poolInfo.totalSupply || poolInfo.liquidity || '0'));
            if (totalSupply === 0)
                return 0;
            return (lpBalance / totalSupply) * 100;
        }
        catch {
            return 0;
        }
    }
    calculateTokenAmount(sharePercentage, tokenInfo) {
        try {
            const reserve = parseFloat(String(tokenInfo.reserve || tokenInfo.balance || '0'));
            const amount = (reserve * sharePercentage) / 100;
            return amount.toString();
        }
        catch {
            return '0';
        }
    }
    calculatePositionValue(sharePercentage, poolInfo) {
        try {
            const tvl = parseFloat(String(poolInfo.tvl || poolInfo.liquidity || '0'));
            const value = (tvl * sharePercentage) / 100;
            return value.toString();
        }
        catch {
            return '0';
        }
    }
    setupPeriodicRefresh() {
        this.clearPeriodicRefresh();
        this.refreshTimer = window.setInterval(async () => {
            // Check if we have connected wallets
            const connectedWallets = walletStore.getAllConnectedWallets();
            if (connectedWallets.length > 0) {
                console.log('🔄 Refreshing wallet data...');
                await this.refreshUserData();
            }
        }, DEFAULTS.BALANCE_REFRESH_INTERVAL);
    }
    clearPeriodicRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    async refreshUserData() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        if (connectedWallets.length === 0)
            return;
        try {
            this.isLoading = true;
            await Promise.all([
                this.loadUserBalances(),
                this.loadLiquidityPositions()
            ]);
            // Portfolio value calculation to be implemented later
            console.log('Portfolio value calculation - implementation pending');
            this.retryCount = 0;
        }
        catch (error) {
            console.warn('⚠️ Failed to refresh user data:', error);
            await this.handleLoadError(error);
        }
        finally {
            this.isLoading = false;
        }
    }
    async handleLoadError(error) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
            console.log(`🔄 Retrying user data load (${this.retryCount}/${this.maxRetries})...`);
            // Exponential backoff
            const delay = Math.pow(2, this.retryCount) * 1000;
            setTimeout(() => {
                this.refreshUserData();
            }, delay);
        }
        else {
            console.error('❌ Max retries reached for user data loading');
            this.error = error.message || 'Failed to load user data';
        }
    }
    async handleRefreshRequest() {
        console.log('🔄 Manual user data refresh requested');
        await this.refreshUserData();
    }
    handleClearRequest() {
        console.log('🗑️ User data clear requested');
        walletStore.clear();
        this.clearPeriodicRefresh();
    }
    onInitializedChange(newValue) {
        if (newValue) {
            // Emit initialization complete event
            dispatchEuclidEvent(EUCLID_EVENTS.USER.CONTROLLER_READY, {
                timestamp: Date.now()
            });
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
}, [256, "euclid-user-data-controller", {
        "isInitialized": [32],
        "isLoading": [32],
        "error": [32]
    }, [[8, "euclid:user:refresh-data", "handleRefreshRequest"], [8, "euclid:user:clear-data", "handleClearRequest"]], {
        "isInitialized": ["onInitializedChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-user-data-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-user-data-controller":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidUserDataController);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidUserDataController as E, defineCustomElement as d };
//# sourceMappingURL=p-B5-fHFCm.js.map

//# sourceMappingURL=p-B5-fHFCm.js.map