import { Component, h, State, Event, EventEmitter, Prop, Listen } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';

export interface SavedAddress {
  id: string;
  address: string;
  chainUID: string;
  walletType: string;
  label: string;
  isActive: boolean;
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

  @Prop() showActiveOnly: boolean = false;
  @Prop() allowEditing: boolean = true;
  @Prop() showBalances: boolean = true;

  @Event() addressSelected: EventEmitter<SavedAddress>;
  @Event() addressAdded: EventEmitter<SavedAddress>;
  @Event() addressUpdated: EventEmitter<SavedAddress>;
  @Event() addressRemoved: EventEmitter<SavedAddress>;

  componentWillLoad() {
    this.loadSavedAddresses();
    this.syncWithConnectedWallets();

    // Listen for wallet changes to auto-save new addresses
    walletStore.onChange('connectedWallets', () => {
      console.log('📇 Address book detected connectedWallets change, syncing...');
      this.syncWithConnectedWallets();
    });

    // Also listen to the main wallet state changes for compatibility
    walletStore.onChange('isConnected', () => {
      console.log('📇 Address book detected isConnected state change');
      this.syncWithConnectedWallets();
    });

    // Listen to the wallets Map as well (for multi-wallet support)
    walletStore.onChange('wallets', () => {
      console.log('📇 Address book detected wallets map change, syncing...');
      this.syncWithConnectedWallets();
    });
  }

  @Listen('euclid:wallet:connect-success', { target: 'window' })
  handleWalletConnectSuccess() {
    console.log('📇 Address book received wallet connect success event, syncing...');
    this.syncWithConnectedWallets();
  }

  private loadSavedAddresses() {
    try {
      const saved = localStorage.getItem('euclid-address-book');
      if (saved) {
        this.savedAddresses = JSON.parse(saved).map((addr: SavedAddress) => ({
          ...addr,
          addedAt: new Date(addr.addedAt),
          lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
      this.savedAddresses = [];
    }
  }

  private saveAddresses() {
    try {
      localStorage.setItem('euclid-address-book', JSON.stringify(this.savedAddresses));
    } catch (error) {
      console.error('Failed to save addresses:', error);
    }
  }

  private syncWithConnectedWallets() {
    const connectedWallets = walletStore.state.connectedWallets;
    let hasNewAddresses = false;

    console.log('📇 Address Book - Full wallet store state:', {
      isConnected: walletStore.state.isConnected,
      address: walletStore.state.address,
      connectedWallets: connectedWallets,
      connectedWalletsType: typeof connectedWallets,
      isMap: connectedWallets instanceof Map,
      mapSize: connectedWallets instanceof Map ? connectedWallets.size : 'N/A'
    });

    // Handle both Map and Object types for connectedWallets
    let walletEntries: [string, { address: string; walletType?: string; type?: string; name?: string }][] = [];
    if (connectedWallets instanceof Map) {
      walletEntries = Array.from(connectedWallets.entries());
    } else if (typeof connectedWallets === 'object' && connectedWallets !== null) {
      walletEntries = Object.entries(connectedWallets) as typeof walletEntries;
    }

    // Also check if there's a primary wallet connected but not in the Map/Object
    if (walletStore.state.isConnected && walletStore.state.address && walletEntries.length === 0) {
      console.log('📇 Found primary wallet connection, adding to entries');
      walletEntries.push([
        walletStore.state.chainUID || 'primary',
        {
          address: walletStore.state.address,
          walletType: walletStore.state.walletType || 'unknown',
          name: walletStore.state.walletType || 'Primary Wallet'
        }
      ]);
    }

    console.log('📇 Syncing with connected wallets:', walletEntries.length, 'found', walletEntries);

    walletEntries.forEach(([chainUID, wallet]) => {
      const existingAddress = this.savedAddresses.find(
        addr => addr.address === wallet.address && addr.chainUID === chainUID
      );

      if (!existingAddress) {
        // Auto-save newly connected wallet
        const newAddress: SavedAddress = {
          id: `${chainUID}-${wallet.address}-${Date.now()}`,
          address: wallet.address,
          chainUID,
          walletType: wallet.walletType || wallet.type || 'unknown',
          label: `${wallet.name || wallet.walletType || 'Wallet'} (${chainUID})`,
          isActive: true,
          addedAt: new Date(),
          lastUsed: new Date(),
        };

        this.savedAddresses = [...this.savedAddresses, newAddress];
        hasNewAddresses = true;

        console.log('📝 Auto-saved new wallet address:', newAddress);
        this.addressAdded.emit(newAddress);
      } else {
        // Update existing address as active and mark as recently used
        if (!existingAddress.isActive || !existingAddress.lastUsed) {
          existingAddress.isActive = true;
          existingAddress.lastUsed = new Date();
          hasNewAddresses = true;
        }
      }
    });

    // Mark addresses as inactive if they're no longer connected
    this.savedAddresses.forEach(savedAddr => {
      const isStillConnected = walletEntries.some(
        ([chainUID, wallet]) =>
          wallet.address === savedAddr.address && chainUID === savedAddr.chainUID
      );

      if (!isStillConnected && savedAddr.isActive) {
        savedAddr.isActive = false;
        hasNewAddresses = true;
      }
    });

    if (hasNewAddresses) {
      this.saveAddresses();
      // Trigger re-render
      this.savedAddresses = [...this.savedAddresses];
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
        isActive: false,
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
    console.log('📇 Opening wallet connection modal...');
    appStore.openWalletModal();
  };

  // Debug methods
  private handleSyncClick = () => {
    console.log('🔄 Manual sync triggered');
    this.syncWithConnectedWallets();
  };

  private debugWalletStore = () => {
    console.log('🔍 DEBUG: Wallet Store State');
    console.log('- isConnected:', walletStore.state.isConnected);
    console.log('- connectedWallets:', walletStore.state.connectedWallets);
    console.log('- connectedWallets type:', typeof walletStore.state.connectedWallets);
    console.log('- connectedWallets instanceof Map:', walletStore.state.connectedWallets instanceof Map);

    if (walletStore.state.connectedWallets instanceof Map) {
      console.log('- Map size:', walletStore.state.connectedWallets.size);
      console.log('- Map entries:', Array.from(walletStore.state.connectedWallets.entries()));
    } else {
      console.log('- Object keys:', Object.keys(walletStore.state.connectedWallets || {}));
      console.log('- Object entries:', Object.entries(walletStore.state.connectedWallets || {}));
    }
    console.log('- Full state:', walletStore.state);
  };

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private getDisplayedAddresses(): SavedAddress[] {
    let addresses = this.savedAddresses;

    if (this.showActiveOnly) {
      addresses = addresses.filter(addr => addr.isActive);
    }

    // Sort by: active first, then by last used, then by added date
    return addresses.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;

      const aLastUsed = a.lastUsed?.getTime() || 0;
      const bLastUsed = b.lastUsed?.getTime() || 0;
      if (aLastUsed !== bLastUsed) return bLastUsed - aLastUsed;

      return b.addedAt.getTime() - a.addedAt.getTime();
    });
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
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="bsc">BSC</option>
              <option value="cosmoshub-4">Cosmos Hub</option>
              <option value="osmosis-1">Osmosis</option>
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

  render() {
    const displayedAddresses = this.getDisplayedAddresses();

    return (
      <div class="address-book">
        <div class="address-book-header">
          <h2>Address Book</h2>
          <div class="header-actions">
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={() => this.syncWithConnectedWallets()}
            >
              🔄 Sync
            </euclid-button>
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={this.debugWalletStore}
            >
              🔍 Debug
            </euclid-button>
            <euclid-button
              variant="secondary"
              size="sm"
              onClick={this.handleConnectWallet}
            >
              🔗 Connect Wallet
            </euclid-button>
            {this.allowEditing && (
              <euclid-button
                variant="primary"
                size="sm"
                onClick={this.handleAddAddress}
              >
                + Add Address
              </euclid-button>
            )}
          </div>
        </div>

        {this.isEditing && this.renderAddressForm()}

        <div class="address-list">
          {displayedAddresses.length === 0 ? (
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z"/>
              </svg>
              <span>No addresses saved yet</span>
              <div class="empty-actions">
                <euclid-button
                  variant="primary"
                  onClick={this.handleConnectWallet}
                >
                  🔗 Connect Wallet
                </euclid-button>
                {this.allowEditing && (
                  <euclid-button
                    variant="ghost"
                    onClick={this.handleAddAddress}
                  >
                    Or add manually
                  </euclid-button>
                )}
              </div>
            </div>
          ) : (
            displayedAddresses.map(address => (
              <div
                key={address.id}
                class={{
                  'address-item': true,
                  'address-item--active': address.isActive,
                }}
                onClick={() => this.handleSelectAddress(address)}
              >
                <div class="address-main">
                  <div class="address-info">
                    <div class="address-label">
                      {address.label}
                      {address.isActive && <span class="active-badge">Active</span>}
                    </div>
                    <div class="address-value">{this.formatAddress(address.address)}</div>
                    <div class="address-meta">
                      <span class="chain">{address.chainUID}</span>
                      <span class="wallet-type">{address.walletType}</span>
                      {address.lastUsed && (
                        <span class="last-used">
                          Last used {address.lastUsed.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {this.showBalances && address.balance && (
                    <div class="address-balance">
                      <span class="balance-value">{address.balance}</span>
                    </div>
                  )}
                </div>

                {this.allowEditing && (
                  <div class="address-actions">
                    <button
                      class="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleEditAddress(address);
                      }}
                      type="button"
                      title="Edit address"
                    >
                      ✎
                    </button>
                    <button
                      class="action-btn action-btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleRemoveAddress(address);
                      }}
                      type="button"
                      title="Remove address"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div class="address-book-footer">
          <div class="stats">
            <span>{displayedAddresses.length} addresses</span>
            {displayedAddresses.filter(a => a.isActive).length > 0 && (
              <span>• {displayedAddresses.filter(a => a.isActive).length} active</span>
            )}
          </div>
        </div>
      </div>
    );
  }
}
