import { p as proxyCustomElement, H } from './p-neZz74Yz.js';
import { s as swapStore } from './p-jwRVyWST.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as apiClient } from './p-Wc26abo-.js';
import { W as WalletAdapterFactory } from './p-BMm0inSs.js';
import { D as DEFAULTS } from './p-a3yxdMSu.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';

const EuclidSwapController = /*@__PURE__*/ proxyCustomElement(class EuclidSwapController extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.isInitialized = false;
        this.routePollingActive = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.stopRoutePolling();
    }
    async initialize() {
        console.log('🔄 Initializing Swap Controller...');
        // Subscribe to swap store changes for smart polling
        swapStore.onChange('fromToken', () => this.handleTokenChange());
        swapStore.onChange('toToken', () => this.handleTokenChange());
        swapStore.onChange('fromAmount', () => this.handleAmountChange());
        this.isInitialized = true;
        console.log('✅ Swap Controller initialized');
    }
    handleTokenChange() {
        // Clear existing routes when tokens change
        swapStore.setRoutes([]);
        swapStore.setSelectedRoute(undefined);
        this.stopRoutePolling();
        // Start polling if we have both tokens and an amount
        if (swapStore.state.fromToken && swapStore.state.toToken && swapStore.state.fromAmount) {
            this.startRoutePolling();
        }
    }
    handleAmountChange() {
        const { fromToken, toToken, fromAmount } = swapStore.state;
        if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
            // Debounce the route fetching
            this.debounceRouteFetch();
        }
        else {
            this.stopRoutePolling();
            swapStore.setRoutes([]);
        }
    }
    debounceRouteFetch() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = window.setTimeout(() => {
            this.startRoutePolling();
        }, 500); // 500ms debounce
    }
    startRoutePolling() {
        if (this.routePollingActive)
            return;
        console.log('🔄 Starting route polling...');
        this.routePollingActive = true;
        // Fetch routes immediately
        this.fetchRoutes();
        // Set up periodic polling
        this.routePollingInterval = window.setInterval(() => {
            this.fetchRoutes();
        }, DEFAULTS.ROUTE_REFRESH_INTERVAL);
    }
    stopRoutePolling() {
        if (!this.routePollingActive)
            return;
        console.log('⏹️ Stopping route polling...');
        this.routePollingActive = false;
        if (this.routePollingInterval) {
            clearInterval(this.routePollingInterval);
        }
    }
    async fetchRoutes() {
        const { fromToken, toToken, fromAmount } = swapStore.state;
        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
            return;
        }
        try {
            swapStore.setLoadingRoutes(true);
            console.log('🛣️ Fetching swap routes:', {
                from: fromToken.symbol,
                to: toToken.symbol,
                amount: fromAmount,
            });
            // Call the routes API
            const response = await apiClient.getRoutesWrapped({
                amount_in: fromAmount,
                token_in: fromToken.id,
                token_out: toToken.id,
                external: true,
            });
            if (response.success && response.data) {
                const routePaths = response.data.paths || [];
                // Store the RoutePath[] directly
                swapStore.setRoutes(routePaths);
                // Auto-select the best route (first one, typically best by default)
                if (routePaths.length > 0 && !swapStore.state.selectedRoute) {
                    swapStore.setSelectedRoute(routePaths[0]);
                }
                console.log(`✅ Found ${routePaths.length} swap routes`);
            }
            else {
                console.warn('⚠️ Failed to fetch routes:', response.error);
                swapStore.setRoutes([]);
            }
        }
        catch (error) {
            console.error('❌ Error fetching routes:', error);
            swapStore.setRoutes([]);
        }
        finally {
            swapStore.setLoadingRoutes(false);
        }
    }
    getUserAddressForChain(chainUID) {
        const wallet = walletStore.getWallet(chainUID);
        return wallet?.address;
    }
    // Execute swap transaction
    async executeSwap() {
        try {
            const { fromToken, toToken, fromAmount, selectedRoute, slippage } = swapStore.state;
            if (!fromToken || !toToken || !fromAmount || !selectedRoute) {
                return { success: false, error: 'Missing required swap parameters' };
            }
            // Check if wallet is connected for the required chain
            const wallet = walletStore.getWallet(fromToken.chainUID);
            if (!wallet?.isConnected) {
                return { success: false, error: `Wallet not connected for ${fromToken.chainUID}` };
            }
            // Check sufficient balance
            if (!walletStore.hasSufficientBalance(fromToken.chainUID, fromToken.id, fromAmount)) {
                return { success: false, error: 'Insufficient balance' };
            }
            swapStore.setSwapping(true);
            console.log('🔄 Executing swap...', {
                from: fromToken.symbol,
                to: toToken.symbol,
                amount: fromAmount,
                route: selectedRoute.id,
            });
            // Get the wallet adapter for signing
            const walletAdapter = WalletAdapterFactory.getAdapter(wallet.type);
            if (!walletAdapter) {
                return { success: false, error: `Wallet adapter not found for ${wallet.type}` };
            }
            // Execute the swap via API - create a basic SwapRequest structure
            const swapResult = await apiClient.createSwapTransactionWrapped({
                amount_in: fromAmount,
                asset_in: {
                    token: fromToken.id,
                    token_type: { native: { denom: fromToken.id } }
                },
                slippage: slippage.toString(),
                minimum_receive: this.calculateMinimumReceived(selectedRoute.outputAmount, slippage),
                sender: {
                    address: wallet.address,
                    chain_uid: fromToken.chain_uid || fromToken.chainUID
                },
                swap_path: {
                    path: selectedRoute.path || []
                },
                timeout: (Math.floor(Date.now() / 1000) + 1200).toString() // 20 minutes from now
            });
            if (swapResult.success && swapResult.data) {
                const txHash = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                // Add transaction to wallet store
                walletStore.addTransaction(fromToken.chainUID, {
                    txHash,
                    timestamp: Date.now(),
                    type: 'swap'
                });
                // Emit global event for transaction tracking
                dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
                    txHash,
                    chainUID: fromToken.chainUID,
                    type: 'swap',
                });
                console.log('✅ Swap transaction submitted:', txHash);
                return { success: true, txHash };
            }
            else {
                return { success: false, error: swapResult.error || 'Swap execution failed' };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Swap execution error:', errorMessage);
            return { success: false, error: errorMessage };
        }
        finally {
            swapStore.setSwapping(false);
        }
    }
    calculateMinimumReceived(outputAmount, slippage) {
        try {
            const amount = BigInt(outputAmount);
            const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100)); // Convert to basis points
            const minimumReceived = (amount * slippageMultiplier) / BigInt(10000);
            return minimumReceived.toString();
        }
        catch {
            return outputAmount; // Fallback to original amount
        }
    }
    // Event listeners
    async handleSwapExecution() {
        console.log('🔄 Swap execution requested via event');
        const result = await this.executeSwap();
        // Emit result event
        if (result.success) {
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_SUCCESS, {
                txHash: result.txHash,
            });
        }
        else {
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_FAILED, {
                error: result.error,
            });
        }
    }
    handleRouteRefresh() {
        console.log('🔄 Manual route refresh requested');
        this.fetchRoutes();
    }
    handleStopPolling() {
        this.stopRoutePolling();
    }
    handleStartPolling() {
        this.startRoutePolling();
    }
    onInitializedChange(newValue) {
        if (newValue) {
            console.log('📊 Swap Controller ready for route polling');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
}, [256, "euclid-swap-controller", {
        "isInitialized": [32]
    }, [[8, "euclid:swap:execute-request", "handleSwapExecution"], [8, "euclid:swap:routes-refresh", "handleRouteRefresh"], [8, "euclid:swap:routes-stop-polling", "handleStopPolling"], [8, "euclid:swap:routes-start-polling", "handleStartPolling"]], {
        "isInitialized": ["onInitializedChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-swap-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-swap-controller":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidSwapController);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidSwapController as E, defineCustomElement as d };
//# sourceMappingURL=p-DDbN2KEt.js.map

//# sourceMappingURL=p-DDbN2KEt.js.map