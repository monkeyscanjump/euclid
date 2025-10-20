import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';
import { swapStore } from '../../../store/swap.store';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { TokenInfo } from '../../../utils/types/api.types';

export interface SwapToken {
  id: string;
  symbol: string;
  name: string;
  address: string;
  chainUID: string;
  decimals: number;
  logoUrl?: string;
  balance?: string;
  price?: number;
}

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  exchangeRate: number;
  priceImpact: number;
  minimumReceived: string;
  gasEstimate: string;
  route: SwapRouteStep[];
}

export interface SwapRouteStep {
  protocol: string;
  poolAddress: string;
  fee: number;
  inputToken: string;
  outputToken: string;
}

export interface SwapSettings {
  slippage: number;
  deadline: number;
  gasPrice?: string;
  infiniteApproval: boolean;
}

@Component({
  tag: 'euclid-swap-card',
  styleUrl: 'euclid-swap-card.css',
  shadow: true,
})
export class EuclidSwapCard {
  @Element() element!: HTMLElement;

  /**
   * Available tokens for swapping
   */
  @Prop() tokens: SwapToken[] = [];

  /**
   * Currently selected input token
   */
  @Prop({ mutable: true }) inputToken: SwapToken | null = null;

  /**
   * Currently selected output token
   */
  @Prop({ mutable: true }) outputToken: SwapToken | null = null;

  /**
   * Input amount value
   */
  @Prop({ mutable: true }) inputAmount: string = '';

  /**
   * Whether the component is in loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Whether the swap functionality is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Connected wallet address
   */
  @Prop() walletAddress: string = '';

  /**
   * Whether to show advanced settings
   */
  @Prop() showAdvanced: boolean = false;

  /**
   * Default slippage tolerance (0.1 = 0.1%)
   */
  @Prop() defaultSlippage: number = 0.5;

  /**
   * Card title
   */
  @Prop() cardTitle: string = 'Swap Tokens';

  // Internal state
  @State() outputAmount: string = '';
  @State() isSettingsOpen: boolean = false;
  @State() isTokenSelectorOpen: boolean = false;
  @State() tokenSelectorType: 'input' | 'output' = 'input';
  @State() currentQuote: SwapQuote | null = null;
  @State() isQuoting: boolean = false;
  @State() swapSettings: SwapSettings = {
    slippage: this.defaultSlippage,
    deadline: 20,
    infiniteApproval: false,
  };

  // Events
  @Event() swapInitiated: EventEmitter<{
    inputToken: SwapToken;
    outputToken: SwapToken;
    inputAmount: string;
    outputAmount: string;
    settings: SwapSettings;
    quote: SwapQuote;
  }>;

  @Event() tokenSelect: EventEmitter<{
    type: 'input' | 'output';
    token: SwapToken;
  }>;

  @Event() quoteRequested: EventEmitter<{
    inputToken: SwapToken;
    outputToken: SwapToken;
    inputAmount: string;
  }>;

  @Event() settingsChanged: EventEmitter<SwapSettings>;

  // Quote update timer
  private quoteTimer: NodeJS.Timeout | null = null;

  componentDidLoad() {
    // Auto-quote when inputs change
    this.startQuoteTimer();
  }

  disconnectedCallback() {
    if (this.quoteTimer) {
      clearTimeout(this.quoteTimer);
    }
  }

  @Listen('valueChange')
  handleInputChange(event: CustomEvent) {
    if (event.target === this.element.querySelector('#input-amount')) {
      this.inputAmount = event.detail.value;
      this.startQuoteTimer();
    }
  }

  @Listen('tokenSelect')
  handleTokenModalSelect(event: CustomEvent) {
    const selectedToken = event.detail.token;

    if (this.tokenSelectorType === 'input') {
      // Prevent selecting same token for both input and output
      if (this.outputToken && selectedToken.address === this.outputToken.address) {
        this.outputToken = this.inputToken;
      }
      this.inputToken = selectedToken;
    } else {
      // Prevent selecting same token for both input and output
      if (this.inputToken && selectedToken.address === this.inputToken.address) {
        this.inputToken = this.outputToken;
      }
      this.outputToken = selectedToken;
    }

    this.tokenSelect.emit({
      type: this.tokenSelectorType,
      token: selectedToken,
    });

    this.isTokenSelectorOpen = false;
    this.startQuoteTimer();
  }

  @Listen('modalClose')
  handleModalClose() {
    this.isTokenSelectorOpen = false;
  }

  private startQuoteTimer() {
    if (this.quoteTimer) {
      clearTimeout(this.quoteTimer);
    }

    if (this.inputToken && this.outputToken && this.inputAmount && parseFloat(this.inputAmount) > 0) {
      this.quoteTimer = setTimeout(() => {
        this.requestQuote();
      }, 800); // Debounce for 800ms
    } else {
      this.outputAmount = '';
      this.currentQuote = null;
    }
  }

  private async requestQuote() {
    if (!this.inputToken || !this.outputToken || !this.inputAmount) return;

    this.isQuoting = true;

    this.quoteRequested.emit({
      inputToken: this.inputToken,
      outputToken: this.outputToken,
      inputAmount: this.inputAmount,
    });

    // Simulate quote response (in real app, this would be handled by parent component)
    setTimeout(() => {
      if (this.inputToken && this.outputToken && this.inputAmount) {
        const mockRate = 1.2 + Math.random() * 0.3; // Mock exchange rate
        const calculatedOutput = (parseFloat(this.inputAmount) * mockRate).toFixed(6);

        this.currentQuote = {
          inputAmount: this.inputAmount,
          outputAmount: calculatedOutput,
          exchangeRate: mockRate,
          priceImpact: Math.random() * 2, // 0-2% impact
          minimumReceived: (parseFloat(calculatedOutput) * (1 - this.swapSettings.slippage / 100)).toFixed(6),
          gasEstimate: (0.001 + Math.random() * 0.002).toFixed(4), // Mock gas
          route: [
            {
              protocol: 'Euclid Protocol',
              poolAddress: '0x123...abc',
              fee: 0.3,
              inputToken: this.inputToken.symbol,
              outputToken: this.outputToken.symbol,
            },
          ],
        };

        this.outputAmount = calculatedOutput;
      }
      this.isQuoting = false;
    }, 1000);
  }

  private handleSwapTokens = () => {
    const tempToken = this.inputToken;
    const tempAmount = this.inputAmount;

    this.inputToken = this.outputToken;
    this.outputToken = tempToken;
    this.inputAmount = this.outputAmount;
    this.outputAmount = tempAmount;

    this.startQuoteTimer();
  };

  private handleMaxClick = () => {
    if (this.inputToken?.balance) {
      this.inputAmount = this.inputToken.balance;
      this.startQuoteTimer();
    }
  };

  private openTokenSelector = (type: 'input' | 'output') => {
    this.tokenSelectorType = type;
    this.isTokenSelectorOpen = true;
  };

  private toggleSettings = () => {
    this.isSettingsOpen = !this.isSettingsOpen;
  };

  private handleSlippageChange = (slippage: number) => {
    this.swapSettings = { ...this.swapSettings, slippage };
    this.settingsChanged.emit(this.swapSettings);
    this.startQuoteTimer(); // Recalculate with new slippage
  };

  private handleSwap = () => {
    // Check if we need to connect wallet first
    if (!this.inputToken || !this.isWalletConnectedForSwap()) {
      // Open wallet modal with chain filter
      appStore.openWalletModal(this.inputToken?.chainUID);
      return;
    }

    if (!this.outputToken || !this.currentQuote) return;

    // Update swap store and trigger swap execution - convert to TokenInfo format
    const fromTokenInfo: TokenInfo = {
      id: this.inputToken.id || this.inputToken.address,
      symbol: this.inputToken.symbol,
      name: this.inputToken.name,
      decimals: this.inputToken.decimals,
      chainUID: this.inputToken.chainUID,
      address: this.inputToken.address,
      logo: this.inputToken.logoUrl
    };

    const toTokenInfo: TokenInfo = {
      id: this.outputToken.id || this.outputToken.address,
      symbol: this.outputToken.symbol,
      name: this.outputToken.name,
      decimals: this.outputToken.decimals,
      chainUID: this.outputToken.chainUID,
      address: this.outputToken.address,
      logo: this.outputToken.logoUrl
    };

    swapStore.setFromToken(fromTokenInfo);
    swapStore.setToToken(toTokenInfo);
    swapStore.setFromAmount(this.inputAmount);

    // Emit event to trigger swap controller
    dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_REQUEST);

    // Also emit the legacy event for backward compatibility
    this.swapInitiated.emit({
      inputToken: this.inputToken,
      outputToken: this.outputToken,
      inputAmount: this.inputAmount,
      outputAmount: this.outputAmount,
      settings: this.swapSettings,
      quote: this.currentQuote,
    });
  };

  private canSwap(): boolean {
    // First check if we need wallet connection
    if (!this.inputToken || !this.isWalletConnectedForSwap()) {
      return true; // Button should be clickable for connection
    }

    return !!(
      this.inputToken &&
      this.outputToken &&
      this.inputAmount &&
      parseFloat(this.inputAmount) > 0 &&
      this.currentQuote &&
      !this.isQuoting &&
      !this.loading &&
      !this.disabled
    );
  }

  private getSwapButtonText(): string {
    // Check wallet connection for required chain
    if (!this.inputToken || !this.isWalletConnectedForSwap()) {
      const chainName = this.inputToken?.chainUID ?
        this.getChainDisplayName(this.inputToken.chainUID) : 'Wallet';
      return `Connect ${chainName}`;
    }

    if (!this.inputToken) return 'Select Input Token';
    if (!this.outputToken) return 'Select Output Token';
    if (!this.inputAmount || parseFloat(this.inputAmount) <= 0) return 'Enter Amount';
    if (this.isQuoting) return 'Getting Quote...';
    if (this.loading) return 'Swapping...';
    if (!this.currentQuote) return 'Unable to Quote';
    return `Swap ${this.inputToken.symbol} for ${this.outputToken.symbol}`;
  }

  private isWalletConnectedForSwap(): boolean {
    if (!this.inputToken) return false;
    return walletStore.isWalletConnected(this.inputToken.chainUID);
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
    return (
      <div class="swap-card">
        {/* Header */}
        <div class="swap-header">
          <h3 class="swap-title">{this.cardTitle}</h3>
          <button
            class="settings-button"
            onClick={this.toggleSettings}
            type="button"
            aria-label="Swap settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {this.isSettingsOpen && (
          <div class="settings-panel">
            <div class="setting-item">
              <label class="setting-label">Slippage Tolerance</label>
              <div class="slippage-buttons">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    class={{
                      'slippage-btn': true,
                      'slippage-btn--active': this.swapSettings.slippage === value,
                    }}
                    onClick={() => this.handleSlippageChange(value)}
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
                  value={this.swapSettings.slippage}
                  onInput={(e) =>
                    this.handleSlippageChange(parseFloat((e.target as HTMLInputElement).value))
                  }
                  placeholder="Custom"
                />
              </div>
            </div>
            <div class="setting-item">
              <label class="setting-label">Transaction Deadline</label>
              <div class="deadline-input">
                <input
                  type="number"
                  min="1"
                  max="4320"
                  value={this.swapSettings.deadline}
                  onInput={(e) =>
                    (this.swapSettings = {
                      ...this.swapSettings,
                      deadline: parseInt((e.target as HTMLInputElement).value),
                    })
                  }
                />
                <span>minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Token */}
        <div class="token-input-section">
          <div class="input-header">
            <span class="input-label">From</span>
            {this.inputToken?.balance && (
              <span class="balance-label">
                Balance: {parseFloat(this.inputToken.balance).toLocaleString()}
              </span>
            )}
          </div>

          <euclid-token-input
            id="input-amount"
            value={this.inputAmount}
            placeholder="0.0"
            show-max={!!this.inputToken?.balance}
            onMaxClick={this.handleMaxClick}
          >
            <div slot="token" class="token-selector" onClick={() => this.openTokenSelector('input')}>
              {this.inputToken ? (
                <div class="selected-token">
                  {this.inputToken.logoUrl && (
                    <img src={this.inputToken.logoUrl} alt={this.inputToken.symbol} class="token-logo" />
                  )}
                  <div class="token-info">
                    <span class="token-symbol">{this.inputToken.symbol}</span>
                    <span class="token-name">{this.inputToken.name}</span>
                  </div>
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              ) : (
                <div class="select-token-button">
                  <span>Select Token</span>
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              )}
            </div>
          </euclid-token-input>
        </div>

        {/* Swap Direction Button */}
        <div class="swap-direction">
          <button
            class="swap-button"
            onClick={this.handleSwapTokens}
            type="button"
            aria-label="Swap token directions"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
            </svg>
          </button>
        </div>

        {/* Output Token */}
        <div class="token-input-section">
          <div class="input-header">
            <span class="input-label">To</span>
            {this.outputToken?.balance && (
              <span class="balance-label">
                Balance: {parseFloat(this.outputToken.balance).toLocaleString()}
              </span>
            )}
          </div>

          <euclid-token-input
            id="output-amount"
            value={this.outputAmount}
            placeholder="0.0"
            disabled={true}
            loading={this.isQuoting}
          >
            <div slot="token" class="token-selector" onClick={() => this.openTokenSelector('output')}>
              {this.outputToken ? (
                <div class="selected-token">
                  {this.outputToken.logoUrl && (
                    <img src={this.outputToken.logoUrl} alt={this.outputToken.symbol} class="token-logo" />
                  )}
                  <div class="token-info">
                    <span class="token-symbol">{this.outputToken.symbol}</span>
                    <span class="token-name">{this.outputToken.name}</span>
                  </div>
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              ) : (
                <div class="select-token-button">
                  <span>Select Token</span>
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              )}
            </div>
          </euclid-token-input>
        </div>

        {/* Quote Information */}
        {this.currentQuote && (
          <div class="quote-info">
            <div class="quote-row">
              <span class="quote-label">Rate</span>
              <span class="quote-value">
                1 {this.inputToken?.symbol} = {this.currentQuote.exchangeRate.toFixed(6)} {this.outputToken?.symbol}
              </span>
            </div>
            {this.currentQuote.priceImpact > 0.1 && (
              <div class="quote-row">
                <span class="quote-label">Price Impact</span>
                <span class={{
                  'quote-value': true,
                  'quote-value--warning': this.currentQuote.priceImpact > 3,
                  'quote-value--danger': this.currentQuote.priceImpact > 15,
                }}>
                  {this.currentQuote.priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
            <div class="quote-row">
              <span class="quote-label">Minimum Received</span>
              <span class="quote-value">
                {this.currentQuote.minimumReceived} {this.outputToken?.symbol}
              </span>
            </div>
            <div class="quote-row">
              <span class="quote-label">Network Fee</span>
              <span class="quote-value">{this.currentQuote.gasEstimate} ETH</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <euclid-button
          variant="primary"
          size="lg"
          full-width={true}
          loading={this.loading}
          disabled={!this.canSwap()}
          onClick={this.handleSwap}
        >
          {this.getSwapButtonText()}
        </euclid-button>

        {/* Token Selection Modal */}
        <euclid-token-modal
          open={this.isTokenSelectorOpen}
          popularTokens={this.tokens.map(token => ({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoUrl: token.logoUrl,
            balance: token.balance,
          }))}
          showBalances={!!this.walletAddress}
          showPopular={true}
        />
      </div>
    );
  }
}
