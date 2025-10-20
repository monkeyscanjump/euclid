import { Component, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  balance?: string;
}

@Component({
  tag: 'euclid-token-input',
  styleUrl: 'euclid-token-input.css',
  shadow: true,
})
export class EuclidTokenInput {
  private inputRef?: HTMLInputElement;

  /**
   * The current token selection
   */
  @Prop() token?: TokenInfo;

  /**
   * The input value (amount)
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * Placeholder text for the input
   */
  @Prop() placeholder: string = '0.0';

  /**
   * Whether the input is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether to show the balance
   */
  @Prop() showBalance: boolean = true;

  /**
   * Whether to show the max button
   */
  @Prop() showMax: boolean = true;

  /**
   * Label for the input
   */
  @Prop() label?: string;

  /**
   * Error message to display
   */
  @Prop() error?: string;

  /**
   * Loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Whether the token selector is clickable
   */
  @Prop() tokenSelectable: boolean = true;

  @State() private focused: boolean = false;
  @State() private hasError: boolean = false;
  @State() private userBalance?: string;

  /**
   * Emitted when the input value changes
   */
  @Event() valueChange!: EventEmitter<string>;

  /**
   * Emitted when the token selector is clicked
   */
  @Event() tokenSelect!: EventEmitter<void>;

  /**
   * Emitted when the max button is clicked
   */
  @Event() maxClick!: EventEmitter<void>;

  @Watch('value')
  onValueChange(newValue: string) {
    this.validateInput(newValue);
  }

  @Watch('error')
  onErrorChange(newError: string | undefined) {
    this.hasError = !!newError;
  }

  @Watch('token')
  onTokenChange() {
    this.updateUserBalance();
  }

  componentWillLoad() {
    this.setupStoreSubscriptions();
    this.updateUserBalance();
  }

  disconnectedCallback() {
    // Cleanup store subscriptions if needed
  }

  private setupStoreSubscriptions() {
    // Subscribe to wallet balance changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (walletStore.onChange as any)('balances', () => {
      this.updateUserBalance();
    });
  }

  private updateUserBalance() {
    if (this.token?.symbol) {
      // Get balance from wallet store for current token
      // Note: This requires knowing which chain - for now, get from primary connected wallet
      const connectedWallets = walletStore.getAllConnectedWallets();
      if (connectedWallets.length > 0) {
        const primaryChain = connectedWallets[0].chainUID;
        const balance = walletStore.getWalletBalance(primaryChain, this.token.symbol);
        this.userBalance = balance?.amount || '0';
      } else {
        this.userBalance = '0';
      }
    }
  }

  private validateInput(value: string) {
    // Reset error state
    this.hasError = false;

    if (!value) return;

    // Check if it's a valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      this.hasError = true;
      return;
    }

    // Check balance if available
    if (this.token?.balance && this.showBalance) {
      const balance = parseFloat(this.token.balance);
      if (numValue > balance) {
        this.hasError = true;
        return;
      }
    }
  }

  private handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places based on token decimals
    if (this.token?.decimals && parts.length === 2) {
      const decimalPart = parts[1];
      if (decimalPart.length > this.token.decimals) {
        value = parts[0] + '.' + decimalPart.slice(0, this.token.decimals);
      }
    }

    this.value = value;
    target.value = value;
    this.valueChange.emit(value);
  };

  private handleInputFocus = () => {
    this.focused = true;
  };

  private handleInputBlur = () => {
    this.focused = false;
  };

  private handleTokenClick = () => {
    if (this.tokenSelectable && !this.disabled) {
      this.tokenSelect.emit();
    }
  };

  private handleMaxClick = () => {
    if (this.token?.balance && !this.disabled) {
      this.value = this.token.balance;
      if (this.inputRef) {
        this.inputRef.value = this.token.balance;
      }
      this.valueChange.emit(this.token.balance);
      this.maxClick.emit();
    }
  };

  private formatBalance(balance: string): string {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';

    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(3);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  }

  render() {
    const containerClass = {
      'token-input': true,
      'token-input--focused': this.focused,
      'token-input--disabled': this.disabled,
      'token-input--error': this.hasError || !!this.error,
      'token-input--loading': this.loading,
    };

    const tokenSelectorClass = {
      'token-selector': true,
      'token-selector--clickable': this.tokenSelectable && !this.disabled,
      'token-selector--empty': !this.token,
    };

    return (
      <div class="token-input-wrapper">
        {this.label && (
          <label class="token-input-label">
            {this.label}
          </label>
        )}

        <div class={containerClass}>
          <div class="token-input-main">
            <div class="input-section">
              <input
                ref={(el) => this.inputRef = el}
                type="text"
                inputMode="decimal"
                placeholder={this.placeholder}
                value={this.value}
                disabled={this.disabled}
                onInput={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                class="amount-input"
              />

              {this.loading && (
                <div class="loading-spinner">
                  <div class="spinner"></div>
                </div>
              )}
            </div>

            <div class={tokenSelectorClass} onClick={this.handleTokenClick}>
              {this.token ? (
                <div class="token-info">
                  {this.token.logoUrl && (
                    <img
                      src={this.token.logoUrl}
                      alt={this.token.symbol}
                      class="token-logo"
                    />
                  )}
                  <span class="token-symbol">{this.token.symbol}</span>
                  {this.tokenSelectable && !this.disabled && (
                    <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  )}
                </div>
              ) : (
                <div class="select-token">
                  <span>Select Token</span>
                  {this.tokenSelectable && !this.disabled && (
                    <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          {(this.showBalance || this.showMax) && this.token && (
            <div class="token-input-footer">
              {this.showBalance && (this.userBalance || this.token.balance) && (
                <div class="balance-section">
                  <span class="balance-label">Balance:</span>
                  <span class="balance-value">
                    {this.formatBalance(this.userBalance || this.token.balance || '0')} {this.token.symbol}
                  </span>
                </div>
              )}

              {this.showMax && this.token.balance && (
                <button
                  class="max-button"
                  onClick={this.handleMaxClick}
                  disabled={this.disabled}
                  type="button"
                >
                  MAX
                </button>
              )}
            </div>
          )}
        </div>

        {(this.error || this.hasError) && (
          <div class="error-message">
            {this.error || 'Invalid amount'}
          </div>
        )}
      </div>
    );
  }
}
