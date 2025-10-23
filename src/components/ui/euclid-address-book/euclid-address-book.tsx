import { Component, h, State, Event, EventEmitter, Listen } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import { marketStore } from '../../../store/market.store';
import { walletStorage } from '../../../utils/storage/indexdb-storage';
import { getConnectedWallets, setupWalletStoreListeners } from '../../../utils/wallet-utils';
import { WalletData } from '../euclid-wallet/euclid-wallet';

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
  @State() refreshTrigger: number = 0; // For triggering re-renders
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
      this.refreshTrigger = Date.now();
    });
  }

  private ensureChainSelected() {
    // Always start with wallets view
    if (!this.selectedChainUID && this.viewMode !== 'wallets') {
      this.viewMode = 'wallets';
    }
  }

  @Listen('euclid:wallet:connect-success', { target: 'window' })
  handleWalletConnectSuccess() {
    this.refreshTrigger = Date.now();
  }

  private async loadSavedAddresses() {
    try {
      // Try to load from IndexedDB first
      const addresses = await walletStorage.getAddressBook() as SavedAddress[];
      this.savedAddresses = addresses.map(addr => ({
        ...addr,
        addedAt: new Date(addr.addedAt),
        lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load saved addresses from IndexedDB:', error);

      // Fallback to localStorage for migration
      try {
        const saved = localStorage.getItem('euclid-address-book');
        if (saved) {
          this.savedAddresses = JSON.parse(saved).map((addr: SavedAddress) => ({
            ...addr,
            addedAt: new Date(addr.addedAt),
            lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined,
          }));

          // Migrate to IndexedDB and remove from localStorage
          await this.saveAddresses();
          localStorage.removeItem('euclid-address-book');
        }
      } catch (legacyError) {
        console.error('Failed to load addresses from localStorage:', legacyError);
        this.savedAddresses = [];
      }
    }
  }

  private async saveAddresses() {
    try {
      await walletStorage.setAddressBook(this.savedAddresses);
    } catch (error) {
      console.error('Failed to save addresses to IndexedDB:', error);

      // Fallback to localStorage if IndexedDB fails
      try {
        localStorage.setItem('euclid-address-book', JSON.stringify(this.savedAddresses));
        console.warn('📇 Fallback: Saved addresses to localStorage instead');
      } catch (fallbackError) {
        console.error('Failed to save addresses to localStorage fallback:', fallbackError);
      }
    }
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

  private handleEditAddress = (address: SavedAddress) => {
    this.isEditing = true;
    this.editingAddress = address;
    this.newAddressForm = { ...address };
  };

  private handleSaveAddress = () => {
    if (!this.newAddressForm.address || !this.newAddressForm.label) {
      return;
    }

    if (this.editingAddress) {
      // Update existing address
      const index = this.savedAddresses.findIndex(addr => addr.id === this.editingAddress!.id);
      if (index !== -1) {
        this.savedAddresses[index] = {
          ...this.editingAddress,
          ...this.newAddressForm,
        } as SavedAddress;

        this.addressUpdated.emit(this.savedAddresses[index]);
      }
    } else {
      // Add new address
      const newAddress: SavedAddress = {
        id: `manual-${Date.now()}`,
        address: this.newAddressForm.address!,
        chainUID: this.newAddressForm.chainUID || 'ethereum',
        walletType: this.newAddressForm.walletType || 'manual',
        label: this.newAddressForm.label!,
        addedAt: new Date(),
      };

      this.savedAddresses = [...this.savedAddresses, newAddress];
      this.addressAdded.emit(newAddress);
    }

    this.saveAddresses();
    this.handleCancelEdit();
  };

  private handleCancelEdit = () => {
    this.isEditing = false;
    this.editingAddress = null;
    this.newAddressForm = {};
  };

  private handleRemoveAddress = (address: SavedAddress) => {
    this.savedAddresses = this.savedAddresses.filter(addr => addr.id !== address.id);
    this.saveAddresses();
    this.addressRemoved.emit(address);
  };

  private handleSelectAddress = (address: SavedAddress) => {
    // Update last used timestamp
    address.lastUsed = new Date();
    this.saveAddresses();

    this.addressSelected.emit(address);
  };

  private handleConnectWallet = () => {
    appStore.openWalletModal();
  };

  private handleConnectWalletForChain = (chainUID: string) => {
    appStore.openWalletModal(chainUID);
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
    // Get connected wallets for this specific chain
    const connectedWallets = this.getConnectedWallets().filter(wallet => wallet.chainUID === chainUID);

    // Get saved addresses for this chain and convert to WalletData format
    const savedAddresses = this.getDisplayedAddresses().filter(addr => addr.chainUID === chainUID);
    const chain = this.getAllChains().find(c => c.chain_uid === chainUID);

    const savedAsWallets: WalletData[] = savedAddresses.map(address =>
      this.convertAddressToWallet(address, chain)
    );

    // Merge and deduplicate by address
    const allWallets = [...connectedWallets];
    savedAsWallets.forEach(savedWallet => {
      const alreadyExists = allWallets.some(wallet => wallet.address === savedWallet.address);
      if (!alreadyExists) {
        allWallets.push(savedWallet);
      }
    });

    return allWallets;
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
      isConnected: false, // Saved addresses are not connected by default
      label: address.label,
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
    const connectedWallets = this.getConnectedWallets();

    return (
      <div class="wallets-section">
        {/* Wallets Header */}
        <div class="chain-header">
          <div class="chain-header-info">
            <div class="wallets-icon">💼</div>
            <div>
              <h3>Connected Wallets</h3>
              <div class="meta">
                <span class="badge">All Chains</span>
                <span class="chain-id">{connectedWallets.length} wallets</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <euclid-button
              variant="primary"
              size="sm"
              onClick={() => appStore.openWalletModal()}
            >
              + Connect Wallet
            </euclid-button>
          </div>
        </div>

        {/* Wallets List */}
        <div class="addresses">
          {connectedWallets.length === 0 ? (
            <div class="empty">
              <div class="icon">💼</div>
              <h4>No connected wallets</h4>
              <p>Connect a wallet to start managing your addresses across all chains</p>
              <div class="actions">
                <euclid-button variant="primary" onClick={() => appStore.openWalletModal()}>
                  Connect Wallet
                </euclid-button>
              </div>
            </div>
          ) : (
            <div class="wallet-list">
              {connectedWallets.map(wallet => (
                <euclid-wallet
                  key={wallet.id}
                  wallet={wallet}
                  clickable={true}
                  showConnectionStatus={true}
                  showChainInfo={true}
                  onWalletClick={(event) => this.handleSelectWallet(event.detail)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleSelectWallet = (_wallet: WalletData) => {
    // You can add wallet selection logic here if needed
  };

  render() {
    const allChains = this.getAllChains();
    const selectedChain = this.getSelectedChain();
    const selectedChainAddresses = this.getSelectedChainAddresses();

    return (
      <div class="address-book">
        <div class="header">
          <h2>📖 Address Book</h2>
          <euclid-button variant="ghost" size="sm" onClick={() => { this.refreshTrigger = Date.now(); }}>
            🔄 Sync
          </euclid-button>
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
                <span class="count">{this.getConnectedWallets().length}</span>
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
                      onClick={() => this.handleConnectWalletForChain(this.selectedChainUID)}
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
                        <euclid-button variant="primary" onClick={() => this.handleConnectWalletForChain(this.selectedChainUID)}>
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
                    <div class="address-list">
                      {selectedChainAddresses.map(wallet => (
                        <euclid-wallet
                          key={wallet.id}
                          wallet={wallet}
                          clickable={true}
                          showConnectionStatus={true}
                          showChainInfo={false}
                          onWalletClick={(event) => this.handleSelectWallet(event.detail)}
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
