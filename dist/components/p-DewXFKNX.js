import { p as proxyCustomElement, H } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as apiClient } from './p-Wc26abo-.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';

const EuclidTxTrackerController = /*@__PURE__*/ proxyCustomElement(class EuclidTxTrackerController extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.isInitialized = false;
        this.trackingTransactions = new Map();
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.stopTracking();
    }
    async initialize() {
        console.log('🔍 Initializing Transaction Tracker Controller...');
        // Start periodic tracking
        this.startTracking();
        this.isInitialized = true;
        console.log('✅ Transaction Tracker Controller initialized');
    }
    startTracking() {
        // Check transactions every 10 seconds
        this.trackingInterval = window.setInterval(() => {
            this.checkPendingTransactions();
        }, 10000);
    }
    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
    }
    // Track a specific transaction
    async trackTransaction(txHash, chainUID, type) {
        console.log('🔍 Starting to track transaction:', { txHash, chainUID, type });
        this.trackingTransactions.set(txHash, { chainUID, type, pollCount: 0 });
        // Check immediately
        await this.checkTransactionStatus(txHash, chainUID, type);
    }
    async checkPendingTransactions() {
        const promises = Array.from(this.trackingTransactions.entries()).map(([txHash, { chainUID, type, pollCount }]) => this.checkTransactionStatus(txHash, chainUID, type, pollCount));
        await Promise.allSettled(promises);
    }
    async checkTransactionStatus(txHash, chainUID, type, currentPollCount = 0) {
        try {
            console.log(`🔍 Checking transaction status: ${txHash}`);
            const response = await apiClient.trackTransactionWrapped(txHash, chainUID);
            if (response.success && response.data) {
                const { status } = response.data;
                // Update transaction status in wallet store
                walletStore.updateTransactionStatus(chainUID, txHash, status);
                if (status === 'confirmed' || status === 'failed') {
                    // Transaction is final, stop tracking
                    this.trackingTransactions.delete(txHash);
                    // Emit global event with final status
                    dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.FINALIZED, {
                        txHash,
                        chainUID,
                        type,
                        status,
                    });
                    console.log(`✅ Transaction finalized: ${txHash} - Status: ${status}`);
                    // If successful, refresh user data to update balances/positions
                    if (status === 'confirmed') {
                        this.refreshUserDataAfterSuccess(chainUID, type);
                    }
                }
                else {
                    // Still pending, continue tracking with incremented poll count
                    const newPollCount = currentPollCount + 1;
                    // Stop tracking after 120 polls (20 minutes with 10s intervals)
                    if (newPollCount >= 120) {
                        console.warn(`⚠️ Transaction tracking timeout: ${txHash}`);
                        this.trackingTransactions.delete(txHash);
                        // Mark as failed due to timeout
                        walletStore.updateTransactionStatus(chainUID, txHash, 'failed');
                        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.TIMEOUT, {
                            txHash,
                            chainUID,
                            type
                        });
                    }
                    else {
                        this.trackingTransactions.set(txHash, { chainUID, type, pollCount: newPollCount });
                    }
                }
            }
            else {
                console.warn(`⚠️ Failed to check transaction status: ${txHash}`, response.error);
            }
        }
        catch (error) {
            console.error(`❌ Error checking transaction status: ${txHash}`, error);
        }
    }
    refreshUserDataAfterSuccess(chainUID, type) {
        // Emit events to refresh relevant data after successful transactions
        dispatchEuclidEvent(EUCLID_EVENTS.USER.REFRESH_DATA);
        if (type === 'add_liquidity' || type === 'remove_liquidity') {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.POSITIONS_REFRESH);
        }
        // Refresh balances for the affected chain
        dispatchEuclidEvent(EUCLID_EVENTS.USER.BALANCES_REFRESH, { chainUID });
    }
    // Get tracking statistics
    getTrackingStats() {
        const stats = {
            totalTracking: this.trackingTransactions.size,
            byType: {},
            byChain: {},
        };
        this.trackingTransactions.forEach(({ chainUID, type }) => {
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            stats.byChain[chainUID] = (stats.byChain[chainUID] || 0) + 1;
        });
        return stats;
    }
    // Manual transaction status check
    async checkTransactionManually(txHash, chainUID) {
        try {
            const response = await apiClient.trackTransactionWrapped(txHash, chainUID);
            if (response.success && response.data) {
                return {
                    success: true,
                    status: response.data.status,
                };
            }
            else {
                return {
                    success: false,
                    error: response.error || 'Failed to check transaction status',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    // Event listeners
    async handleTransactionSubmitted(event) {
        const { txHash, chainUID, type } = event.detail;
        console.log('🔍 Transaction submitted, starting tracking:', event.detail);
        await this.trackTransaction(txHash, chainUID, type);
    }
    async handleTrackTransactionRequest(event) {
        const { txHash, chainUID, type } = event.detail;
        console.log('🔍 Manual transaction tracking requested:', event.detail);
        await this.trackTransaction(txHash, chainUID, type);
    }
    handleStopTrackingTransaction(event) {
        const { txHash } = event.detail;
        console.log('⏹️ Stopping transaction tracking:', txHash);
        this.trackingTransactions.delete(txHash);
    }
    handleGetTrackingStats() {
        const stats = this.getTrackingStats();
        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.STATS_RESPONSE, stats);
    }
    onInitializedChange(newValue) {
        if (newValue) {
            console.log('🔍 Transaction Tracker Controller ready');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
}, [256, "euclid-tx-tracker-controller", {
        "isInitialized": [32]
    }, [[8, "euclid:transaction:submitted", "handleTransactionSubmitted"], [8, "euclid:transaction:track-request", "handleTrackTransactionRequest"], [8, "euclid:transaction:stop-tracking", "handleStopTrackingTransaction"], [8, "euclid:transaction:get-stats", "handleGetTrackingStats"]], {
        "isInitialized": ["onInitializedChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-tx-tracker-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-tx-tracker-controller":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidTxTrackerController);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidTxTrackerController as E, defineCustomElement as d };
//# sourceMappingURL=p-DewXFKNX.js.map

//# sourceMappingURL=p-DewXFKNX.js.map