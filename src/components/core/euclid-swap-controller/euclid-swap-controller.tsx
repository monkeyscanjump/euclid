import { Component, Listen, State, Watch } from '@stencil/core';
import { swapStore } from '../../../store/swap.store';
import { walletStore } from '../../../store/wallet.store';
import { apiClient } from '../../../utils/api-client';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';
import { DEFAULTS } from '../../../utils/constants';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { RoutePath } from '../../../utils/types/euclid-api.types';
import type { SwapRoute } from '../../../utils/types/api.types';

@Component({
  tag: 'euclid-swap-controller',
  shadow: true,
})
export class EuclidSwapController {
  @State() isInitialized = false;
  private routePollingInterval: number;
  private routePollingActive = false;

  async componentDidLoad() {
    await this.initialize();
  }

  disconnectedCallback() {
    this.stopRoutePolling();
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

    // Set up periodic polling
    this.routePollingInterval = window.setInterval(() => {
      this.fetchRoutes();
    }, DEFAULTS.ROUTE_REFRESH_INTERVAL);
  }

  private stopRoutePolling() {
    if (!this.routePollingActive) return;

    console.log('⏹️ Stopping route polling...');
    this.routePollingActive = false;

    if (this.routePollingInterval) {
      clearInterval(this.routePollingInterval);
    }
  }

  private async fetchRoutes() {
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
      const response = await apiClient.getRoutes({
        amount_in: fromAmount,
        token_in: fromToken.id,
        token_out: toToken.id,
        external: true,
      });

      if (response.success && response.data) {
        const routePaths = response.data.paths || [];

        // Convert RoutePath[] to SwapRoute[]
        const swapRoutes: SwapRoute[] = routePaths.map((route: RoutePath, index: number) => ({
          id: `route-${index}`,
          inputToken: fromToken,
          outputToken: toToken,
          inputAmount: amount,
          outputAmount: route.path[route.path.length - 1]?.amount_out || '0',
          priceImpact: route.total_price_impact || '0',
          fee: '0', // Fee calculation would need to be derived from route data
          path: route.path.map(hop => hop.route).flat(),
          estimatedTime: route.path.length * 30 // Rough estimate: 30s per hop
        }));

        swapStore.setRoutes(swapRoutes);

        // Auto-select the best route (first one, typically best by default)
        if (swapRoutes.length > 0 && !swapStore.state.selectedRoute) {
          swapStore.setSelectedRoute(swapRoutes[0]);
        }

        console.log(`✅ Found ${swapRoutes.length} swap routes`);
      } else {
        console.warn('⚠️ Failed to fetch routes:', response.error);
        swapStore.setRoutes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching routes:', error);
      swapStore.setRoutes([]);
    } finally {
      swapStore.setLoadingRoutes(false);
    }
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

      // Execute the swap via API
      const swapResult = await apiClient.createSwapTransaction({
        routeId: selectedRoute.id,
        fromTokenId: fromToken.id,
        toTokenId: toToken.id,
        fromAmount: fromAmount,
        toAmountMinimum: this.calculateMinimumReceived(selectedRoute.outputAmount, slippage),
        slippage: slippage,
        userAddress: wallet.address,
        deadline: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
      });

      if (swapResult.success && swapResult.data) {
        const txHash = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add transaction to wallet store
        walletStore.addTransaction(fromToken.chainUID, {
          txHash,
          fromAddress: wallet.address,
          chainUID: fromToken.chainUID,
          type: 'swap',
          status: 'pending',
          timestamp: Date.now().toString(),
          amount: fromAmount,
          tokenId: fromToken.symbol,
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
