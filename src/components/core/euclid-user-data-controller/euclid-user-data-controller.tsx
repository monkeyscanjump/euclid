import { Component, h, State, Listen, Watch, Prop } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { euclidAPI } from '../../../utils/core-api';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { dataSubscriptionManager } from '../../../utils/data-subscription-manager';
import { requestManager } from '../../../utils/request-manager';
import { pollingCoordinator } from '../../../utils/polling-coordinator';
import { loadingManager } from '../../../utils/loading-state-manager';
import type { UserBalance, WalletInfo } from '../../../utils/types';
import type { EuclidConfig } from '../../../utils/env';
import { DEFAULT_CONFIG } from '../../../utils/env';
import { logger } from '../../../utils/logger';

@Component({
  tag: 'euclid-user-data-controller',
})
export class EuclidUserDataController {
  @State() isInitialized = false;
  @State() isLoading = false;
  @State() error: string | null = null;
  @Prop() config?: string; // JSON string of EuclidConfig

  private refreshTimer: number;
  private retryCount = 0;
  private maxRetries = 3;
  private euclidConfig: EuclidConfig;
  private walletChangeTimeout: number | null = null;

  async componentWillLoad() {
    // Parse configuration
    this.euclidConfig = this.config ? JSON.parse(this.config) : DEFAULT_CONFIG;

    // Initialize everything here to avoid re-renders
    await this.initialize();
  }

  async componentDidLoad() {
    // Component is ready, no state changes needed here
  }

  disconnectedCallback() {
    // Clean up polling tasks registered by subscription manager
    pollingCoordinator.unregister('subscription-balances');
    pollingCoordinator.unregister('subscription-liquidityPositions');
    pollingCoordinator.unregister('subscription-transactions');

    this.clearPeriodicRefresh();
    walletStore.dispose?.();
  }

  private async initialize() {
    logger.info('Component', '👤 Initializing User Data Controller...');

    // Listen for wallet connection changes with debouncing
    walletStore.onChange('wallets', async (wallets: Record<string, WalletInfo>) => {
      // Clear existing timeout to debounce rapid changes
      if (this.walletChangeTimeout) {
        clearTimeout(this.walletChangeTimeout);
      }

      // Debounce wallet changes to prevent infinite loops
      this.walletChangeTimeout = window.setTimeout(async () => {
        const connectedWallets = Object.values(wallets).filter(wallet => wallet.address);
        if (connectedWallets.length > 0) {
          await this.handleWalletConnection(connectedWallets);
        } else {
          this.handleWalletDisconnection();
        }
        this.walletChangeTimeout = null;
      }, 200);
    });

    // Initial check for already connected wallets
    const connectedWallets = walletStore.getAllConnectedWallets();
    if (connectedWallets.length > 0) {
      await this.handleWalletConnection(connectedWallets);
    }

    this.isInitialized = true;
    logger.info('Component', '✅ User Data Controller initialized');
  }

  private async handleWalletConnection(_wallets: WalletInfo[]) {
    try {
      this.isLoading = true;
      this.error = null;

      logger.info('Component', '🔗 Wallets connected, loading user data...');

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

    } catch (error) {
      logger.error('Component', '❌ Failed to load user data:', error);
      await this.handleLoadError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleWalletDisconnection() {
    // Prevent infinite loops - only clear if we're not already in a cleared state
    if (walletStore.state.isConnected || walletStore.getAllConnectedWallets().length > 0) {
      logger.info('Component', '🔌 Wallets disconnected, clearing user data...');

      this.clearPeriodicRefresh();
      this.retryCount = 0;

      // Clear all wallet data
      walletStore.clear();
    }
  }

  private async loadUserBalances() {
    // Only fetch balances if components are subscribed to balance data
    if (!dataSubscriptionManager.hasSubscriptions('balances')) {
      logger.info('Component', '💰 Skipping balance fetch - no active subscriptions');
      return;
    }

    const connectedWallets = walletStore.getAllConnectedWallets();

    // Use request manager for caching and deduplication
    return requestManager.request(
      'user-balances-fetch',
      async () => {
        const loadingId = 'user-balances';
        loadingManager.startLoading(loadingId, 'Loading balances...', { showProgress: true });

        try {
          const balancePromises = connectedWallets.map(async (wallet, index) => {
            logger.info('Component', `💰 Loading balances for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

            // Update progress
            const progress = ((index + 1) / connectedWallets.length) * 100;
            loadingManager.updateProgress(loadingId, progress, `Loading ${wallet.chainUID} balances...`);

            try {
              const balanceResponse = await euclidAPI.getBalances(wallet.address, wallet.chainUID);

              if (balanceResponse.balances && balanceResponse.balances.length > 0) {
                const chainBalances: UserBalance[] = balanceResponse.balances.map(item => ({
                  amount: item.amount,
                  token_id: item.denom,
                  // Legacy compatibility fields
                  token: item.denom,
                  balance: item.amount,
                  chain_uid: item.chain_uid,
                  token_type: { native: { denom: item.denom } }
                }));

                // Update wallet store with balances for this chain (with smart updates)
                walletStore.updateWalletBalances(wallet.chainUID, chainBalances);
                return chainBalances;
              }
              return [];
            } catch (error) {
              logger.warn('Component', `⚠️ Failed to load balance for ${wallet.chainUID}:`, error.message);
              return [];
            }
          });

          const results = await Promise.all(balancePromises);
          const totalBalances = results.flat().length;

          loadingManager.stopLoading(loadingId);
          logger.info('Component', `✅ Updated ${totalBalances} balances for ${connectedWallets.length} connected wallets`);

          return { success: true, balancesCount: totalBalances };
        } catch (error) {
          loadingManager.stopLoading(loadingId, error.message);
          throw error;
        }
      },
      { ttl: 15000 } // Cache for 15 seconds
    );
  }

  private async loadLiquidityPositions() {
    // Only fetch positions if components are subscribed to liquidity data
    if (!dataSubscriptionManager.hasSubscriptions('liquidityPositions')) {
      logger.info('Component', '🏊 Skipping liquidity positions fetch - no active subscriptions');
      return;
    }

    const connectedWallets = walletStore.getAllConnectedWallets();

    // Use request manager for caching and deduplication
    return requestManager.request(
      'user-liquidity-positions',
      async () => {
        const loadingId = 'liquidity-positions';
        loadingManager.startLoading(loadingId, 'Loading liquidity positions...', { showProgress: true });

        try {
          const positionPromises = connectedWallets.map(async (wallet, index) => {
            logger.info('Component', `🏊 Loading liquidity positions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

            // Update progress
            const progress = ((index + 1) / connectedWallets.length) * 100;
            loadingManager.updateProgress(loadingId, progress, `Loading ${wallet.chainUID} positions...`);

            try {
              // Stub implementation - to be completed when liquidity API methods are available
              logger.info('Component', 'Liquidity positions loading - implementation pending');

              // TODO: Implement proper liquidity position loading using existing API
              // const poolsResponse = await euclidAPI.getUserLiquidityPositions(wallet.address, wallet.chainUID);
              // Process and update walletStore.updateWalletPositions(wallet.chainUID, positions);

              return [];
            } catch (error) {
              logger.warn('Component', `⚠️ Failed to load liquidity positions for ${wallet.chainUID}:`, error.message);
              return [];
            }
          });

          const results = await Promise.all(positionPromises);
          const totalPositions = results.flat().length;

          loadingManager.stopLoading(loadingId);
          logger.info('Component', `✅ Updated ${totalPositions} liquidity positions for ${connectedWallets.length} connected wallets`);

          return { success: true, positionsCount: totalPositions };
        } catch (error) {
          loadingManager.stopLoading(loadingId, error.message);
          throw error;
        }
      },
      { ttl: 20000 } // Cache for 20 seconds
    );
  }

  private async loadUserTransactions() {
    // Only fetch transactions if components are subscribed to transaction data
    if (!dataSubscriptionManager.hasSubscriptions('transactions')) {
      logger.info('Component', '📊 Skipping transactions fetch - no active subscriptions');
      return;
    }

    const connectedWallets = walletStore.getAllConnectedWallets();

    for (const wallet of connectedWallets) {
      try {
        logger.info('Component', `📊 Loading transactions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

        // Stub implementation - to be completed later
        logger.info('Component', 'Transactions loading - implementation pending');

        // TODO: Implement proper transaction loading
        // const txResponse = await apiClient.getUserTransactions(wallet.address, wallet.chainUID);
        // Process and update walletStore.updateWalletTransactions(wallet.chainUID, transactions);

      } catch (error) {
        logger.warn('Component', `⚠️ Failed to load transactions for ${wallet.chainUID}:`, error.message);
      }
    }
  }

  private calculatePoolShare(lpTokenBalance: string, poolInfo: Record<string, unknown>): number {
    try {
      const lpBalance = parseFloat(lpTokenBalance);
      const totalSupply = parseFloat(String(poolInfo.totalSupply || poolInfo.liquidity || '0'));

      if (totalSupply === 0) return 0;
      return (lpBalance / totalSupply) * 100;
    } catch {
      return 0;
    }
  }

  private calculateTokenAmount(sharePercentage: number, tokenInfo: Record<string, unknown>): string {
    try {
      const reserve = parseFloat(String(tokenInfo.reserve || tokenInfo.balance || '0'));
      const amount = (reserve * sharePercentage) / 100;
      return amount.toString();
    } catch {
      return '0';
    }
  }

  private calculatePositionValue(sharePercentage: number, poolInfo: Record<string, unknown>): string {
    try {
      const tvl = parseFloat(String(poolInfo.tvl || poolInfo.liquidity || '0'));
      const value = (tvl * sharePercentage) / 100;
      return value.toString();
    } catch {
      return '0';
    }
  }

  private setupPeriodicRefresh() {
    this.clearPeriodicRefresh();

    this.refreshTimer = window.setInterval(async () => {
      // Check if we have connected wallets
      const connectedWallets = walletStore.getAllConnectedWallets();
      if (connectedWallets.length > 0) {
        logger.info('Component', '🔄 Refreshing wallet data...');
        await this.refreshUserData();
      }
    }, this.euclidConfig.refreshIntervals.balances);

    logger.info('Component', `👤 User data refresh interval set to ${this.euclidConfig.refreshIntervals.balances}ms`);
  }

  private clearPeriodicRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async refreshUserData() {
    const connectedWallets = walletStore.getAllConnectedWallets();
    if (connectedWallets.length === 0) return;

    try {
      this.isLoading = true;

      await Promise.all([
        this.loadUserBalances(),
        this.loadLiquidityPositions()
      ]);

      // Portfolio value calculation to be implemented later
      logger.info('Component', 'Portfolio value calculation - implementation pending');

      this.retryCount = 0;

    } catch (error) {
      logger.warn('Component', '⚠️ Failed to refresh user data:', error);
      await this.handleLoadError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleLoadError(error: Error) {
    this.retryCount++;

    if (this.retryCount < this.maxRetries) {
      logger.info('Component', `🔄 Retrying user data load (${this.retryCount}/${this.maxRetries})...`);

      // Exponential backoff
      const delay = Math.pow(2, this.retryCount) * 1000;
      setTimeout(() => {
        this.refreshUserData();
      }, delay);

    } else {
      logger.error('Component', '❌ Max retries reached for user data loading');
      this.error = error.message || 'Failed to load user data';
    }
  }

  @Listen(EUCLID_EVENTS.USER.REFRESH_DATA, { target: 'window' })
  async handleRefreshRequest() {
    logger.info('Component', '🔄 Manual user data refresh requested');
    await this.refreshUserData();
  }

  @Listen(EUCLID_EVENTS.USER.BALANCES_SUBSCRIBE, { target: 'window' })
  async handleBalancesSubscribe() {
    logger.info('Component', '💰 Component subscribed to balance data - triggering fetch');
    await this.loadUserBalances();
  }

  @Listen(EUCLID_EVENTS.USER.BALANCES_UNSUBSCRIBE, { target: 'window' })
  handleBalancesUnsubscribe() {
    logger.info('Component', '💰 Component unsubscribed from balance data');
    // Cleanup can be added here if needed
  }

  @Listen(EUCLID_EVENTS.LIQUIDITY.POSITIONS_SUBSCRIBE, { target: 'window' })
  async handleLiquidityPositionsSubscribe() {
    logger.info('Component', '🏊 Component subscribed to liquidity position data - triggering fetch');
    await this.loadLiquidityPositions();
  }

  @Listen(EUCLID_EVENTS.LIQUIDITY.POSITIONS_UNSUBSCRIBE, { target: 'window' })
  handleLiquidityPositionsUnsubscribe() {
    logger.info('Component', '🏊 Component unsubscribed from liquidity position data');
    // Cleanup can be added here if needed
  }

  @Listen(EUCLID_EVENTS.USER.CLEAR_DATA, { target: 'window' })
  handleClearRequest() {
    logger.info('Component', '🗑️ User data clear requested');
    walletStore.clear();
    this.clearPeriodicRefresh();
  }

  @Watch('isInitialized')
  onInitializedChange(newValue: boolean) {
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
}
