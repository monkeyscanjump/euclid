import { Component, h, State } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { marketStore } from '../../../store/market.store';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import { walletMetadata } from '../../../assets/wallet-logos';
import type { EuclidChainConfig } from '../../../utils/types/api.types';
import { isEvmWalletType, isCosmosWalletType } from '../../../utils/types/wallet.types';

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
    this.initializeWithChainFilter();
  }

  private initializeWithChainFilter() {
    const chainFilter = appStore.state.walletModalFilter;

    if (chainFilter) {
      // Find the chain by UID from market store
      const targetChain = marketStore.state.chains.find(
        chain => chain.chain_uid === chainFilter
      );

      if (targetChain) {
        console.log('🎯 Wallet modal opened with chain filter:', targetChain.display_name);
        this.selectedChain = targetChain;
        this.step = 'wallets';
      } else {
        console.warn('⚠️ Chain filter provided but chain not found:', chainFilter);
        this.step = 'chains';
      }
    } else {
      this.step = 'chains';
    }
  }

  private detectWallets() {
    // Get available wallets from adapter factory
    const availableWallets = WalletAdapterFactory.getAvailableWallets();

    this.walletProviders = availableWallets.map(wallet => {
      const metadata = walletMetadata[wallet.type] || {
        name: wallet.type,
        logo: '',
        description: `Connect using ${wallet.type} wallet`,
        supportedChains: ['EVM']
      };

      return {
        id: wallet.type,
        name: metadata.name,
        icon: metadata.logo,
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
        // EVM chains support MetaMask, Phantom, WalletConnect - USE HELPER FUNCTION!
        return isEvmWalletType(wallet.id);
      } else if (isCosmwasmChain) {
        // CosmWasm chains support Keplr, Cosmostation, WalletConnect - USE HELPER FUNCTION!
        return isCosmosWalletType(wallet.id) || wallet.id === 'walletconnect';
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
                {provider.icon ? (
                  <img src={provider.icon} alt={provider.name} class="wallet-logo" />
                ) : (
                  <span class="wallet-emoji">🔗</span>
                )}
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
