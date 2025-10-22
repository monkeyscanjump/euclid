import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  description: string;
}

@Component({
  tag: 'euclid-wallet-content',
  styleUrl: 'euclid-wallet-content.css',
  shadow: true,
})
export class EuclidWalletContent {
  @State() private walletProviders: WalletProvider[] = [];

  @Event() walletConnect!: EventEmitter<WalletProvider>;

  componentWillLoad() {
    this.detectWallets();
  }

  private detectWallets() {
    // Get available wallets from adapter factory
    const availableWallets = WalletAdapterFactory.getAvailableWallets();

    // Create provider list with metadata
    const walletMetadata: Record<string, { name: string; icon: string; description: string }> = {
      'metamask': { name: 'MetaMask', icon: '🦊', description: 'Connect using MetaMask wallet' },
      'keplr': { name: 'Keplr', icon: '🔗', description: 'Connect using Keplr wallet' },
      'phantom': { name: 'Phantom', icon: '👻', description: 'Connect using Phantom wallet' },
      'cosmostation': { name: 'Cosmostation', icon: '🌌', description: 'Connect using Cosmostation wallet' },
      'walletconnect': { name: 'WalletConnect', icon: '🌐', description: 'Connect using WalletConnect' }
    };

    this.walletProviders = availableWallets.map(wallet => {
      const metadata = walletMetadata[wallet.type] || {
        name: wallet.type,
        icon: '🔗',
        description: `Connect using ${wallet.type} wallet`
      };

      return {
        id: wallet.type,
        name: metadata.name,
        icon: metadata.icon,
        installed: wallet.installed,
        description: metadata.description
      };
    });

    console.log('🔍 Detected wallets:', this.walletProviders);
  }

  private handleWalletConnect = (provider: WalletProvider) => {
    console.log('🔗 Wallet clicked:', provider);

    if (!provider.installed) {
      console.log('❌ Wallet not installed, opening install URL');
      this.openInstallUrl(provider.id);
      return;
    }

    console.log('✅ Emitting walletConnect event for:', provider.id);
    this.walletConnect.emit(provider);
    appStore.closeWalletModal();
  };

  private openInstallUrl(walletId: string) {
    const installUrls: Record<string, string> = {
      'metamask': 'https://metamask.io/download/',
      'keplr': 'https://www.keplr.app/download',
      'phantom': 'https://phantom.app/download',
      'walletconnect': 'https://walletconnect.com/',
    };

    const url = installUrls[walletId];
    if (url) {
      window.open(url, '_blank');
    }
  }

  render() {
    return (
      <div class="wallet-content">
        <div class="wallet-grid">
          {this.walletProviders.map(provider => (
            <button
              key={provider.id}
              class={{
                'wallet-card': true,
                'wallet-card--not-installed': !provider.installed
              }}
              onClick={() => this.handleWalletConnect(provider)}
              type="button"
            >
              <div class="wallet-icon">
                <span class="wallet-emoji">{provider.icon}</span>
              </div>

              <div class="wallet-info">
                <div class="wallet-name">{provider.name}</div>
                <div class="wallet-description">{provider.description}</div>

                {!provider.installed && (
                  <span class="install-badge">Install Required</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
}
