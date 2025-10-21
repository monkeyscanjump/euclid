import { walletStore } from "../../../store/wallet.store";
import { apiClient } from "../../../utils/api-client";
import { EUCLID_EVENTS, dispatchEuclidEvent } from "../../../utils/events";
export class EuclidTxTrackerController {
    constructor() {
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
    static get is() { return "euclid-tx-tracker-controller"; }
    static get states() {
        return {
            "isInitialized": {}
        };
    }
    static get watchers() {
        return [{
                "propName": "isInitialized",
                "methodName": "onInitializedChange"
            }];
    }
    static get listeners() {
        return [{
                "name": "euclid:transaction:submitted",
                "method": "handleTransactionSubmitted",
                "target": "window",
                "capture": false,
                "passive": false
            }, {
                "name": "euclid:transaction:track-request",
                "method": "handleTrackTransactionRequest",
                "target": "window",
                "capture": false,
                "passive": false
            }, {
                "name": "euclid:transaction:stop-tracking",
                "method": "handleStopTrackingTransaction",
                "target": "window",
                "capture": false,
                "passive": false
            }, {
                "name": "euclid:transaction:get-stats",
                "method": "handleGetTrackingStats",
                "target": "window",
                "capture": false,
                "passive": false
            }];
    }
}
//# sourceMappingURL=euclid-tx-tracker-controller.js.map
