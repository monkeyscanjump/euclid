import { Component, h, State } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { EuclidChainConfig } from '../../../utils/types/api.types';

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
  @State() private selectedChain: EuclidChainConfig | null = null;
  @State() private step: 'chains' | 'wallets' = 'chains';

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

  private handleChainSelect = (chain: EuclidChainConfig) => {
    console.log('🌐 Chain selected:', chain.display_name, chain.chain_uid);
    this.selectedChain = chain;
    this.step = 'wallets';
  };

  private handleChainSelected = (event: CustomEvent<{ item: unknown; id: string }>) => {
    const chain = event.detail.item as EuclidChainConfig;
    this.handleChainSelect(chain);
  };

  private handleBackToChains = () => {
    this.step = 'chains';
    this.selectedChain = null;
  };

  private handleWalletConnect = async (provider: WalletProvider) => {
    console.log('🔗 Wallet clicked:', provider);

    if (!provider.installed) {
      console.log('❌ Wallet not installed, opening install URL');
      this.openInstallUrl(provider.id);
      return;
    }

    if (!this.selectedChain) {
      console.error('❌ No chain selected');
      return;
    }

    console.log('📡 Dispatching wallet connection request:', {
      chainUID: this.selectedChain.chain_uid,
      walletType: provider.id
    });

    // The wallet content component handles its own business logic!
    dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_REQUEST, {
      chainUID: this.selectedChain.chain_uid,
      walletType: provider.id
    });

    // Close the modal after dispatching the connection request
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

  private getCompatibleWallets(): WalletProvider[] {
    if (!this.selectedChain) return [];

    // Filter wallets based on chain type
    const chainType = this.selectedChain.type.toLowerCase();
    const isEvmChain = chainType === 'evm';
    const isCosmwasmChain = chainType === 'cosmwasm';

    return this.walletProviders.filter(wallet => {
      if (isEvmChain) {
        // EVM chains support MetaMask, Phantom, WalletConnect
        return ['metamask', 'phantom', 'walletconnect'].includes(wallet.id);
      } else if (isCosmwasmChain) {
        // CosmWasm chains support Keplr, Cosmostation, WalletConnect
        return ['keplr', 'cosmostation', 'walletconnect'].includes(wallet.id);
      }
      return false;
    });
  }

  render() {
    if (this.step === 'chains') {
      return this.renderChainSelection();
    } else {
      return this.renderWalletSelection();
    }
  }

  private renderChainSelection() {
    return (
      <div class="wallet-content">
        <div class="step-header">
          <h3>Select Blockchain Network</h3>
          <p>Choose the blockchain network you want to connect to</p>
        </div>

        <euclid-data-list
          dataType="chains"
          displayMode="compact"
          itemsPerPage={20}
          infiniteScroll={true}
          useParentScroll={true}
          searchable={true}
          sortable={false}
          showStats={false}
          filterable={false}
          showEndMessage={false}
          onItemSelected={this.handleChainSelected}
        />
      </div>
    );
  }

  private renderWalletSelection() {
    const compatibleWallets = this.getCompatibleWallets();

    return (
      <div class="wallet-content">
        <div class="step-header">
          <button class="back-button" onClick={this.handleBackToChains}>
            ← Back to Chains
          </button>
          <h3>Connect Wallet to {this.selectedChain?.display_name}</h3>
          <p>Choose a compatible wallet for this {this.selectedChain?.type.toUpperCase()} network</p>
        </div>

        <div class="wallet-grid">
          {compatibleWallets.map(provider => (
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

        {compatibleWallets.length === 0 && (
          <div class="no-wallets">
            <p>No compatible wallets found for {this.selectedChain?.type.toUpperCase()} networks.</p>
            <p>Please install a compatible wallet extension.</p>
          </div>
        )}
      </div>
    );
  }
}
