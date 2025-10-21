import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';
import { liquidityStore } from '../../../store/liquidity.store';
import { marketStore } from '../../../store/market.store';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';

export interface LiquidityToken {
  symbol: string;
  name: string;
  address: string;
  chainUID: string;
  decimals: number;
  logoUrl?: string;
  balance?: string;
  price?: number;
}

export interface LiquidityPoolInfo {
  address: string;
  tokenA: LiquidityToken;
  tokenB: LiquidityToken;
  reserveA: string;
  reserveB: string;
  totalSupply: string;
  lpTokenSymbol: string;
  fee: number; // 0.3 = 0.3%
  apy: number;
  tvl: number;
}

export interface LiquidityPosition {
  poolAddress: string;
  lpTokenBalance: string;
  shareOfPool: number;
  tokenAAmount: string;
  tokenBAmount: string;
  value: number;
}

export interface LiquidityQuote {
  tokenAAmount: string;
  tokenBAmount: string;
  lpTokensReceived: string;
  shareOfPool: number;
  priceImpact: number;
  minimumLpReceived: string;
}

export interface RemoveLiquidityQuote {
  lpTokenAmount: string;
  tokenAReceived: string;
  tokenBReceived: string;
  shareRemoved: number;
  minimumTokenAReceived: string;
  minimumTokenBReceived: string;
}

@Component({
  tag: 'euclid-liquidity-card',
  styleUrl: 'euclid-liquidity-card.css',
  shadow: true,
})
export class EuclidLiquidityCard {
  @Element() element!: HTMLElement;

  /**
   * Available tokens for liquidity provision (legacy - use store instead)
   * @deprecated Use marketStore instead
   */
  @Prop() tokens: LiquidityToken[] = [];

  /**
   * Available pools (legacy - use store instead)
   * @deprecated Use marketStore instead
   */
  @Prop() pools: LiquidityPoolInfo[] = [];

  /**
   * User's liquidity positions
   */
  @Prop() positions: LiquidityPosition[] = [];

  // Store data (automatically synced like pools-list)
  @State() storePools: PoolInfo[] = [];
  @State() storeTokens: TokenMetadata[] = [];
  @State() storeLoading: boolean = false;

  // Selected pool from store data (this is what we actually use)
  @State() selectedStorePool: PoolInfo | null = null;

  /**
   * Selected pool for liquidity operations
   */
  @Prop({ mutable: true }) selectedPool: LiquidityPoolInfo | null = null;

  /**
   * Current mode: 'add' or 'remove'
   */
  @Prop({ mutable: true }) mode: 'add' | 'remove' = 'add';

  /**
   * Token A amount input
   */
  @Prop({ mutable: true }) tokenAAmount: string = '';

  /**
   * Token B amount input
   */
  @Prop({ mutable: true }) tokenBAmount: string = '';

  /**
   * LP token amount for removal
   */
  @Prop({ mutable: true }) lpTokenAmount: string = '';

  /**
   * Whether the component is in loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Whether the liquidity functionality is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Connected wallet address
   */
  @Prop() walletAddress: string = '';

  /**
   * Default slippage tolerance (0.5 = 0.5%)
   */
  @Prop() defaultSlippage: number = 0.5;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Manage Liquidity';

  // Internal state
  @State() isPoolSelectorOpen: boolean = false;
    // Token selector type removed - no individual token selection needed
  @State() currentQuote: LiquidityQuote | null = null;
  @State() removeQuote: RemoveLiquidityQuote | null = null;
  @State() isQuoting: boolean = false;
  @State() slippage: number = this.defaultSlippage;
  @State() isAdvancedOpen: boolean = false;
  @State() lpPercentage: number = 0;

  // Events
  @Event() liquidityAdded: EventEmitter<{
    pool: LiquidityPoolInfo;
    tokenAAmount: string;
    tokenBAmount: string;
    expectedLpTokens: string;
    slippage: number;
  }>;

  @Event() liquidityRemoved: EventEmitter<{
    pool: LiquidityPoolInfo;
    lpTokenAmount: string;
    expectedTokenA: string;
    expectedTokenB: string;
    slippage: number;
  }>;

  @Event() poolSelected: EventEmitter<PoolInfo>;

  @Event() quoteRequested: EventEmitter<{
    pool: PoolInfo;
    tokenAAmount?: string;
    tokenBAmount?: string;
    lpTokenAmount?: string;
    mode: 'add' | 'remove';
  }>;

  // Quote update timer
  private quoteTimer: NodeJS.Timeout | null = null;

  componentWillLoad() {
    // Connect to market store for automatic data updates
    this.syncWithStore();

    // Listen for store changes
    marketStore.onChange('pools', () => {
      this.syncWithStore();
    });

    marketStore.onChange('tokens', () => {
      this.syncWithStore();
    });
  }

  componentDidLoad() {
    // Auto-quote when inputs change
    this.startQuoteTimer();
  }

  disconnectedCallback() {
    if (this.quoteTimer) {
      clearTimeout(this.quoteTimer);
    }
  }

  private syncWithStore() {
    // Use store data if available, fallback to legacy props
    this.storePools = marketStore.state.pools.length > 0 ? marketStore.state.pools : [];
    this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
    this.storeLoading = marketStore.state.loading;

    console.log('🔄 Liquidity card store sync:', {
      storePools: this.storePools.length,
      storeTokens: this.storeTokens.length,
      storeLoading: this.storeLoading
    });
  }

  @Listen('valueChange')
  handleInputChange(event: CustomEvent) {
    const inputId = (event.target as HTMLElement).id;

    if (inputId === 'token-a-input') {
      this.tokenAAmount = event.detail.value;
      this.calculateTokenBFromA();
    } else if (inputId === 'token-b-input') {
      this.tokenBAmount = event.detail.value;
      this.calculateTokenAFromB();
    } else if (inputId === 'lp-token-input') {
      this.lpTokenAmount = event.detail.value;
      this.startQuoteTimer();
    }
  }

  // Token selection removed - pools determine tokens

  @Listen('modalClose')
  handleModalClose() {
    this.isPoolSelectorOpen = false;
  }

  // findPoolWithToken method removed - pool selection is direct

  private calculateTokenBFromA() {
    if (!this.selectedPool || !this.tokenAAmount || parseFloat(this.tokenAAmount) <= 0) {
      this.tokenBAmount = '';
      return;
    }

    const pool = this.selectedPool;
    const reserveA = parseFloat(pool.reserveA);
    const reserveB = parseFloat(pool.reserveB);
    const amountA = parseFloat(this.tokenAAmount);

    // Calculate proportional amount for token B
    const amountB = (amountA * reserveB) / reserveA;
    this.tokenBAmount = amountB.toFixed(6);

    this.startQuoteTimer();
  }

  private calculateTokenAFromB() {
    if (!this.selectedPool || !this.tokenBAmount || parseFloat(this.tokenBAmount) <= 0) {
      this.tokenAAmount = '';
      return;
    }

    const pool = this.selectedPool;
    const reserveA = parseFloat(pool.reserveA);
    const reserveB = parseFloat(pool.reserveB);
    const amountB = parseFloat(this.tokenBAmount);

    // Calculate proportional amount for token A
    const amountA = (amountB * reserveA) / reserveB;
    this.tokenAAmount = amountA.toFixed(6);

    this.startQuoteTimer();
  }

  private startQuoteTimer() {
    if (this.quoteTimer) {
      clearTimeout(this.quoteTimer);
    }

    if (this.shouldRequestQuote()) {
      this.quoteTimer = setTimeout(() => {
        this.requestQuote();
      }, 800);
    } else {
      this.currentQuote = null;
      this.removeQuote = null;
    }
  }

  private shouldRequestQuote(): boolean {
    if (!this.selectedPool) return false;

    if (this.mode === 'add') {
      return !!(this.tokenAAmount && this.tokenBAmount &&
                parseFloat(this.tokenAAmount) > 0 && parseFloat(this.tokenBAmount) > 0);
    } else {
      return !!(this.lpTokenAmount && parseFloat(this.lpTokenAmount) > 0);
    }
  }

  private async requestQuote() {
    if (!this.selectedPool) return;

    this.isQuoting = true;

    // Convert LiquidityPoolInfo to PoolInfo format for the event
    const apiPool: PoolInfo = {
      pool_id: this.selectedPool.address,
      id: this.selectedPool.address,
      token_1: this.selectedPool.tokenA.address,
      token_2: this.selectedPool.tokenB.address,
      token1: this.selectedPool.tokenA.address, // legacy compatibility
      token2: this.selectedPool.tokenB.address, // legacy compatibility
      total_liquidity: this.selectedPool.totalSupply
    };

    this.quoteRequested.emit({
      pool: apiPool,
      tokenAAmount: this.mode === 'add' ? this.tokenAAmount : undefined,
      tokenBAmount: this.mode === 'add' ? this.tokenBAmount : undefined,
      lpTokenAmount: this.mode === 'remove' ? this.lpTokenAmount : undefined,
      mode: this.mode,
    });

    // Simulate quote response
    setTimeout(() => {
      if (this.selectedPool) {
        if (this.mode === 'add' && this.tokenAAmount && this.tokenBAmount) {
          const pool = this.selectedPool;
          const totalSupply = parseFloat(pool.totalSupply);
          const reserveA = parseFloat(pool.reserveA);
          const amountA = parseFloat(this.tokenAAmount);

          // Calculate LP tokens to be received
          const lpTokensReceived = totalSupply > 0
            ? (amountA / reserveA) * totalSupply
            : Math.sqrt(parseFloat(this.tokenAAmount) * parseFloat(this.tokenBAmount));

          this.currentQuote = {
            tokenAAmount: this.tokenAAmount,
            tokenBAmount: this.tokenBAmount,
            lpTokensReceived: lpTokensReceived.toFixed(6),
            shareOfPool: (lpTokensReceived / (totalSupply + lpTokensReceived)) * 100,
            priceImpact: Math.random() * 0.5, // Mock price impact
            minimumLpReceived: (lpTokensReceived * (1 - this.slippage / 100)).toFixed(6),
          };
        } else if (this.mode === 'remove' && this.lpTokenAmount) {
          const pool = this.selectedPool;
          const totalSupply = parseFloat(pool.totalSupply);
          const lpAmount = parseFloat(this.lpTokenAmount);
          const shareRemoved = (lpAmount / totalSupply) * 100;

          const tokenAReceived = (lpAmount / totalSupply) * parseFloat(pool.reserveA);
          const tokenBReceived = (lpAmount / totalSupply) * parseFloat(pool.reserveB);

          this.removeQuote = {
            lpTokenAmount: this.lpTokenAmount,
            tokenAReceived: tokenAReceived.toFixed(6),
            tokenBReceived: tokenBReceived.toFixed(6),
            shareRemoved,
            minimumTokenAReceived: (tokenAReceived * (1 - this.slippage / 100)).toFixed(6),
            minimumTokenBReceived: (tokenBReceived * (1 - this.slippage / 100)).toFixed(6),
          };
        }
      }
      this.isQuoting = false;
    }, 1000);
  }

  private handleModeChange = (newMode: 'add' | 'remove') => {
    this.mode = newMode;
    this.resetAmounts();
    this.currentQuote = null;
    this.removeQuote = null;
  };

  private resetAmounts = () => {
    this.tokenAAmount = '';
    this.tokenBAmount = '';
    this.lpTokenAmount = '';
    this.lpPercentage = 0;
  };

  // Token selection is not needed - tokens are determined by pool selection

  private openPoolSelector = () => {
    this.isPoolSelectorOpen = true;
  };

  // Legacy selectPool method removed - use selectStorePool instead

  private selectStorePool = (pool: PoolInfo) => {
    // Store the selected pool directly - no conversion needed!
    this.selectedStorePool = pool;
    this.isPoolSelectorOpen = false;
    this.resetAmounts();

    // Emit the pool selection event with actual store data
    this.poolSelected.emit(pool);

    console.log('🎯 Pool selected:', {
      poolId: pool.pool_id,
      token1: pool.token_1,
      token2: pool.token_2,
      totalLiquidity: pool.total_liquidity,
      apr: pool.apr
    });
  };

  private handleMaxClick = (type: 'tokenA' | 'tokenB' | 'lp') => {
    if (type === 'tokenA' && this.selectedPool?.tokenA.balance) {
      this.tokenAAmount = this.selectedPool.tokenA.balance;
      this.calculateTokenBFromA();
    } else if (type === 'tokenB' && this.selectedPool?.tokenB.balance) {
      this.tokenBAmount = this.selectedPool.tokenB.balance;
      this.calculateTokenAFromB();
    } else if (type === 'lp') {
      const position = this.getUserPosition();
      if (position) {
        this.lpTokenAmount = position.lpTokenBalance;
        this.startQuoteTimer();
      }
    }
  };

  private handlePercentageClick = (percentage: number) => {
    this.lpPercentage = percentage;
    const position = this.getUserPosition();
    if (position) {
      const amount = (parseFloat(position.lpTokenBalance) * percentage / 100).toFixed(6);
      this.lpTokenAmount = amount;
      this.startQuoteTimer();
    }
  };

  private getUserPosition(): LiquidityPosition | null {
    if (!this.selectedPool) return null;
    return this.positions.find(pos => pos.poolAddress === this.selectedPool!.address) || null;
  }

  private handleLiquidity = () => {
    // Check if we need to connect wallets first
    if (!this.isWalletConnectedForLiquidity()) {
      // Determine which chain to connect to
      const chainUID = this.getFirstDisconnectedChain();
      appStore.openWalletModal(chainUID);
      return;
    }

    if (!this.selectedPool) return;

    // Update liquidity store - convert to api.types.PoolInfo format
    const apiPool: PoolInfo = {
      pool_id: this.selectedPool.address,
      id: this.selectedPool.address,
      token_1: this.selectedPool.tokenA.address,
      token_2: this.selectedPool.tokenB.address,
      token1: this.selectedPool.tokenA.address, // legacy compatibility
      token2: this.selectedPool.tokenB.address, // legacy compatibility
      total_liquidity: this.selectedPool.totalSupply
    };

    liquidityStore.setSelectedPool(apiPool);

    if (this.mode === 'add' && this.currentQuote) {
      // Set liquidity store values
      liquidityStore.setToken1Amount(this.tokenAAmount);
      liquidityStore.setToken2Amount(this.tokenBAmount);

      // Trigger add liquidity execution
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_REQUEST);

      // Emit legacy event for backward compatibility
      this.liquidityAdded.emit({
        pool: this.selectedPool,
        tokenAAmount: this.tokenAAmount,
        tokenBAmount: this.tokenBAmount,
        expectedLpTokens: this.currentQuote.lpTokensReceived,
        slippage: this.slippage,
      });
    } else if (this.mode === 'remove' && this.removeQuote) {
      // Trigger remove liquidity execution
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_REQUEST, {
        poolId: this.selectedPool.address,
        lpTokenAmount: this.lpTokenAmount,
      });

      // Emit legacy event for backward compatibility
      this.liquidityRemoved.emit({
        pool: this.selectedPool,
        lpTokenAmount: this.lpTokenAmount,
        expectedTokenA: this.removeQuote.tokenAReceived,
        expectedTokenB: this.removeQuote.tokenBReceived,
        slippage: this.slippage,
      });
    }
  };

  private getFirstDisconnectedChain(): string {
    if (!this.selectedPool) return 'ethereum';

    const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
    if (!tokenAConnected) return this.selectedPool.tokenA.chainUID;

    return this.selectedPool.tokenB.chainUID;
  }

  private canExecute(): boolean {
    if (!this.selectedPool || !this.walletAddress || this.loading || this.disabled || this.isQuoting) {
      return false;
    }

    if (this.mode === 'add') {
      return !!(this.currentQuote && this.tokenAAmount && this.tokenBAmount);
    } else {
      return !!(this.removeQuote && this.lpTokenAmount);
    }
  }

  private getButtonText(): string {
    // Check wallet connection for required chains
    if (!this.isWalletConnectedForLiquidity()) {
      const chainName = this.getRequiredChainName();
      return `Connect ${chainName}`;
    }

    if (!this.selectedPool) return 'Select Pool';

    if (this.mode === 'add') {
      if (!this.tokenAAmount || !this.tokenBAmount) return 'Enter Amounts';
      if (this.isQuoting) return 'Getting Quote...';
      if (this.loading) return 'Adding Liquidity...';
      return 'Add Liquidity';
    } else {
      if (!this.lpTokenAmount) return 'Enter LP Amount';
      if (this.isQuoting) return 'Getting Quote...';
      if (this.loading) return 'Removing Liquidity...';
      return 'Remove Liquidity';
    }
  }

  private isWalletConnectedForLiquidity(): boolean {
    if (!this.selectedPool) return false;

    // For liquidity operations, we need wallets connected for both token chains
    const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
    const tokenBConnected = walletStore.isWalletConnected(this.selectedPool.tokenB.chainUID);

    return tokenAConnected && tokenBConnected;
  }

  private getRequiredChainName(): string {
    if (!this.selectedPool) return 'Wallet';

    // Check which chains need connection
    const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
    const tokenBConnected = walletStore.isWalletConnected(this.selectedPool.tokenB.chainUID);

    if (!tokenAConnected && !tokenBConnected) {
      return 'Wallets';
    } else if (!tokenAConnected) {
      return this.getChainDisplayName(this.selectedPool.tokenA.chainUID);
    } else if (!tokenBConnected) {
      return this.getChainDisplayName(this.selectedPool.tokenB.chainUID);
    }

    return 'Wallet';
  }

  private getChainDisplayName(chainUID: string): string {
    // Simple mapping - in production this would come from chain config
    const chainNames = {
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'arbitrum': 'Arbitrum',
      'optimism': 'Optimism',
      'cosmoshub-4': 'Cosmos Hub',
      'osmosis-1': 'Osmosis',
    };
    return chainNames[chainUID] || 'Wallet';
  }

  render() {
    const position = this.getUserPosition();

    return (
      <div class="liquidity-card">
        {/* Header */}
        <div class="liquidity-header">
          <h3 class="liquidity-title">{this.cardTitle}</h3>
          <div class="mode-toggle">
            <button
              class={{
                'mode-button': true,
                'mode-button--active': this.mode === 'add',
              }}
              onClick={() => this.handleModeChange('add')}
              type="button"
            >
              Add
            </button>
            <button
              class={{
                'mode-button': true,
                'mode-button--active': this.mode === 'remove',
              }}
              onClick={() => this.handleModeChange('remove')}
              type="button"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Pool Selection */}
        <div class="pool-section">
          <div class="section-header">
            <span class="section-label">Pool</span>
          </div>

          <div class="pool-selector" onClick={this.openPoolSelector}>
            {this.selectedStorePool ? (
              <div class="selected-pool">
                <div class="pool-tokens">
                  <div class="token-pair">
                    {/* Token logos would come from storeTokens metadata */}
                  </div>
                  <div class="pool-info">
                    <span class="pool-name">
                      {this.selectedStorePool.token_1.toUpperCase()}/{this.selectedStorePool.token_2.toUpperCase()}
                    </span>
                    <span class="pool-fee">Pool Fee</span>
                  </div>
                </div>
                <div class="pool-stats">
                  <div class="stat">
                    <span class="stat-label">APR</span>
                    <span class="stat-value">{this.selectedStorePool.apr || 'N/A'}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">TVL</span>
                    <span class="stat-value">${parseFloat(this.selectedStorePool.total_liquidity || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div class="select-pool-button">
                <span>Select Pool</span>
                <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Position Info (only show in remove mode) */}
        {this.mode === 'remove' && position && (
          <div class="position-info">
            <div class="position-header">
              <span class="position-label">Your Position</span>
            </div>
            <div class="position-details">
              <div class="position-row">
                <span class="position-item-label">LP Tokens</span>
                <span class="position-item-value">{parseFloat(position.lpTokenBalance).toLocaleString()}</span>
              </div>
              <div class="position-row">
                <span class="position-item-label">Pool Share</span>
                <span class="position-item-value">{position.shareOfPool.toFixed(4)}%</span>
              </div>
              <div class="position-row">
                <span class="position-item-label">{this.selectedPool?.tokenA.symbol}</span>
                <span class="position-item-value">{parseFloat(position.tokenAAmount).toLocaleString()}</span>
              </div>
              <div class="position-row">
                <span class="position-item-label">{this.selectedPool?.tokenB.symbol}</span>
                <span class="position-item-value">{parseFloat(position.tokenBAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {this.mode === 'add' ? this.renderAddLiquidity() : this.renderRemoveLiquidity()}

        {/* Quote Information */}
        {(this.currentQuote || this.removeQuote) && (
          <div class="quote-info">
            {this.mode === 'add' && this.currentQuote ? (
              <div>
                <div class="quote-row">
                  <span class="quote-label">LP Tokens Received</span>
                  <span class="quote-value">{parseFloat(this.currentQuote.lpTokensReceived).toLocaleString()}</span>
                </div>
                <div class="quote-row">
                  <span class="quote-label">Pool Share</span>
                  <span class="quote-value">{this.currentQuote.shareOfPool.toFixed(4)}%</span>
                </div>
                {this.currentQuote.priceImpact > 0.1 && (
                  <div class="quote-row">
                    <span class="quote-label">Price Impact</span>
                    <span class={{
                      'quote-value': true,
                      'quote-value--warning': this.currentQuote.priceImpact > 1,
                      'quote-value--danger': this.currentQuote.priceImpact > 3,
                    }}>
                      {this.currentQuote.priceImpact.toFixed(3)}%
                    </span>
                  </div>
                )}
              </div>
            ) : this.mode === 'remove' && this.removeQuote ? (
              <div>
                <div class="quote-row">
                  <span class="quote-label">Pool Share Removed</span>
                  <span class="quote-value">{this.removeQuote.shareRemoved.toFixed(4)}%</span>
                </div>
                <div class="quote-row">
                  <span class="quote-label">{this.selectedPool?.tokenA.symbol} Received</span>
                  <span class="quote-value">{parseFloat(this.removeQuote.tokenAReceived).toLocaleString()}</span>
                </div>
                <div class="quote-row">
                  <span class="quote-label">{this.selectedPool?.tokenB.symbol} Received</span>
                  <span class="quote-value">{parseFloat(this.removeQuote.tokenBReceived).toLocaleString()}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Advanced Settings */}
        <div class="advanced-section">
          <button
            class="advanced-toggle"
            onClick={() => this.isAdvancedOpen = !this.isAdvancedOpen}
            type="button"
          >
            <span>Advanced Settings</span>
            <svg class={{
              'dropdown-arrow': true,
              'dropdown-arrow--open': this.isAdvancedOpen,
            }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {this.isAdvancedOpen && (
            <div class="advanced-panel">
              <div class="setting-item">
                <label class="setting-label">Slippage Tolerance</label>
                <div class="slippage-controls">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      class={{
                        'slippage-btn': true,
                        'slippage-btn--active': this.slippage === value,
                      }}
                      onClick={() => this.slippage = value}
                      type="button"
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    class="slippage-input"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={this.slippage}
                    onInput={(e) => this.slippage = parseFloat((e.target as HTMLInputElement).value)}
                    placeholder="Custom"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <euclid-button
          variant="primary"
          size="lg"
          full-width={true}
          loading={this.loading}
          disabled={!this.canExecute()}
          onClick={this.handleLiquidity}
        >
          {this.getButtonText()}
        </euclid-button>

        {/* Pool Selector Dropdown */}
        {this.isPoolSelectorOpen && (
          <div class="pool-selector-dropdown">
            <div class="dropdown-header">
              <h4>Select Pool</h4>
              <button class="close-button" onClick={() => this.isPoolSelectorOpen = false}>×</button>
            </div>
            <div class="pool-list">
              {this.storePools.length > 0 ? (
                this.storePools.map(pool => (
                  <div
                    key={pool.pool_id}
                    class="pool-item"
                    onClick={() => this.selectStorePool(pool)}
                  >
                    <div class="pool-tokens">
                      <span class="pool-name">{pool.token_1.toUpperCase()}/{pool.token_2.toUpperCase()}</span>
                    </div>
                    <div class="pool-stats">
                      <span class="apr">APR: {pool.apr || '0.00%'}</span>
                      <span class="tvl">TVL: ${parseFloat(pool.total_liquidity || '0').toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div class="no-pools">No pools available</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  private renderAddLiquidity() {
    return (
      <div class="liquidity-inputs">
        {/* Token A Input */}
        <div class="token-input-section">
          <div class="input-header">
            <span class="input-label">First Token</span>
            {this.selectedPool?.tokenA.balance && (
              <span class="balance-label" onClick={() => this.handleMaxClick('tokenA')}>
                Balance: {parseFloat(this.selectedPool.tokenA.balance).toLocaleString()}
              </span>
            )}
          </div>

          <euclid-token-input
            id="token-a-input"
            value={this.tokenAAmount}
            placeholder="0.0"
            show-max={!!this.selectedPool?.tokenA.balance}
            onMaxClick={() => this.handleMaxClick('tokenA')}
          >
            <div slot="token" class="token-display">
              {this.selectedStorePool ? (
                <div class="selected-token">
                  <div class="token-info">
                    <span class="token-symbol">{this.selectedStorePool.token_1.toUpperCase()}</span>
                    <span class="token-name">{this.selectedStorePool.token_1}</span>
                  </div>
                </div>
              ) : (
                <div class="no-pool-selected">
                  <span class="token-symbol">TOKEN</span>
                  <span class="token-name">Select pool first</span>
                </div>
              )}
            </div>
          </euclid-token-input>
        </div>

        {/* Token B Input */}
        <div class="token-input-section">
          <div class="input-header">
            <span class="input-label">Second Token</span>
            {this.selectedPool?.tokenB.balance && (
              <span class="balance-label" onClick={() => this.handleMaxClick('tokenB')}>
                Balance: {parseFloat(this.selectedPool.tokenB.balance).toLocaleString()}
              </span>
            )}
          </div>

          <euclid-token-input
            id="token-b-input"
            value={this.tokenBAmount}
            placeholder="0.0"
            show-max={!!this.selectedPool?.tokenB.balance}
            onMaxClick={() => this.handleMaxClick('tokenB')}
          >
            <div slot="token" class="token-display">
              {this.selectedStorePool ? (
                <div class="selected-token">
                  <div class="token-info">
                    <span class="token-symbol">{this.selectedStorePool.token_2.toUpperCase()}</span>
                    <span class="token-name">{this.selectedStorePool.token_2}</span>
                  </div>
                </div>
              ) : (
                <div class="no-pool-selected">
                  <span class="token-symbol">TOKEN</span>
                  <span class="token-name">Select pool first</span>
                </div>
              )}
            </div>
          </euclid-token-input>
        </div>
      </div>
    );
  }

  private renderRemoveLiquidity() {
    const position = this.getUserPosition();

    return (
      <div class="remove-liquidity">
        {/* Percentage Buttons */}
        <div class="percentage-section">
          <div class="percentage-label">Amount to Remove</div>
          <div class="percentage-buttons">
            {[25, 50, 75, 100].map((percent) => (
              <button
                class={{
                  'percentage-btn': true,
                  'percentage-btn--active': this.lpPercentage === percent,
                }}
                onClick={() => this.handlePercentageClick(percent)}
                type="button"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* LP Token Input */}
        <div class="token-input-section">
          <div class="input-header">
            <span class="input-label">LP Tokens to Remove</span>
            {position && (
              <span class="balance-label" onClick={() => this.handleMaxClick('lp')}>
                Balance: {parseFloat(position.lpTokenBalance).toLocaleString()}
              </span>
            )}
          </div>

          <euclid-token-input
            id="lp-token-input"
            value={this.lpTokenAmount}
            placeholder="0.0"
            show-max={!!position}
            onMaxClick={() => this.handleMaxClick('lp')}
          >
            <div slot="token" class="lp-token-display">
              {this.selectedPool ? (
                <div class="lp-token-info">
                  <div class="token-pair">
                    {this.selectedPool.tokenA.logoUrl && (
                      <img src={this.selectedPool.tokenA.logoUrl} alt={this.selectedPool.tokenA.symbol} class="token-logo" />
                    )}
                    {this.selectedPool.tokenB.logoUrl && (
                      <img src={this.selectedPool.tokenB.logoUrl} alt={this.selectedPool.tokenB.symbol} class="token-logo token-logo--overlap" />
                    )}
                  </div>
                  <span class="lp-symbol">{this.selectedPool.lpTokenSymbol}</span>
                </div>
              ) : (
                <span>Select Pool</span>
              )}
            </div>
          </euclid-token-input>
        </div>

      </div>
    );
  }
}
