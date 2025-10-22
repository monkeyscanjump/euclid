import { Component, Prop, h, State, Event, EventEmitter, Listen, Element, Watch } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { marketStore } from '../../../store/market.store';
import { appStore } from '../../../store/app.store';
import { euclidAPI } from '../../../utils/core-api';
import type { UserBalance, TokenMetadata } from '../../../utils/types/api.types';

export interface WalletEntry {
  id: string;
  address: string;
  chainUID: string;
  walletType: 'keplr' | 'metamask' | 'phantom' | 'cosmostation' | 'custom';
  chainName: string;
  isConnected: boolean;
  isCustom: boolean;
  label?: string;
  balances: UserBalance[];
  totalValue: number;
  lastUpdated?: Date;
  error?: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  balance: string;
  value: number;
  price: number;
  priceChange24h: number;
  allocation: number;
}

export interface PortfolioData {
  wallets: Map<string, WalletEntry>;
  aggregatedBalances: Map<string, TokenBalance>;
  totalPortfolioValue: number;
  totalWalletCount: number;
  connectedWalletCount: number;
  customWalletCount: number;
  chainDistribution: Map<string, { walletCount: number; totalValue: number }>;
  lastGlobalUpdate: Date;
}

@Component({
  tag: 'euclid-portfolio',
  styleUrl: 'euclid-portfolio.css',
  shadow: true,
})
export class EuclidPortfolio {
  @Element() element!: HTMLElement;

  /**
   * Custom wallet address for testing (can be multiple addresses separated by comma)
   */
  @Prop() walletAddress: string = '';

  /**
   * Custom chain UID for the wallet address (defaults to osmosis-1 if not specified)
   */
  @Prop() customChainUID: string = 'osmosis-1';

  /**
   * Whether to include custom wallet addresses in the portfolio
   */
  @Prop() includeCustomWallets: boolean = true;

  /**
   * Whether to auto-refresh portfolio data
   */
  @Prop() autoRefresh: boolean = true;

  /**
   * Refresh interval in milliseconds
   */
  @Prop() refreshIntervalMs: number = 60000;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Portfolio';

  // Internal state
  @State() activeTab: 'overview' | 'wallets' | 'analytics' = 'overview';
  @State() portfolioData: PortfolioData = {
    wallets: new Map(),
    aggregatedBalances: new Map(),
    totalPortfolioValue: 0,
    totalWalletCount: 0,
    connectedWalletCount: 0,
    customWalletCount: 0,
    chainDistribution: new Map(),
    lastGlobalUpdate: new Date()
  };

  @State() isLoadingData: boolean = false;
  @State() selectedWalletFilter: 'all' | 'connected' | 'custom' = 'all';
  @State() selectedChainFilter: string = 'all';

  // Events
  @Event() portfolioUpdated: EventEmitter<PortfolioData>;

  private updateTimeout: number | null = null;
  private dataRefreshTimeout: number | null = null;
  private isInitialized: boolean = false;
  private tokenMetadataCache: Map<string, TokenMetadata> = new Map();

  componentWillLoad() {
    console.log('🌐 Euclid portfolio component initializing...');

    // Subscribe to wallet store changes with simple debouncing
    walletStore.onChange('connectedWallets', () => {
      console.log('🌐 Portfolio detected connectedWallets change');
      this.scheduleWalletUpdate();
    });

    walletStore.onChange('isConnected', () => {
      console.log('🌐 Portfolio detected isConnected change');
      this.scheduleWalletUpdate();
    });

    walletStore.onChange('address', () => {
      console.log('🌐 Portfolio detected address change');
      this.scheduleWalletUpdate();
    });

    // Subscribe to market store for token metadata updates with smart batching
    marketStore.onChange('tokens', () => {
      console.log('🌐 Portfolio detected token data change, scheduling refresh');
      this.scheduleDataRefresh();
    });

    // Initialize portfolio with state manager
    this.initializePortfolio();
    this.isInitialized = true;

    // Start periodic refresh if enabled
    if (this.autoRefresh) {
      this.startPeriodicRefresh();
    }
  }

  componentDidLoad() {
    console.log('✅ Euclid portfolio component loaded with state manager');
  }

  @Watch('walletAddress')
  async walletAddressChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue && this.isInitialized) {
      console.log('🔧 Wallet address prop changed, updating custom wallets:', newValue);
      if (this.includeCustomWallets && newValue.trim()) {
        await this.addCustomWalletsIncremental();
      }
    }
  }



  /**
   * Schedule wallet updates with intelligent debouncing
   */
  private scheduleWalletUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = window.setTimeout(() => {
      this.updateWalletDataIncrementally();
      this.updateTimeout = null;
    }, 200); // Slightly longer debounce for wallet updates
  }

  /**
   * Schedule data refresh with smart batching
   */
  private scheduleDataRefresh() {
    if (this.dataRefreshTimeout) {
      clearTimeout(this.dataRefreshTimeout);
    }

    this.dataRefreshTimeout = window.setTimeout(() => {
      this.refreshPortfolioDataIncrementally();
      this.dataRefreshTimeout = null;
    }, 300); // Longer debounce for data refresh
  }



  disconnectedCallback() {
    // Clean up state manager


    // Clean up timeouts
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
    if (this.dataRefreshTimeout) {
      clearTimeout(this.dataRefreshTimeout);
      this.dataRefreshTimeout = null;
    }

    console.log('🗑️ Portfolio component disconnected and cleaned up');
  }

  private debouncedWalletUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = window.setTimeout(() => {
      this.initializePortfolio();
      this.updateTimeout = null;
    }, 100);
  }

  private async initializePortfolio() {
    console.log('🌐 Initializing Euclid portfolio...');

    // Reset portfolio data
    this.portfolioData = {
      wallets: new Map(),
      aggregatedBalances: new Map(),
      totalPortfolioValue: 0,
      totalWalletCount: 0,
      connectedWalletCount: 0,
      customWalletCount: 0,
      chainDistribution: new Map(),
      lastGlobalUpdate: new Date()
    };

    // Discover connected wallets
    await this.discoverConnectedWallets();

    // Add custom wallet addresses if specified
    if (this.includeCustomWallets && this.walletAddress) {
      await this.addCustomWallets();
    }

    // Load portfolio data for all wallets
    await this.loadPortfolioData();

    console.log('✅ Euclid portfolio initialized with', this.portfolioData.totalWalletCount, 'wallets');
    this.portfolioUpdated.emit(this.portfolioData);
  }

  /**
   * Incremental Methods - Prevent Full Component Re-renders
   */

  private async updateWalletDataIncrementally() {
    console.log('🔄 Updating wallet data incrementally...');


    if (!this.portfolioData.wallets) return;

    // Get current wallets and update only if needed
    const existingWallets = new Map(this.portfolioData.wallets);
    let hasChanges = false;

    // Check for new/updated connected wallets
    const connectedWallets = walletStore.state.connectedWallets;
    let walletEntries: [string, { address: string; walletType?: string; type?: string; name?: string; balances?: unknown[] }][] = [];

    if (connectedWallets instanceof Map) {
      walletEntries = Array.from(connectedWallets.entries());
    } else if (typeof connectedWallets === 'object' && connectedWallets !== null) {
      walletEntries = Object.entries(connectedWallets) as typeof walletEntries;
    }

    // Also check primary wallet
    if (walletStore.state.isConnected && walletStore.state.address && walletEntries.length === 0) {
      walletEntries.push([
        walletStore.state.chainUID || 'osmosis-1',
        {
          address: walletStore.state.address,
          walletType: walletStore.state.walletType || 'unknown',
          name: walletStore.state.walletType || 'Primary Wallet',
          balances: walletStore.state.balances || []
        }
      ]);
    }

    const walletUpdates = new Map();

    for (const [chainUID, walletInfo] of walletEntries) {
      const walletId = `connected-${chainUID}-${walletInfo.address}`;
      const existingWallet = existingWallets.get(walletId);

      // Check if wallet data actually changed
      const chain = marketStore.state.chains.find(c => c.chain_uid === chainUID);
      const chainName = chain ? chain.display_name : chainUID;

      const walletEntry = {
        id: walletId,
        address: walletInfo.address,
        chainUID,
        walletType: (walletInfo.walletType || walletInfo.type || 'unknown') as 'keplr' | 'leap' | 'cosmostation' | 'custom' | 'unknown',
        chainName,
        isConnected: true,
        isCustom: false,
        label: `${walletInfo.name || walletInfo.walletType || 'Wallet'} (${chainName})`,
        balances: walletInfo.balances || [],
        totalValue: (existingWallet as WalletEntry)?.totalValue || 0,
        lastUpdated: new Date()
      };

      // Only update if wallet is new or data changed
      if (!existingWallet || JSON.stringify(existingWallet) !== JSON.stringify(walletEntry)) {
        walletUpdates.set(walletId, walletEntry);
        hasChanges = true;
      }
    }

    // Apply updates if there are changes
    if (hasChanges) {
      // Update portfolio data directly
      for (const [walletId, wallet] of walletUpdates) {
        this.portfolioData.wallets.set(walletId, wallet);
      }
      this.portfolioData.totalWalletCount = this.portfolioData.wallets.size;
      this.portfolioData.lastGlobalUpdate = new Date();
      this.portfolioUpdated.emit(this.portfolioData);
    }
  }

  private async refreshPortfolioDataIncrementally() {
    console.log('🔄 Refreshing portfolio data incrementally...');


    if (!this.portfolioData.wallets) return;

    // Only refresh balance data, not wallet structure
    const walletUpdates = new Map();

    for (const wallet of this.portfolioData.wallets.values()) {
      try {
        const balanceData = await this.loadWalletBalanceDataSmart(wallet);
        if (balanceData) {
          walletUpdates.set(wallet.id, balanceData);
        }
      } catch (error) {
        console.warn(`Failed to refresh wallet ${wallet.id}:`, error);
      }
    }

    if (walletUpdates.size > 0) {
      // Update portfolio data directly
      for (const [walletId, wallet] of walletUpdates) {
        this.portfolioData.wallets.set(walletId, wallet);
      }
      this.portfolioData.totalWalletCount = this.portfolioData.wallets.size;
      this.portfolioData.lastGlobalUpdate = new Date();
    }
  }

  private async discoverConnectedWalletsIncremental() {
    console.log('🔍 Discovering connected wallets incrementally...');
    await this.updateWalletDataIncrementally();
  }

  private async addCustomWalletsIncremental() {
    if (!this.walletAddress.trim()) return;

    console.log('➕ Adding custom wallets incrementally...');

    const addresses = this.walletAddress.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
    const walletUpdates = new Map();

    for (const address of addresses) {
      const walletId = `custom-${this.customChainUID}-${address}`;
      const chain = marketStore.state.chains.find(c => c.chain_uid === this.customChainUID);
      const chainName = chain ? chain.display_name : this.customChainUID;

      const walletEntry = {
        id: walletId,
        address,
        chainUID: this.customChainUID,
        walletType: 'custom' as const,
        chainName,
        isConnected: false,
        isCustom: true,
        label: `Custom Wallet (${chainName})`,
        balances: [],
        totalValue: 0,
        lastUpdated: new Date()
      };

      walletUpdates.set(walletId, walletEntry);
    }

    if (walletUpdates.size > 0) {
      // Update portfolio data directly
      for (const [walletId, wallet] of walletUpdates) {
        this.portfolioData.wallets.set(walletId, wallet);
      }
      this.portfolioData.customWalletCount += walletUpdates.size;
      this.portfolioData.totalWalletCount = this.portfolioData.wallets.size;
      this.portfolioData.lastGlobalUpdate = new Date();
    }
  }

  private async loadPortfolioDataIncremental() {
    console.log('📊 Loading portfolio data incrementally...');


    if ( this.portfolioData.wallets.size === 0) {
      console.log('No wallets to load data for');
      return;
    }

    this.isLoadingData = true;

    try {
      // Load balance data for all wallets with smart batching
      const loadPromises: Promise<void>[] = [];
      const walletUpdates = new Map();

      for (const wallet of this.portfolioData.wallets.values()) {
        loadPromises.push(
          this.loadWalletBalanceDataSmart(wallet).then(updatedWallet => {
            if (updatedWallet) {
              walletUpdates.set(wallet.id, updatedWallet);
            }
          }).catch(error => {
            console.warn(`Failed to load data for wallet ${wallet.id}:`, error);
          })
        );
      }

      // Wait for all wallet data to load
      await Promise.allSettled(loadPromises);

      // Batch update all wallets
      if (walletUpdates.size > 0) {
        // Update portfolio data directly
        for (const [walletId, wallet] of walletUpdates) {
          this.portfolioData.wallets.set(walletId, wallet);
        }
        this.portfolioData.totalWalletCount = this.portfolioData.wallets.size;
        this.portfolioData.lastGlobalUpdate = new Date();
      }

      // Aggregate portfolio data
      await this.aggregatePortfolioIncremental();

    } catch (error) {
      console.error('❌ Failed to load portfolio data incrementally:', error);
    } finally {
      this.isLoadingData = false;
    }
  }

  private async loadWalletBalanceDataSmart(wallet: WalletEntry): Promise<Partial<WalletEntry> | null> {
    try {
      // Skip loading if data is fresh (less than 30 seconds old)
      if (wallet.lastUpdated && (Date.now() - wallet.lastUpdated.getTime()) < 30000) {
        return null; // No update needed
      }

      let balances: UserBalance[] = [];

      // Try getUserBalances first
      try {
        const crossChainUser = {
          address: wallet.address,
          chain_uid: wallet.chainUID
        };
        balances = await euclidAPI.getUserBalances(crossChainUser);
      } catch {
        // Fallback to getBalances
        try {
          const balanceData = await euclidAPI.getBalances(wallet.address, wallet.chainUID);
          if (Array.isArray(balanceData)) {
            balances = balanceData;
          } else if (balanceData && typeof balanceData === 'object' && 'balances' in balanceData) {
            const balanceResponse = balanceData as { balances: Array<{ denom: string; amount: string; chain_uid?: string }> };
            balances = balanceResponse.balances.map(b => ({
              amount: b.amount,
              token_id: b.denom,
              token: b.denom,
              balance: b.amount,
              chain_uid: b.chain_uid || wallet.chainUID
            }));
          }
        } catch (balanceError) {
          console.warn(`Failed to load balance for ${wallet.address}:`, balanceError);
          return {
            error: balanceError instanceof Error ? balanceError.message : 'Failed to load balance',
            lastUpdated: new Date()
          };
        }
      }

      return {
        balances,
        lastUpdated: new Date(),
        error: undefined
      };

    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      };
    }
  }

  private async aggregatePortfolioIncremental() {
    console.log('🧮 Aggregating portfolio incrementally...');


    if (!this.portfolioData.wallets) return;

    const tokenBalanceMap = new Map();
    let totalValue = 0;

    // Process all wallets efficiently
    for (const wallet of this.portfolioData.wallets.values()) {
      for (const balance of wallet.balances) {
        const tokenId = balance.token_id || balance.token || '';
        if (!tokenId || parseFloat(balance.amount) === 0) continue;

        let tokenBalance = tokenBalanceMap.get(tokenId);
        if (!tokenBalance) {
          const metadata = await this.getTokenMetadataCached(tokenId);
          tokenBalance = {
            symbol: metadata?.displayName || tokenId,
            name: metadata?.displayName || tokenId,
            address: tokenId,
            decimals: metadata?.coinDecimal || 18,
            logoUrl: metadata?.image || '',
            balance: '0',
            value: 0,
            price: metadata?.price ? parseFloat(metadata.price) : 0,
            priceChange24h: metadata?.price_change_24h || 0,
            allocation: 0
          };
          tokenBalanceMap.set(tokenId, tokenBalance);
        }

        const currentBalance = parseFloat(tokenBalance.balance) || 0;
        const newAmount = parseFloat(balance.amount) || 0;
        tokenBalance.balance = (currentBalance + newAmount).toString();
        tokenBalance.value = parseFloat(tokenBalance.balance) * tokenBalance.price;
        totalValue += tokenBalance.value;
      }
    }

    // Calculate allocations
    for (const tokenBalance of tokenBalanceMap.values()) {
      tokenBalance.allocation = totalValue > 0 ? (tokenBalance.value / totalValue) * 100 : 0;
    }

    // Update state with new aggregated data

  }

  private async getTokenMetadataCached(tokenId: string) {
    if (this.tokenMetadataCache.has(tokenId)) {
      return this.tokenMetadataCache.get(tokenId) || null;
    }

    try {
      const tokenFromStore = marketStore.state.tokens.find(t =>
        t.tokenId === tokenId || t.id === tokenId || t.address === tokenId
      );

      if (tokenFromStore) {
        this.tokenMetadataCache.set(tokenId, tokenFromStore);
        return tokenFromStore;
      }

      const metadata = await euclidAPI.getTokenById(tokenId);
      if (metadata) {
        this.tokenMetadataCache.set(tokenId, metadata);
        return metadata;
      }
    } catch (error) {
      console.warn(`Failed to get metadata for token ${tokenId}:`, error);
    }

    return null;
  }

  /**
   * Legacy Methods - Keep for compatibility but redirect to incremental versions
   */

  private async discoverConnectedWallets() {
    console.log('🔍 Redirecting to incremental wallet discovery...');
    await this.discoverConnectedWalletsIncremental();
  }

  private async addCustomWallets() {
    console.log('➕ Redirecting to incremental custom wallet addition...');
    await this.addCustomWalletsIncremental();
    // Clear the input
    this.walletAddress = '';
  }

  private async loadPortfolioData() {
    console.log('📊 Redirecting to incremental portfolio data loading...');
    await this.loadPortfolioDataIncremental();
  }

  private startPeriodicRefresh() {
    if (!this.autoRefresh) return;

    // Set up periodic refresh using incremental updates
    this.dataRefreshTimeout = window.setInterval(() => {
      this.refreshPortfolioDataIncrementally();
    }, this.refreshIntervalMs);

    console.log(`🔄 Started periodic refresh every ${this.refreshIntervalMs/1000}s`);
  }



  private handleConnectWallet = () => {
    console.log('🚀 CONNECT WALLET BUTTON CLICKED! Opening wallet modal...');
    appStore.openWalletModal();
  };

  // Custom wallet form state
  @State() isAddingCustomWallet: boolean = false;
  @State() customWalletForm: { address: string; chainUID: string; label: string } = {
    address: '',
    chainUID: 'osmosis-1',
    label: ''
  };

  private handleAddCustomWallet = () => {
    console.log('🔧 Opening custom wallet form...');
    this.isAddingCustomWallet = true;
    this.customWalletForm = {
      address: '',
      chainUID: 'osmosis-1',
      label: ''
    };
  };

  private handleSaveCustomWallet = async () => {
    console.log('💾 Saving custom wallet...');

    if (!this.customWalletForm.address || !this.customWalletForm.chainUID) {
      console.log('❌ Address and chain UID are required');
      return;
    }

    const address = this.customWalletForm.address.trim();
    const chainUID = this.customWalletForm.chainUID.trim();
    const label = this.customWalletForm.label.trim() || `Custom Wallet`;

    console.log(`➕ Adding custom wallet: ${address} on ${chainUID}`);

    // Create custom wallet entry
    const walletId = `custom-${chainUID}-${address}`;
    const chain = marketStore.state.chains.find(c => c.chain_uid === chainUID);
    const chainName = chain ? chain.display_name : chainUID;

    const walletEntry = {
      id: walletId,
      address: address,
      chainUID: chainUID,
      walletType: 'custom' as const,
      chainName,
      isConnected: false,
      isCustom: true,
      label: `${label} (${chainName})`,
      balances: [],
      totalValue: 0,
      lastUpdated: new Date()
    };

    // Add the wallet using state manager
    const walletUpdates = new Map();
    walletUpdates.set(walletId, walletEntry);


    // Load balance data for the new wallet
    try {
      const balanceData = await this.loadWalletBalanceDataSmart(walletEntry);
      if (balanceData) {
        const updatedWalletData = new Map();
        updatedWalletData.set(walletId, balanceData);

      }
    } catch (error) {
      console.error('❌ Failed to load balance data for custom wallet:', error);
    }

    // Close the form
    this.isAddingCustomWallet = false;
    console.log('✅ Custom wallet added successfully');
  };

  private handleCancelCustomWallet = () => {
    console.log('❌ Cancelling custom wallet form');
    this.isAddingCustomWallet = false;
    this.customWalletForm = { address: '', chainUID: 'osmosis-1', label: '' };
  };

  private handleRemoveWallet = async (wallet: WalletEntry) => {
    console.log('🗑️ Removing wallet:', wallet.id);

    if (wallet.isConnected && !wallet.isCustom) {
      // Disconnect connected wallet
      try {
        await walletStore.disconnectWallet(wallet.chainUID);
        console.log('✅ Wallet disconnected successfully');
      } catch (error) {
        console.error('❌ Failed to disconnect wallet:', error);
      }
    }

    // Remove wallet from state manager

    console.log('✅ Wallet removed from portfolio');
  };

  private debugPortfolio = () => {
    console.log('🔍 DEBUG: Euclid Portfolio State');
    console.log('- Total Wallets:', this.portfolioData.totalWalletCount);
    console.log('- Connected Wallets:', this.portfolioData.connectedWalletCount);
    console.log('- Custom Wallets:', this.portfolioData.customWalletCount);
    console.log('- Total Portfolio Value:', this.portfolioData.totalPortfolioValue);
    console.log('- Aggregated Tokens:', this.portfolioData.aggregatedBalances.size);
    console.log('- Chain Distribution:', Array.from(this.portfolioData.chainDistribution.entries()));
    console.log('- All Wallets:', Array.from(this.portfolioData.wallets.values()));
    console.log('- Wallet Store State:', {
      isConnected: walletStore.state.isConnected,
      address: walletStore.state.address,
      connectedWallets: walletStore.state.connectedWallets
    });
  };

  private formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(decimals)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(decimals)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
  }

  private formatPercent(value: number, decimals: number = 2): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  }

  private getFilteredWallets(): WalletEntry[] {
    const wallets = Array.from(this.portfolioData.wallets.values());

    let filtered = wallets;

    // Filter by wallet type
    if (this.selectedWalletFilter === 'connected') {
      filtered = filtered.filter(w => w.isConnected && !w.isCustom);
    } else if (this.selectedWalletFilter === 'custom') {
      filtered = filtered.filter(w => w.isCustom);
    }

    // Filter by chain
    if (this.selectedChainFilter !== 'all') {
      filtered = filtered.filter(w => w.chainUID === this.selectedChainFilter);
    }

    return filtered.sort((a, b) => b.totalValue - a.totalValue);
  }

  private renderOverviewTab() {
    const aggregatedTokens = Array.from(this.portfolioData.aggregatedBalances.values())
      .sort((a, b) => b.value - a.value);

    return (
      <div class="overview-tab">

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Value</div>
            <div class="stat-value">${this.formatNumber(this.portfolioData.totalPortfolioValue)}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Wallets</div>
            <div class="stat-value">{this.portfolioData.totalWalletCount}</div>
            <div class="stat-change">
              {this.portfolioData.connectedWalletCount} connected, {this.portfolioData.customWalletCount} custom
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Chains</div>
            <div class="stat-value">{this.portfolioData.chainDistribution.size}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Tokens</div>
            <div class="stat-value">{this.portfolioData.aggregatedBalances.size}</div>
          </div>
        </div>

        <div class="allocation-section">
          <h3>Token Holdings</h3>
          <div class="allocation-grid">
            {aggregatedTokens.slice(0, 10).map(token => (
              <div key={token.symbol} class="allocation-item">
                <div class="token-info">
                  {token.logoUrl && (
                    <img src={token.logoUrl} alt={token.symbol} class="token-logo" />
                  )}
                  <div class="token-details">
                    <div class="token-symbol">{token.symbol}</div>
                    <div class="token-balance">{parseFloat(token.balance).toFixed(4)}</div>
                  </div>
                </div>
                <div class="token-value">
                  <div class="value-primary">${this.formatNumber(token.value)}</div>
                  <div class="allocation-percent">{token.allocation.toFixed(1)}%</div>
                </div>
                <div class={{
                  'price-change': true,
                  'price-change--positive': token.priceChange24h >= 0,
                  'price-change--negative': token.priceChange24h < 0,
                }}>
                  {this.formatPercent(token.priceChange24h)}
                </div>
              </div>
            ))}
            {aggregatedTokens.length === 0 && !this.isLoadingData && (
              <div class="empty-allocation">
                <div class="empty-icon">📊</div>
                <div class="empty-text">No token balances found</div>
                <div class="empty-subtext">
                  {this.portfolioData.totalWalletCount > 0 ? (
                    `Checked ${this.portfolioData.totalWalletCount} wallet${this.portfolioData.totalWalletCount !== 1 ? 's' : ''}`
                  ) : (
                    'No wallets connected or configured'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderCustomWalletForm() {
    return (
      <div class="custom-wallet-form">
        <div class="form-header">
          <h3>Add Custom Wallet</h3>
          <button
            class="close-btn"
            onClick={this.handleCancelCustomWallet}
            type="button"
          >
            ✕
          </button>
        </div>

        <div class="form-fields">
          <div class="field">
            <label>Wallet Address</label>
            <input
              type="text"
              placeholder="0x... or cosmos..."
              value={this.customWalletForm.address}
              onInput={(e) => {
                this.customWalletForm = {
                  ...this.customWalletForm,
                  address: (e.target as HTMLInputElement).value
                };
              }}
            />
          </div>

          <div class="field">
            <label>Chain</label>
            <select
              onInput={(e) => {
                this.customWalletForm = {
                  ...this.customWalletForm,
                  chainUID: (e.target as HTMLSelectElement).value
                };
              }}
            >
              <option value="osmosis-1" selected={this.customWalletForm.chainUID === 'osmosis-1'}>Osmosis</option>
              <option value="cosmoshub-4" selected={this.customWalletForm.chainUID === 'cosmoshub-4'}>Cosmos Hub</option>
              <option value="ethereum" selected={this.customWalletForm.chainUID === 'ethereum'}>Ethereum</option>
              <option value="polygon" selected={this.customWalletForm.chainUID === 'polygon'}>Polygon</option>
              <option value="arbitrum" selected={this.customWalletForm.chainUID === 'arbitrum'}>Arbitrum</option>
              <option value="bsc" selected={this.customWalletForm.chainUID === 'bsc'}>BSC</option>
            </select>
          </div>

          <div class="field">
            <label>Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g., My DeFi Wallet"
              value={this.customWalletForm.label}
              onInput={(e) => {
                this.customWalletForm = {
                  ...this.customWalletForm,
                  label: (e.target as HTMLInputElement).value
                };
              }}
            />
          </div>
        </div>

        <div class="form-actions">
          <euclid-button
            variant="secondary"
            onClick={this.handleCancelCustomWallet}
          >
            Cancel
          </euclid-button>
          <euclid-button
            variant="primary"
            onClick={this.handleSaveCustomWallet}
            disabled={!this.customWalletForm.address || !this.customWalletForm.chainUID}
          >
            Add Wallet
          </euclid-button>
        </div>
      </div>
    );
  }

  private renderWalletsTab() {
    const filteredWallets = this.getFilteredWallets();
    const availableChains = Array.from(this.portfolioData.chainDistribution.keys());

    return (
      <div class="wallets-tab">
        {/* Quick Actions */}
        <div class="quick-actions">
          <euclid-button
            variant="primary"
            onClick={this.handleConnectWallet}
          >
            🔗 Connect Wallet
          </euclid-button>
          <euclid-button
            variant="secondary"
            onClick={this.handleAddCustomWallet}
          >
            ➕ Add Custom Address
          </euclid-button>
          <euclid-button
            variant="ghost"
            onClick={() => this.loadPortfolioData()}
            disabled={this.isLoadingData}
          >
            {this.isLoadingData ? '⏳ Loading...' : '🔄 Refresh All'}
          </euclid-button>
        </div>

        {/* Custom Wallet Form */}
        {this.isAddingCustomWallet && this.renderCustomWalletForm()}

        <div class="wallets-header">
          <h3>Wallets ({filteredWallets.length})</h3>
          <div class="wallet-filters">
            <select
              onInput={(e) => this.selectedWalletFilter = (e.target as HTMLSelectElement).value as 'all' | 'connected' | 'custom'}
            >
              <option value="all" selected={this.selectedWalletFilter === 'all'}>All Wallets</option>
              <option value="connected" selected={this.selectedWalletFilter === 'connected'}>Connected ({this.portfolioData.connectedWalletCount})</option>
              <option value="custom" selected={this.selectedWalletFilter === 'custom'}>Custom ({this.portfolioData.customWalletCount})</option>
            </select>

            <select
              onInput={(e) => this.selectedChainFilter = (e.target as HTMLSelectElement).value}
            >
              <option value="all" selected={this.selectedChainFilter === 'all'}>All Chains</option>
              {availableChains.map(chainUID => {
                const chain = marketStore.state.chains.find(c => c.chain_uid === chainUID);
                return (
                  <option key={chainUID} value={chainUID} selected={this.selectedChainFilter === chainUID}>
                    {chain?.display_name || chainUID}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div class="wallets-list">
          {filteredWallets.map(wallet => (
            <div key={wallet.id} class="wallet-card">
              <div class="wallet-header">
                <div class="wallet-info">
                  <div class="wallet-address-display">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </div>
                  <div class="wallet-meta">
                    <span class="wallet-chain">{wallet.chainName}</span>
                    <span class={{
                      'wallet-status': true,
                      'wallet-status--connected': wallet.isConnected,
                      'wallet-status--custom': wallet.isCustom,
                    }}>
                      {wallet.isCustom ? 'Custom' : wallet.isConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div class="wallet-value">
                  <div class="value-primary">${this.formatNumber(wallet.totalValue)}</div>
                  <div class="token-count">{wallet.balances.length} tokens</div>
                </div>
              </div>

              {wallet.error && (
                <div class="wallet-error">
                  ⚠️ {wallet.error}
                </div>
              )}

              {wallet.balances.length > 0 && (
                <div class="wallet-tokens">
                  {wallet.balances.slice(0, 3).map((balance, index) => (
                    <div key={index} class="token-preview">
                      <span class="token-symbol">{balance.token_id || balance.token || 'Unknown'}</span>
                      <span class="token-amount">{parseFloat(balance.amount).toFixed(4)}</span>
                    </div>
                  ))}
                  {wallet.balances.length > 3 && (
                    <div class="more-tokens">
                      +{wallet.balances.length - 3} more
                    </div>
                  )}
                </div>
              )}

              <div class="wallet-actions">
                {wallet.lastUpdated && (
                  <span class="last-updated">
                    Updated {Math.floor((Date.now() - wallet.lastUpdated.getTime()) / 60000)}m ago
                  </span>
                )}
                <div class="wallet-buttons">
                  {wallet.isConnected && !wallet.isCustom && (
                    <button
                      class="action-btn action-btn--disconnect"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleRemoveWallet(wallet);
                      }}
                      type="button"
                      title="Disconnect wallet"
                    >
                      🔌 Disconnect
                    </button>
                  )}
                  {wallet.isCustom && (
                    <button
                      class="action-btn action-btn--remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleRemoveWallet(wallet);
                      }}
                      type="button"
                      title="Remove custom wallet"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredWallets.length === 0 && (
            <div class="empty-wallets">
              <div class="empty-icon">👛</div>
              <div class="empty-text">No wallets found</div>
              <div class="empty-subtext">
                {this.selectedWalletFilter === 'connected' && 'Connect a wallet using the button above to get started'}
                {this.selectedWalletFilter === 'custom' && 'Add custom wallet addresses via component props'}
                {this.selectedWalletFilter === 'all' && 'Use the "Connect New Wallet" button above to add wallets'}
              </div>
              {this.selectedWalletFilter === 'connected' && (
                <div style={{ marginTop: 'var(--euclid-space-4)' }}>
                  <euclid-button
                    variant="primary"
                    onClick={this.handleConnectWallet}
                  >
                    Connect Your First Wallet
                  </euclid-button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.isLoadingData && this.portfolioData.totalWalletCount === 0) {
      return (
        <div class="portfolio loading">
          <div class="loading-spinner"></div>
          <span>Loading portfolio...</span>
        </div>
      );
    }

    if (this.portfolioData.totalWalletCount === 0) {
      return (
        <div class="portfolio empty">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
            </svg>
            <span>Euclid Portfolio</span>
            <p>Connect wallets or add custom addresses to start tracking your multi-chain portfolio.</p>
            <div class="empty-actions">
              <euclid-button
                variant="primary"
                onClick={this.handleConnectWallet}
              >
                Connect Wallet
              </euclid-button>
              <euclid-button
                variant="secondary"
                onClick={this.handleAddCustomWallet}
              >
                Add Custom Address
              </euclid-button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div class="portfolio">
        <div class="portfolio-header">
          <h2 class="portfolio-title">{this.cardTitle}</h2>
          <div class="portfolio-summary">
            <div class="summary-item">
              <span class="summary-value">${this.formatNumber(this.portfolioData.totalPortfolioValue)}</span>
              <span class="summary-label">Total Value</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{this.portfolioData.totalWalletCount}</span>
              <span class="summary-label">Wallets</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{this.portfolioData.chainDistribution.size}</span>
              <span class="summary-label">Chains</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{this.portfolioData.aggregatedBalances.size}</span>
              <span class="summary-label">Tokens</span>
            </div>
          </div>
          <div class="portfolio-actions">
            <euclid-button
              variant="primary"
              size="sm"
              onClick={this.handleConnectWallet}
            >
              🔗 Add Wallet
            </euclid-button>
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={() => this.loadPortfolioData()}
              disabled={this.isLoadingData}
            >
              {this.isLoadingData ? '⏳' : '🔄'} Refresh
            </euclid-button>
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={this.debugPortfolio}
            >
              🔍 Debug
            </euclid-button>
          </div>
        </div>

        <div class="portfolio-tabs">
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'overview',
            }}
            onClick={() => this.activeTab = 'overview'}
            type="button"
          >
            Overview
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'wallets',
            }}
            onClick={() => this.activeTab = 'wallets'}
            type="button"
          >
            Wallets ({this.portfolioData.totalWalletCount})
          </button>
          <button
            class={{
              'tab-btn': true,
              'tab-btn--active': this.activeTab === 'analytics',
            }}
            onClick={() => this.activeTab = 'analytics'}
            type="button"
          >
            Analytics
          </button>
        </div>

        <div class="portfolio-content">
          {this.activeTab === 'overview' && this.renderOverviewTab()}
          {this.activeTab === 'wallets' && this.renderWalletsTab()}
          {this.activeTab === 'analytics' && (
            <div class="analytics-tab">
              <h3>Portfolio Analytics</h3>
              <p>Advanced analytics coming soon...</p>
            </div>
          )}
        </div>

        {this.isLoadingData && (
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <span>Loading portfolio data...</span>
          </div>
        )}
      </div>
    );
  }

  @Listen('euclid:wallet:connect-success', { target: 'window' })
  handleWalletConnected(event?: CustomEvent<{ chainUID: string; walletType: string; address: string }>) {
    console.log('🌐 Portfolio detected wallet connection:', event?.detail);
    this.debouncedWalletUpdate();
  }

  @Listen('euclid:wallet:disconnect-success', { target: 'window' })
  handleWalletDisconnected(event?: CustomEvent<{ chainUID: string }>) {
    console.log('🌐 Portfolio detected wallet disconnection:', event?.detail);
    this.debouncedWalletUpdate();
  }
}
