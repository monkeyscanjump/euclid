import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { appStore } from '../../../store/app.store';

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
  @State() private walletProviders: WalletProvider[] = [
    // Mock data - in real app this would come from store/API
    { id: 'metamask', name: 'MetaMask', icon: '🦊', installed: true, description: 'Connect using MetaMask wallet' },
    { id: 'keplr', name: 'Keplr', icon: '🔗', installed: true, description: 'Connect using Keplr wallet' },
    { id: 'phantom', name: 'Phantom', icon: '👻', installed: false, description: 'Connect using Phantom wallet' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🌐', installed: true, description: 'Connect using WalletConnect' },
  ];

  @Event() walletConnect!: EventEmitter<WalletProvider>;

  private handleWalletConnect = (provider: WalletProvider) => {
    if (!provider.installed) {
      this.openInstallUrl(provider.id);
      return;
    }

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
