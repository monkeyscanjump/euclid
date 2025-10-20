import { Component, h, State, Listen, Watch } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { apiClient } from '../../../utils/api-client';
import { DEFAULTS } from '../../../utils/constants';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { UserBalance, WalletInfo } from '../../../utils/types';

interface BalanceItem {
  denom: string;
  amount: string;
}

interface BalanceData {
  balance?: {
    all?: BalanceItem[];
  };
}

@Component({
  tag: 'euclid-user-data-controller',
  shadow: true,
})
export class EuclidUserDataController {
  @State() isInitialized = false;
  @State() isLoading = false;
  @State() error: string | null = null;

  private refreshTimer: number;
  private retryCount = 0;
  private maxRetries = 3;

  async componentDidLoad() {
    await this.initialize();
  }

  disconnectedCallback() {
    this.clearPeriodicRefresh();
    walletStore.dispose?.();
  }

  private async initialize() {
    console.log('👤 Initializing User Data Controller...');

    // Listen for wallet connection changes
    walletStore.onChange('wallets', async (wallets) => {
      const connectedWallets = Array.from(wallets.values()).filter(wallet => wallet.isConnected);
      if (connectedWallets.length > 0) {
        await this.handleWalletConnection(connectedWallets);
      } else {
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

  private async handleWalletConnection(_wallets: WalletInfo[]) {
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

    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      await this.handleLoadError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleWalletDisconnection() {
    console.log('🔌 Wallets disconnected, clearing user data...');

    this.clearPeriodicRefresh();
    this.retryCount = 0;

    // Clear all wallet data
    walletStore.clear();
  }

  private async loadUserBalances() {
    const connectedWallets = walletStore.getAllConnectedWallets();

    for (const wallet of connectedWallets) {
      try {
        console.log(`💰 Loading balances for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

        const balanceResponse = await apiClient.getBalance(wallet.address, wallet.chainUID);

        if (balanceResponse.success && balanceResponse.data) {
          const balanceData = balanceResponse.data as BalanceData;
          if (balanceData.balance?.all) {
            const chainBalances: UserBalance[] = balanceData.balance.all.map(item => ({
              tokenId: item.denom,
              amount: item.amount,
              chainUID: wallet.chainUID,
              address: wallet.address,
              lastUpdated: Date.now()
            }));

            // Update wallet store with balances for this chain
            walletStore.updateWalletBalances(wallet.chainUID, chainBalances);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load balance for ${wallet.chainUID}:`, error.message);
        // Continue loading other addresses even if one fails
      }
    }

    console.log(`✅ Updated balances for connected wallets`);
  }

  private async loadLiquidityPositions() {
    const connectedWallets = walletStore.getAllConnectedWallets();

    for (const wallet of connectedWallets) {
      try {
        console.log(`🏊 Loading liquidity positions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

        // Stub implementation - to be completed later
        console.log('Liquidity positions loading - implementation pending');

        // TODO: Implement proper liquidity position loading
        // const poolsResponse = await apiClient.getUserPools(wallet.address);
        // Process and update walletStore.updateWalletPositions(wallet.chainUID, positions);

      } catch (error) {
        console.warn(`⚠️ Failed to load liquidity positions for ${wallet.chainUID}:`, error.message);
      }
    }
  }

  private async loadUserTransactions() {
    const connectedWallets = walletStore.getAllConnectedWallets();

    for (const wallet of connectedWallets) {
      try {
        console.log(`📊 Loading transactions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);

        // Stub implementation - to be completed later
        console.log('Transactions loading - implementation pending');

        // TODO: Implement proper transaction loading
        // const txResponse = await apiClient.getUserTransactions(wallet.address, wallet.chainUID);
        // Process and update walletStore.updateWalletTransactions(wallet.chainUID, transactions);

      } catch (error) {
        console.warn(`⚠️ Failed to load transactions for ${wallet.chainUID}:`, error.message);
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
        console.log('🔄 Refreshing wallet data...');
        await this.refreshUserData();
      }
    }, DEFAULTS.BALANCE_REFRESH_INTERVAL);
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
      console.log('Portfolio value calculation - implementation pending');

      this.retryCount = 0;

    } catch (error) {
      console.warn('⚠️ Failed to refresh user data:', error);
      await this.handleLoadError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleLoadError(error: Error) {
    this.retryCount++;

    if (this.retryCount < this.maxRetries) {
      console.log(`🔄 Retrying user data load (${this.retryCount}/${this.maxRetries})...`);

      // Exponential backoff
      const delay = Math.pow(2, this.retryCount) * 1000;
      setTimeout(() => {
        this.refreshUserData();
      }, delay);

    } else {
      console.error('❌ Max retries reached for user data loading');
      this.error = error.message || 'Failed to load user data';
    }
  }

  @Listen(EUCLID_EVENTS.USER.REFRESH_DATA, { target: 'window' })
  async handleRefreshRequest() {
    console.log('🔄 Manual user data refresh requested');
    await this.refreshUserData();
  }

  @Listen(EUCLID_EVENTS.USER.CLEAR_DATA, { target: 'window' })
  handleClearRequest() {
    console.log('🗑️ User data clear requested');
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
