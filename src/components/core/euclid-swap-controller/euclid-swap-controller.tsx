import { Component, Listen, State, Watch, Prop } from '@stencil/core';
import { swapStore } from '../../../store/swap.store';
import { walletStore } from '../../../store/wallet.store';
import { apiClient } from '../../../utils/api-client';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';
import { DEFAULTS } from '../../../utils/constants';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { requestManager } from '../../../utils/request-manager';
import { pollingCoordinator } from '../../../utils/polling-coordinator';

@Component({
  tag: 'euclid-swap-controller',
})
export class EuclidSwapController {
  @State() isInitialized = false;
  @Prop() config?: string; // JSON string of EuclidConfig

  private routePollingInterval: number;
  private routePollingActive = false;

  async componentWillLoad() {
    await this.initialize();
  }

  async componentDidLoad() {
    // Component is ready, no state changes needed here
  }

  disconnectedCallback() {
    this.stopRoutePolling();
    // Clean up any registered polling tasks
    pollingCoordinator.unregister('swap-routes');
  }

  private async initialize() {
    console.log('🔄 Initializing Swap Controller...');

    // Subscribe to swap store changes for smart polling
    swapStore.onChange('fromToken', () => this.handleTokenChange());
    swapStore.onChange('toToken', () => this.handleTokenChange());
    swapStore.onChange('fromAmount', () => this.handleAmountChange());

    this.isInitialized = true;
    console.log('✅ Swap Controller initialized');
  }

  private handleTokenChange() {
    // Clear existing routes when tokens change
    swapStore.setRoutes([]);
    swapStore.setSelectedRoute(undefined);
    this.stopRoutePolling();

    // Start polling if we have both tokens and an amount
    if (swapStore.state.fromToken && swapStore.state.toToken && swapStore.state.fromAmount) {
      this.startRoutePolling();
    }
  }

  private handleAmountChange() {
    const { fromToken, toToken, fromAmount } = swapStore.state;

    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      // Debounce the route fetching
      this.debounceRouteFetch();
    } else {
      this.stopRoutePolling();
      swapStore.setRoutes([]);
    }
  }

  private debounceTimeout: number;

  private debounceRouteFetch() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(() => {
      this.startRoutePolling();
    }, 500); // 500ms debounce
  }

  private startRoutePolling() {
    if (this.routePollingActive) return;

    console.log('🔄 Starting route polling...');
    this.routePollingActive = true;

    // Fetch routes immediately
    this.fetchRoutes();

    // Set up intelligent polling using PollingCoordinator
    pollingCoordinator.register(
      'swap-routes',
      async () => {
        await this.fetchRoutes();
      },
      {
        activeInterval: DEFAULTS.ROUTE_REFRESH_INTERVAL,
        backgroundInterval: DEFAULTS.ROUTE_REFRESH_INTERVAL * 3, // Slower when tab is hidden
        pauseOnHidden: false // Keep fetching routes even when tab is hidden (user might be waiting)
      }
    );
  }

  private stopRoutePolling() {
    if (!this.routePollingActive) return;

    console.log('⏹️ Stopping route polling...');
    this.routePollingActive = false;

    // Unregister from polling coordinator
    pollingCoordinator.unregister('swap-routes');

    if (this.routePollingInterval) {
      clearInterval(this.routePollingInterval);
    }
  }

  private async fetchRoutes() {
    const { fromToken, toToken, fromAmount } = swapStore.state;

    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      return;
    }

    // Use request manager for caching and deduplication
    const cacheKey = `routes-${fromToken.id}-${toToken.id}-${fromAmount}`;

    return requestManager.request(
      cacheKey,
      async () => {
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
            return { success: true, routeCount: routePaths.length };
          } else {
            console.warn('⚠️ Failed to fetch routes:', response.error);
            swapStore.setRoutes([]);
            return { success: false, error: response.error };
          }
        } catch (error) {
          console.error('❌ Error fetching routes:', error);
          swapStore.setRoutes([]);
          throw error;
        } finally {
          swapStore.setLoadingRoutes(false);
        }
      },
      { ttl: 5000 } // Cache for 5 seconds to avoid excessive API calls during rapid input changes
    );
  }

  private getUserAddressForChain(chainUID: string): string | undefined {
    const wallet = walletStore.getWallet(chainUID);
    return wallet?.address;
  }

  // Execute swap transaction
  async executeSwap(): Promise<{ success: boolean; txHash?: string; error?: string }> {
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
      } else {
        return { success: false, error: swapResult.error || 'Swap execution failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Swap execution error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      swapStore.setSwapping(false);
    }
  }

  private calculateMinimumReceived(outputAmount: string, slippage: number): string {
    try {
      const amount = BigInt(outputAmount);
      const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100)); // Convert to basis points
      const minimumReceived = (amount * slippageMultiplier) / BigInt(10000);
      return minimumReceived.toString();
    } catch {
      return outputAmount; // Fallback to original amount
    }
  }

  // Event listeners
  @Listen(EUCLID_EVENTS.SWAP.EXECUTE_REQUEST, { target: 'window' })
  async handleSwapExecution() {
    console.log('🔄 Swap execution requested via event');
    const result = await this.executeSwap();

    // Emit result event
    if (result.success) {
      dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_SUCCESS, {
        txHash: result.txHash,
      });
    } else {
      dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_FAILED, {
        error: result.error,
      });
    }
  }

  @Listen(EUCLID_EVENTS.SWAP.ROUTES_REFRESH, { target: 'window' })
  handleRouteRefresh() {
    console.log('🔄 Manual route refresh requested');
    this.fetchRoutes();
  }

  @Listen(EUCLID_EVENTS.SWAP.ROUTES_STOP_POLLING, { target: 'window' })
  handleStopPolling() {
    this.stopRoutePolling();
  }

  @Listen(EUCLID_EVENTS.SWAP.ROUTES_START_POLLING, { target: 'window' })
  handleStartPolling() {
    this.startRoutePolling();
  }

  @Watch('isInitialized')
  onInitializedChange(newValue: boolean) {
    if (newValue) {
      console.log('📊 Swap Controller ready for route polling');
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
