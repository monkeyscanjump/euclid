import { Component, Listen, State, Watch } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { apiClient } from '../../../utils/api-client';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';

@Component({
  tag: 'euclid-tx-tracker-controller',
  shadow: true,
})
export class EuclidTxTrackerController {
  @State() isInitialized = false;
  private trackingTransactions: Map<string, { chainUID: string; type: string; pollCount: number }> = new Map();
  private trackingInterval: number;

  async componentDidLoad() {
    await this.initialize();
  }

  disconnectedCallback() {
    this.stopTracking();
  }

  private async initialize() {
    console.log('🔍 Initializing Transaction Tracker Controller...');

    // Start periodic tracking
    this.startTracking();

    this.isInitialized = true;
    console.log('✅ Transaction Tracker Controller initialized');
  }

  private startTracking() {
    // Check transactions every 10 seconds
    this.trackingInterval = window.setInterval(() => {
      this.checkPendingTransactions();
    }, 10000);
  }

  private stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  }

  // Track a specific transaction
  async trackTransaction(
    txHash: string,
    chainUID: string,
    type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer'
  ): Promise<void> {
    console.log('🔍 Starting to track transaction:', { txHash, chainUID, type });

    this.trackingTransactions.set(txHash, { chainUID, type, pollCount: 0 });

    // Check immediately
    await this.checkTransactionStatus(txHash, chainUID, type);
  }

  private async checkPendingTransactions() {
    const promises = Array.from(this.trackingTransactions.entries()).map(
      ([txHash, { chainUID, type, pollCount }]) =>
        this.checkTransactionStatus(txHash, chainUID, type, pollCount)
    );

    await Promise.allSettled(promises);
  }

  private async checkTransactionStatus(
    txHash: string,
    chainUID: string,
    type: string,
    currentPollCount = 0
  ): Promise<void> {
    try {
      console.log(`🔍 Checking transaction status: ${txHash}`);

      const response = await apiClient.trackTransactionWrapped(txHash, chainUID);

      if (response.success && response.data) {
        const { status } = response.data;

        // Update transaction status in wallet store
        walletStore.updateTransactionStatus(chainUID, txHash, status as 'pending' | 'confirmed' | 'failed');

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
        } else {
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
          } else {
            this.trackingTransactions.set(txHash, { chainUID, type, pollCount: newPollCount });
          }
        }
      } else {
        console.warn(`⚠️ Failed to check transaction status: ${txHash}`, response.error);
      }
    } catch (error) {
      console.error(`❌ Error checking transaction status: ${txHash}`, error);
    }
  }

  private refreshUserDataAfterSuccess(chainUID: string, type: string) {
    // Emit events to refresh relevant data after successful transactions
    dispatchEuclidEvent(EUCLID_EVENTS.USER.REFRESH_DATA);

    if (type === 'add_liquidity' || type === 'remove_liquidity') {
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.POSITIONS_REFRESH);
    }

    // Refresh balances for the affected chain
    dispatchEuclidEvent(EUCLID_EVENTS.USER.BALANCES_REFRESH, { chainUID });
  }

  // Get tracking statistics
  getTrackingStats(): {
    totalTracking: number;
    byType: Record<string, number>;
    byChain: Record<string, number>;
  } {
    const stats = {
      totalTracking: this.trackingTransactions.size,
      byType: {} as Record<string, number>,
      byChain: {} as Record<string, number>,
    };

    this.trackingTransactions.forEach(({ chainUID, type }) => {
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byChain[chainUID] = (stats.byChain[chainUID] || 0) + 1;
    });

    return stats;
  }

  // Manual transaction status check
  async checkTransactionManually(txHash: string, chainUID: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.trackTransactionWrapped(txHash, chainUID);

      if (response.success && response.data) {
        return {
          success: true,
          status: response.data.status,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to check transaction status',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Event listeners
  @Listen(EUCLID_EVENTS.TRANSACTION.SUBMITTED, { target: 'window' })
  async handleTransactionSubmitted(event: CustomEvent<{
    txHash: string;
    chainUID: string;
    type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
  }>) {
    const { txHash, chainUID, type } = event.detail;
    console.log('🔍 Transaction submitted, starting tracking:', event.detail);
    await this.trackTransaction(txHash, chainUID, type);
  }

  @Listen(EUCLID_EVENTS.TRANSACTION.TRACK_REQUEST, { target: 'window' })
  async handleTrackTransactionRequest(event: CustomEvent<{
    txHash: string;
    chainUID: string;
    type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
  }>) {
    const { txHash, chainUID, type } = event.detail;
    console.log('🔍 Manual transaction tracking requested:', event.detail);
    await this.trackTransaction(txHash, chainUID, type);
  }

  @Listen(EUCLID_EVENTS.TRANSACTION.STOP_TRACKING, { target: 'window' })
  handleStopTrackingTransaction(event: CustomEvent<{ txHash: string }>) {
    const { txHash } = event.detail;
    console.log('⏹️ Stopping transaction tracking:', txHash);
    this.trackingTransactions.delete(txHash);
  }

  @Listen(EUCLID_EVENTS.TRANSACTION.GET_STATS, { target: 'window' })
  handleGetTrackingStats() {
    const stats = this.getTrackingStats();
    dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.STATS_RESPONSE, stats);
  }

  @Watch('isInitialized')
  onInitializedChange(newValue: boolean) {
    if (newValue) {
      console.log('🔍 Transaction Tracker Controller ready');
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
