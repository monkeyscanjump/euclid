import { Component, h, Prop, Event, EventEmitter, Fragment } from '@stencil/core';

export interface WalletData {
  id: string;
  address: string;
  chainUID: string;
  chainName: string;
  chainLogo: string;
  chainType: string;
  walletType: string;
  provider: string;
  label?: string;
  autoConnect?: boolean; // Auto-reconnect when session expires
}

@Component({
  tag: 'euclid-wallet',
  styleUrl: 'euclid-wallet.css',
  shadow: true,
})
export class EuclidWallet {
  @Prop() wallet!: WalletData;
  @Prop() clickable: boolean = true;
  @Prop() showConnectionStatus: boolean = true;
  @Prop() showChainInfo: boolean = true;
  @Prop() showActions: boolean = false;

  @Event() walletClick: EventEmitter<WalletData>;
  @Event() walletDelete: EventEmitter<WalletData>;
  @Event() walletEdit: EventEmitter<WalletData>;
  @Event() walletToggleAutoConnect: EventEmitter<WalletData>;

  private handleClick = () => {
    if (this.clickable) {
      this.walletClick.emit(this.wallet);
    }
  };

  private handleDelete = (e: Event) => {
    e.stopPropagation(); // Prevent wallet click event
    this.walletDelete.emit(this.wallet);
  };

  private handleEdit = (e: Event) => {
    e.stopPropagation(); // Prevent wallet click event
    this.walletEdit.emit(this.wallet);
  };

  private handleToggleAutoConnect = (e: Event) => {
    e.stopPropagation(); // Prevent wallet click event
    console.log('🔄 Auto-connect button clicked!', this.wallet);
    this.walletToggleAutoConnect.emit(this.wallet);
  };

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  render() {
    const { wallet } = this;
    // Ensure autoConnect has a default value
    const autoConnect = wallet.autoConnect ?? false;

    return (
      <div
        class={{
          'wallet-card': true,
          'clickable': this.clickable,
        }}
        onClick={this.handleClick}
      >
        {/* Chain Logo */}
        <div class="wallet-chain-logo">
          <img src={wallet.chainLogo} alt={wallet.chainName} />
        </div>

        {/* Wallet Info */}
        <div class="wallet-info">
          <div class="wallet-header">
            <div class="wallet-provider">
              <span class="provider-name">{wallet.provider}</span>
              {this.showConnectionStatus && (<div class="connection-indicator"></div>)}
            </div>
          </div>

          <div class="wallet-address">
            {this.formatAddress(wallet.address)}
          </div>

          {this.showChainInfo && (
            <div class="wallet-chain-info">
              <span class="chain-name">{wallet.chainName}</span>
              <span class="chain-type">{wallet.chainType}</span>
            </div>
          )}

          {wallet.label && (
            <div class="wallet-label">
              {wallet.label}
            </div>
          )}
        </div>

        {/* Connection Status Indicator - Removed since connection is handled by auto-connect */}

        {/* Action Buttons */}
        {this.showActions && (
          <div class="wallet-actions">
            {/* Auto-connect toggle for non-custom wallets */}
            {wallet.walletType !== 'custom' && (
              <button
                class={`action-btn auto-connect-btn ${autoConnect ? 'enabled' : 'disabled'}`}
                onClick={this.handleToggleAutoConnect}
                title={autoConnect ? 'Disable auto-connect' : 'Enable auto-connect when extension session expires'}
              >
                {autoConnect ? '🔄' : '⏸️'}
              </button>
            )}
            <button
              class="action-btn delete-btn"
              onClick={this.handleDelete}
              title="Delete saved wallet"
            >
              🗑️
            </button>
            <button
              class="action-btn edit-btn"
              onClick={this.handleEdit}
              title="Edit wallet name"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
    );
  }
}
