import { Component, h, State, Event, EventEmitter, Listen } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { marketStore } from '../../../store/market.store';
import { walletStore } from '../../../store/wallet.store';
import { walletStorage } from '../../../utils/storage/indexdb-storage';
import { getConnectedWallets, getAllWallets, setupWalletStoreListeners, addCustomWallet, removeWallet } from '../../../utils/wallet-utils';
import { WalletData } from '../euclid-wallet/euclid-wallet';
import { WalletType, ChainType } from '../../../utils/types/wallet.types';
import { stringifyWithCache } from '../../../utils/string-helpers';
import { logger } from '../../../utils/logger';

export interface SavedAddress {
  id: string;
  address: string;
  chainUID: string;
  walletType: string;
  label: string;
  addedAt: Date;
  lastUsed?: Date;
  balance?: string;
  ensName?: string;
}

@Component({
  tag: 'euclid-address-book',
  styleUrl: 'euclid-address-book.css',
  shadow: true,
})
export class EuclidAddressBook {
  @State() savedAddresses: SavedAddress[] = [];
  @State() isEditing: boolean = false;
  @State() editingAddress: SavedAddress | null = null;
  @State() newAddressForm: Partial<SavedAddress> = {};
  @State() selectedChainUID: string = '';
  @State() viewMode: 'wallets' | 'chain' = 'wallets'; // Default to wallets view


  @Event() addressSelected: EventEmitter<SavedAddress>;
  @Event() addressAdded: EventEmitter<SavedAddress>;
  @Event() addressUpdated: EventEmitter<SavedAddress>;
  @Event() addressRemoved: EventEmitter<SavedAddress>;

  async componentWillLoad() {
    await this.loadSavedAddresses();
  }

  componentDidLoad() {
    // Auto-select first chain if none selected
    this.ensureChainSelected();

    // Listen for market store changes to auto-select chain when chains load
    marketStore.onChange('chains', () => {
      this.ensureChainSelected();
    });

    // Use shared utility for wallet store listeners
    setupWalletStoreListeners(() => {
      // Force a component re-render to update the UI
      this.savedAddresses = [...this.savedAddresses];
    });

    // Start real-time connection monitoring
    this.startAutoConnectMonitoring();
  }

  private ensureChainSelected() {
    // Always start with wallets view
    if (!this.selectedChainUID && this.viewMode !== 'wallets') {
      this.viewMode = 'wallets';
    }
  }

  @Listen('euclid:wallet:connect-success', { target: 'window' })
  handleWalletConnectSuccess() {
    // Component will auto-refresh through store listener
  }

  private async loadSavedAddresses() {
    try {
      const addresses = await walletStorage.getAddressBook() as SavedAddress[];
      this.savedAddresses = addresses.map(addr => ({
        ...addr,
        addedAt: new Date(addr.addedAt),
        lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined,
      }));
    } catch {
      try {
        const saved = localStorage.getItem('euclid-address-book');
        if (saved) {
          this.savedAddresses = JSON.parse(saved).map((addr: SavedAddress) => ({
            ...addr,
            addedAt: new Date(addr.addedAt),
            lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined,
          }));

          await this.saveAddresses();
          localStorage.removeItem('euclid-address-book');
        }
      } catch {
        this.savedAddresses = [];
      }
    }
  }

  private async saveAddresses() {
    try {
      await walletStorage.setAddressBook(this.savedAddresses);
    } catch {
      try {
        localStorage.setItem('euclid-address-book', stringifyWithCache(this.savedAddresses));
      } catch (fallbackError) {
        logger.error('AddressBook', 'Failed to save addresses', fallbackError);
      }
    }
  }

  private async startAutoConnectMonitoring() {
    // Import and start the new auto-connect system
    const { startAutoConnectMonitoring } = await import('../../../utils/wallet-connection-checker');
    startAutoConnectMonitoring();
  }

  private handleAddAddress = () => {
    this.isEditing = true;
    this.editingAddress = null;
    this.newAddressForm = {
      address: '',
      chainUID: '',
      walletType: 'manual',
      label: '',
    };
  };

  private handleSaveAddress = () => {
    if (!this.newAddressForm.address || !this.newAddressForm.label || !this.newAddressForm.chainUID) {
      return;
    }

    if (this.editingAddress) {
      this.handleCancelEdit();
      return;
    }

    const success = addCustomWallet(
      this.newAddressForm.address!,
      this.newAddressForm.chainUID!,
      this.newAddressForm.label!,
      'custom'
    );

    if (success) {
      const newAddress: SavedAddress = {
        id: `custom-${this.newAddressForm.chainUID}-${Date.now()}`,
        address: this.newAddressForm.address!,
        chainUID: this.newAddressForm.chainUID!,
        walletType: 'custom',
        label: this.newAddressForm.label!,
        addedAt: new Date(),
      };

      this.savedAddresses = [...this.savedAddresses, newAddress];
      this.addressAdded.emit(newAddress);
      this.saveAddresses();
    }

    this.handleCancelEdit();
  };

  private handleCancelEdit = () => {
    this.isEditing = false;
    this.editingAddress = null;
    this.newAddressForm = {};
  };

  private handleConnectWallet = () => {
    appStore.openWalletModal();
  };

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private getDisplayedAddresses(): SavedAddress[] {
    const addresses = this.savedAddresses;

    // Sort by last used, then by added date
    return addresses.sort((a, b) => {
      // By last used (most recent first)
      if (a.lastUsed && b.lastUsed) {
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      }
      if (a.lastUsed && !b.lastUsed) return -1;
      if (!a.lastUsed && b.lastUsed) return 1;

      // Finally by added date (most recent first)
      return b.addedAt.getTime() - a.addedAt.getTime();
    });
  }

  private getAllChains() {
    // Get all chains from market store, regardless of whether user has addresses
    return marketStore.state.chains.sort((a, b) => {
      // Sort by: EVM chains first, then by display name
      if (a.type !== b.type) {
        return a.type === 'EVM' ? -1 : 1;
      }
      return a.display_name.localeCompare(b.display_name);
    });
  }

  private getWalletsForChain(chainUID: string): WalletData[] {
    // Get ALL wallets (connected + saved) with real-time status for this specific chain
    const allWallets = this.getAllWallets().filter(wallet => wallet.chainUID === chainUID);

    // Convert to WalletData format
    return allWallets.map(wallet => ({
      id: wallet.id,
      address: wallet.address,
      chainUID: wallet.chainUID,
      chainName: wallet.chainName,
      chainLogo: wallet.chainLogo,
      chainType: wallet.chainType,
      walletType: wallet.walletType,
      provider: wallet.provider,
      label: wallet.label,
      autoConnect: wallet.autoConnect ?? false,
    }));
  }

  private handleChainSelect = (chainUID: string) => {
    this.selectedChainUID = chainUID;
    this.viewMode = 'chain';
    // Close editing form when switching chains
    this.isEditing = false;
    this.editingAddress = null;
    this.newAddressForm = {};
  };

  private handleWalletsSelect = () => {
    this.viewMode = 'wallets';
    this.selectedChainUID = '';
    // Close editing form when switching to wallets
    this.isEditing = false;
    this.editingAddress = null;
    this.newAddressForm = {};
  };

  private getConnectedWallets() {
    // Use the shared utility - READS FROM WALLET STORE STATE
    return getConnectedWallets();
  }

  private getAllWallets() {
    // Just return all saved wallets from the store
    return this.getConnectedWallets();
  }

  private convertAddressToWallet(address: SavedAddress, chain?: { display_name: string; logo: string; type: string }) {
    return {
      id: address.id,
      address: address.address,
      chainUID: address.chainUID,
      chainName: chain?.display_name || 'Unknown Chain',
      chainLogo: chain?.logo || '',
      chainType: chain?.type || 'Unknown',
      walletType: address.walletType,
      provider: address.walletType,
      label: address.label,
      autoConnect: false, // Default for converted addresses
    };
  }

  private getSelectedChain() {
    return this.getAllChains().find(chain => chain.chain_uid === this.selectedChainUID);
  }

  private getSelectedChainAddresses(): WalletData[] {
    return this.getWalletsForChain(this.selectedChainUID);
  }

  private renderAddressForm() {
    return (
      <div class="address-form">
        <div class="form-header">
          <h3>{this.editingAddress ? 'Edit Address' : 'Add Address'}</h3>
          <button
            class="close-btn"
            onClick={this.handleCancelEdit}
            type="button"
          >
            ✕
          </button>
        </div>

        <div class="form-fields">
          <div class="field">
            <label>Label</label>
            <input
              type="text"
              placeholder="e.g., My Main Wallet"
              value={this.newAddressForm.label || ''}
              onInput={(e) => {
                this.newAddressForm = {
                  ...this.newAddressForm,
                  label: (e.target as HTMLInputElement).value
                };
              }}
            />
          </div>

          <div class="field">
            <label>Address</label>
            <input
              type="text"
              placeholder="0x... or cosmos..."
              value={this.newAddressForm.address || ''}
              onInput={(e) => {
                this.newAddressForm = {
                  ...this.newAddressForm,
                  address: (e.target as HTMLInputElement).value
                };
              }}
            />
          </div>

          <div class="field">
            <label>Chain</label>
            <select
              onInput={(e) => {
                this.newAddressForm = {
                  ...this.newAddressForm,
                  chainUID: (e.target as HTMLSelectElement).value
                };
              }}
            >
              <option value="">Select a chain...</option>
              {this.getAllChains().map(chain => (
                <option
                  key={chain.chain_uid}
                  value={chain.chain_uid}
                  selected={this.newAddressForm.chainUID === chain.chain_uid}
                >
                  {chain.display_name} ({chain.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="form-actions">
          <euclid-button
            variant="secondary"
            onClick={this.handleCancelEdit}
          >
            Cancel
          </euclid-button>
          <euclid-button
            variant="primary"
            onClick={this.handleSaveAddress}
            disabled={!this.newAddressForm.address || !this.newAddressForm.label}
          >
            {this.editingAddress ? 'Update' : 'Add'} Address
          </euclid-button>
        </div>
      </div>
    );
  }

  private renderWalletsList() {
    const allWallets = this.getAllWallets();

    return (
      <div class="wallets-section">
        <div class="chain-header">
          <div class="chain-header-info">
            <div class="wallets-icon">💼</div>
            <div>
              <h3>All Wallets</h3>
              <div class="meta">
                <span class="badge">All Chains</span>
                <span class="chain-id">{allWallets.length} wallets</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={this.handleAddAddress}
            >
              + Add Custom
            </euclid-button>
            <euclid-button
              variant="primary"
              size="sm"
              onClick={() => appStore.openWalletModal()}
            >
              🔗 Connect Wallet
            </euclid-button>
          </div>
        </div>

        <div class="addresses">
          {allWallets.length === 0 ? (
            <div class="empty">
              <div class="icon">💼</div>
              <h4>No wallets added</h4>
              <p>Connect a wallet or add a custom address to get started</p>
              <div class="actions">
                <euclid-button variant="primary" onClick={() => appStore.openWalletModal()}>
                  Connect Wallet
                </euclid-button>
                <euclid-button variant="ghost" onClick={this.handleAddAddress}>
                  Add Custom Address
                </euclid-button>
              </div>
            </div>
          ) : (
            <div class="wallet-list">
              {allWallets.map(wallet => (
                <euclid-wallet
                  key={wallet.id}
                  wallet={{
                    id: wallet.id,
                    address: wallet.address,
                    chainUID: wallet.chainUID,
                    chainName: wallet.chainName,
                    chainLogo: wallet.chainLogo,
                    chainType: wallet.chainType,
                    walletType: wallet.walletType,
                    provider: wallet.provider,
                    label: wallet.label,
                    autoConnect: wallet.autoConnect ?? false,
                  }}
                  clickable={true}
                  showConnectionStatus={false}
                  showChainInfo={true}
                  showActions={true}
                  onWalletClick={(event) => this.handleSelectWallet(event.detail)}
                  onWalletDelete={(event) => this.handleWalletDelete(event.detail)}
                  onWalletEdit={(event) => this.handleWalletEdit(event.detail)}
                  onWalletToggleAutoConnect={(event) => this.handleToggleAutoConnect(event.detail)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleSelectWallet = (_wallet: WalletData) => {
    // Wallet selection logic if needed
  };

  private handleRemoveWallet = (wallet: WalletData) => {
    const success = removeWallet(wallet.chainUID);
    if (success) {
      this.savedAddresses = this.savedAddresses.filter(addr =>
        !(addr.address === wallet.address && addr.chainUID === wallet.chainUID)
      );
      this.saveAddresses();
    }
  };

  private handleWalletDelete = (wallet: WalletData) => {
    this.handleRemoveWallet(wallet);
  };

  private handleWalletEdit = (_wallet: WalletData) => {
    // TODO: Implement wallet editing
  };

  private handleToggleAutoConnect = (wallet: WalletData) => {
    logger.debug('AddressBook', 'Toggle auto-connect for wallet', wallet);

    // Ensure we have a proper boolean value (handle undefined)
    const currentAutoConnect = wallet.autoConnect ?? false;
    logger.debug('AddressBook', 'Current autoConnect', currentAutoConnect);

    // Toggle auto-connect setting in wallet store
    const newAutoConnect = !currentAutoConnect;
    logger.debug('AddressBook', 'New autoConnect value', newAutoConnect);

    // Update the wallet in store with new auto-connect setting
    walletStore.addWallet(wallet.chainUID, {
      address: wallet.address,
      walletType: wallet.walletType as WalletType, // Cast string to WalletType
      name: wallet.label,
      balances: [],
      chainName: wallet.chainName,
      chainType: wallet.chainType as ChainType, // Cast string to ChainType
      chainLogo: wallet.chainLogo,
      autoConnect: newAutoConnect
    });

    logger.debug('AddressBook', 'Updated wallet store - wallet store should auto-update UI');
    // DON'T use refreshTrigger - it causes entire app to re-render!
    // The wallet store update should automatically trigger UI refresh
  };

  render() {
    const allChains = this.getAllChains();
    const selectedChain = this.getSelectedChain();
    const selectedChainAddresses = this.getSelectedChainAddresses();

    return (
      <div class="address-book">
        <div class="header">
          <h2>📖 Address Book</h2>
          <div class="header-actions" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <euclid-button variant="ghost" size="sm" onClick={() => { this.loadSavedAddresses(); }}>
              🔄 Sync
            </euclid-button>
          </div>
        </div>

        {this.isEditing && this.renderAddressForm()}

        <div class="content">
          {/* SIDEBAR - Wallets and Chain Selection */}
          <div class="sidebar">
            {/* Wallets Item */}
            <div
              class={`wallets-item ${this.viewMode === 'wallets' ? 'selected' : ''}`}
              onClick={this.handleWalletsSelect}
            >
              <div class="wallets-icon">💼</div>
              <div class="chain-info">
                <div class="chain-name">Wallets</div>
                <div class="chain-type">All Chains</div>
              </div>
              <div class="chain-badges">
                <span class="count">{getAllWallets().length}</span>
              </div>
            </div>

            {/* Chain Items */}
            {allChains.map(chain => {
              const chainAddresses = this.getWalletsForChain(chain.chain_uid);
              const isSelected = this.selectedChainUID === chain.chain_uid && this.viewMode === 'chain';
              const hasAddresses = chainAddresses.length > 0;

              return (
                <div
                  key={chain.chain_uid}
                  class={`chain-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => this.handleChainSelect(chain.chain_uid)}
                >
                  <img src={chain.logo} alt={chain.display_name} class="chain-logo" />
                  <div class="chain-info">
                    <div class="chain-name">{chain.display_name}</div>
                    <div class="chain-type">{chain.type}</div>
                  </div>
                  {hasAddresses && (
                    <div class="chain-badges">
                      <span class="count">{chainAddresses.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* MAIN CONTENT - Wallets or Selected Chain's Addresses */}
          <div class="main">
            {this.viewMode === 'wallets' ? (
              this.renderWalletsList()
            ) : selectedChain ? (
              <div class="chain-section">
                {/* Chain Header */}
                <div class="chain-header">
                  <div class="chain-header-info">
                    <img src={selectedChain.logo} alt={selectedChain.display_name} class="logo" />
                    <div>
                      <h3>{selectedChain.display_name}</h3>
                      <div class="meta">
                        <span class={`badge ${selectedChain.type.toLowerCase()}`}>{selectedChain.type}</span>
                        <span class="chain-id">{selectedChain.chain_id}</span>
                      </div>
                    </div>
                  </div>
                  <div class="actions">
                    <euclid-button
                      variant="secondary"
                      size="sm"
                      onClick={() => appStore.openWalletModal(this.selectedChainUID)}
                    >
                      🔗 Connect
                    </euclid-button>
                    <euclid-button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        this.handleAddAddress();
                        this.newAddressForm = { ...this.newAddressForm, chainUID: this.selectedChainUID };
                      }}
                    >
                      + Add
                    </euclid-button>
                  </div>
                </div>

                {/* Addresses List */}
                <div class="addresses">
                  {selectedChainAddresses.length === 0 ? (
                    <div class="empty">
                      <div class="icon">📭</div>
                      <h4>No addresses for {selectedChain.display_name}</h4>
                      <p>Connect a wallet or add an address manually</p>
                      <div class="actions">
                        <euclid-button variant="primary" onClick={() => appStore.openWalletModal(this.selectedChainUID)}>
                          Connect Wallet
                        </euclid-button>
                        <euclid-button
                          variant="ghost"
                          onClick={() => {
                            this.handleAddAddress();
                            this.newAddressForm = { ...this.newAddressForm, chainUID: this.selectedChainUID };
                          }}
                        >
                          Add Manually
                        </euclid-button>
                      </div>
                    </div>
                  ) : (
                    <div class="wallet-list">
                      {selectedChainAddresses.map(wallet => (
                        <euclid-wallet
                          key={wallet.id}
                          wallet={wallet}
                          clickable={true}
                          showConnectionStatus={false}
                          showChainInfo={false}
                          showActions={true}
                          onWalletClick={(event) => this.handleSelectWallet(event.detail)}
                          onWalletDelete={(event) => this.handleWalletDelete(event.detail)}
                          onWalletEdit={(event) => this.handleWalletEdit(event.detail)}
                          onWalletToggleAutoConnect={(event) => this.handleToggleAutoConnect(event.detail)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div class="empty">
                <div class="icon">⛓️</div>
                <h3>Select a chain</h3>
                <p>Choose a blockchain network from the sidebar to view and manage addresses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
