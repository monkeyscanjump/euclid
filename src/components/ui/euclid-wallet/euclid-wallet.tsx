import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

export interface WalletData {
  id: string;
  address: string;
  chainUID: string;
  chainName: string;
  chainLogo: string;
  chainType: string;
  walletType: string;
  provider: string;
  isConnected: boolean;
  label?: string;
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

  @Event() walletClick: EventEmitter<WalletData>;

  private handleClick = () => {
    if (this.clickable) {
      this.walletClick.emit(this.wallet);
    }
  };

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  render() {
    const { wallet } = this;

    return (
      <div
        class={{
          'wallet-card': true,
          'clickable': this.clickable,
          'connected': wallet.isConnected,
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
              {this.showConnectionStatus && (
                <div class={{
                  'connection-indicator': true,
                  'connected': wallet.isConnected,
                  'saved': !wallet.isConnected,
                }}>
                  {wallet.isConnected ? 'Connected' : 'Saved'}
                </div>
              )}
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

        {/* Connection Status Indicator */}
        {this.showConnectionStatus && wallet.isConnected && (
          <div class="connection-dot"></div>
        )}
      </div>
    );
  }
}
