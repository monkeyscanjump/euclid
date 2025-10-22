import { createStore } from '@stencil/store';
import type { WalletState, WalletInfo } from '../utils/types/euclid-api.types';
import type { UserBalance } from '../utils/types/api.types';
import type { BaseStore } from './types';
import { walletAdapterFactory } from '../utils/wallet-adapters';
import { walletStorage, migrateFromLocalStorage } from '../utils/storage/indexdb-storage';
import { wrapStoreWithSmartUpdates } from '../utils/store-update-coordinator';

// Extended wallet state to support multiple wallets
interface ExtendedWalletState extends WalletState, Record<string, unknown> {
  connectedWallets: Map<string, WalletInfo>; // chainUID -> WalletInfo
  wallets: Map<string, WalletInfo>; // alias for backward compatibility
}

const initialState: ExtendedWalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  chainUID: null,
  walletType: null,
  balances: [],
  loading: false,
  error: null,
  connectedWallets: new Map(),
  wallets: new Map(), // alias for backward compatibility
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Wrap store with smart updates
const smartStore = wrapStoreWithSmartUpdates(
  { state, onChange },
  'wallet-store',
  {
    debounceMs: 100,
    deepCompare: true,
    skipFields: ['loading', 'error']
  }
);

// Actions with IndexedDB persistence
const actions = {
  setLoading(loading: boolean) {
    state.loading = loading;
  },

  setError(error: string | null) {
    state.error = error;
  },

  async initialize() {
    // Migrate from localStorage if needed
    await migrateFromLocalStorage();

    // Load persisted wallet connections
    try {
      const savedWallets = await walletStorage.getConnectedWallets();
      if (savedWallets.size > 0) {
        smartStore.smartUpdate({
          connectedWallets: savedWallets,
          wallets: savedWallets, // Keep alias synchronized
        });

        // Set primary wallet state from first connected wallet
        const firstWallet = Array.from(savedWallets.values())[0];
        if (firstWallet) {
          smartStore.smartUpdate({
            isConnected: true,
            address: firstWallet.address,
            chainUID: firstWallet.chainUID,
            walletType: firstWallet.walletType,
            balances: [...firstWallet.balances],
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted wallets:', error);
    }

    console.log('Wallet store initialized');
  },

  async connectWallet(walletType: 'metamask' | 'keplr' | 'phantom', chainId?: string) {
    state.loading = true;
    state.error = null;

    try {
      const adapter = walletAdapterFactory.getAdapter(walletType);

      if (!adapter.isAvailable()) {
        throw new Error(`${walletType} wallet is not installed`);
      }

      const connection = await adapter.connect(chainId);

      state.isConnected = true;
      state.address = connection.address;
      state.chainId = connection.chainId;
      state.chainUID = connection.chainId; // For now, using chainId as chainUID
      state.walletType = walletType;
      state.error = null;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to connect wallet';
    } finally {
      state.loading = false;
    }
  },

  async disconnectWallet(chainUID?: string) {
    if (chainUID) {
      // Disconnect specific wallet
      actions.removeWallet(chainUID);
    } else {
      // Disconnect all wallets
      if (state.walletType) {
        try {
          const adapter = walletAdapterFactory.getAdapter(state.walletType);
          await adapter.disconnect();
        } catch (error) {
          console.warn('Error disconnecting wallet:', error);
        }
      }

      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.chainUID = null;
      state.walletType = null;
      state.balances = [];
      state.connectedWallets.clear();
      state.error = null;
    }
  },

  setBalances(balances: UserBalance[]) {
    state.balances = [...balances];
  },

  updateBalance(tokenId: string, balance: string) {
    const existingIndex = state.balances.findIndex(b => b.token === tokenId);

    const balanceObject: UserBalance = {
      amount: balance,
      token_id: tokenId,
      // Legacy compatibility fields
      token: tokenId,
      balance: balance,
      chain_uid: state.chainUID || '',
      token_type: { native: { denom: tokenId } },
    };

    if (existingIndex >= 0) {
      state.balances[existingIndex] = balanceObject;
    } else {
      state.balances.push(balanceObject);
    }
  },

  async switchChain(chainId: string) {
    if (!state.walletType) {
      throw new Error('No wallet connected');
    }

    state.loading = true;
    state.error = null;

    try {
      const adapter = walletAdapterFactory.getAdapter(state.walletType);
      await adapter.switchChain(chainId);

      state.chainId = chainId;
      state.chainUID = chainId;
      state.error = null;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to switch chain';
    } finally {
      state.loading = false;
    }
  },

  clear() {
    reset();
  },

  // Multi-wallet support methods
  addWallet(chainUID: string, walletInfo: Omit<WalletInfo, 'chainUID'>) {
    const fullWalletInfo: WalletInfo = {
      ...walletInfo,
      chainUID,
      type: walletInfo.walletType, // Set legacy alias
      name: walletInfo.walletType, // Set legacy name
    };

    const newConnectedWallets = new Map(state.connectedWallets);
    newConnectedWallets.set(chainUID, fullWalletInfo);

    smartStore.smartUpdate({
      connectedWallets: newConnectedWallets,
      wallets: newConnectedWallets, // Keep alias synchronized
    });

    // Update primary wallet state if this is the first connection
    if (!state.isConnected) {
      smartStore.smartUpdate({
        isConnected: true,
        address: walletInfo.address,
        chainUID: chainUID,
        walletType: walletInfo.walletType,
        balances: [...walletInfo.balances],
      });
    }

    // Persist to IndexedDB
    walletStorage.setConnectedWallets(newConnectedWallets).catch(error => {
      console.warn('Failed to persist wallet connections:', error);
    });
  },

  removeWallet(chainUID: string) {
    const newConnectedWallets = new Map(state.connectedWallets);
    newConnectedWallets.delete(chainUID);

    smartStore.smartUpdate({
      connectedWallets: newConnectedWallets,
      wallets: newConnectedWallets, // Keep alias synchronized
    });

    // Update primary wallet state if we removed the current primary
    if (state.chainUID === chainUID) {
      const remaining = Array.from(newConnectedWallets.values());
      if (remaining.length > 0) {
        const newPrimary = remaining[0];
        smartStore.smartUpdate({
          address: newPrimary.address,
          chainUID: newPrimary.chainUID,
          walletType: newPrimary.walletType,
          balances: [...newPrimary.balances],
        });
      } else {
        smartStore.smartUpdate({
          isConnected: false,
          address: null,
          chainUID: null,
          walletType: null,
          balances: [],
        });
      }
    }

    // Persist to IndexedDB
    walletStorage.setConnectedWallets(newConnectedWallets).catch(error => {
      console.warn('Failed to persist wallet connections:', error);
    });
  },

  updateWalletBalances(chainUID: string, balances: UserBalance[]) {
    const wallet = state.connectedWallets.get(chainUID);
    if (wallet) {
      const updatedWallet = { ...wallet, balances: [...balances] };
      const newConnectedWallets = new Map(state.connectedWallets);
      newConnectedWallets.set(chainUID, updatedWallet);

      smartStore.smartUpdate({
        connectedWallets: newConnectedWallets,
        wallets: newConnectedWallets, // Keep alias synchronized
      });

      // Update primary state if this is the current primary wallet
      if (state.chainUID === chainUID) {
        smartStore.smartUpdate({
          balances: [...balances],
        });
      }

      // Persist to IndexedDB
      walletStorage.setConnectedWallets(newConnectedWallets).catch(error => {
        console.warn('Failed to persist wallet connections:', error);
      });
    }
  },
};

// Getters
const getters = {
  getBalance: (tokenId: string) => {
    return state.balances.find(balance => balance.token === tokenId);
  },

  getFormattedBalance: (tokenId: string, decimals: number = 18) => {
    const balance = getters.getBalance(tokenId);
    if (!balance) return '0';

    try {
      const value = BigInt(balance.balance);
      const divisor = BigInt(10 ** decimals);
      const beforeDecimal = value / divisor;
      const afterDecimal = value % divisor;

      return `${beforeDecimal.toString()}.${afterDecimal.toString().padStart(decimals, '0')}`;
    } catch {
      return '0';
    }
  },

  hasSufficientBalance: (tokenIdOrChainUID: string, amountOrTokenId?: string, amountParam?: string) => {
    // Support both signatures:
    // hasSufficientBalance(tokenId, amount) - 2 params
    // hasSufficientBalance(chainUID, tokenId, amount) - 3 params
    if (typeof amountParam === 'string' && amountOrTokenId && amountParam) {
      // 3-parameter version: chainUID, tokenId, amount
      const chainUID = tokenIdOrChainUID;
      const tokenId = amountOrTokenId;
      const amount = amountParam;

      const wallet = state.connectedWallets.get(chainUID);
      if (!wallet) return false;

      const balance = wallet.balances.find(b => b.token === tokenId);
      if (!balance) return false;

      try {
        return BigInt(balance.balance) >= BigInt(amount);
      } catch {
        return false;
      }
    } else {
      // 2-parameter version: tokenId, amount
      const tokenId = tokenIdOrChainUID;
      const amount = amountOrTokenId || '';

      const balance = getters.getBalance(tokenId);
      if (!balance) return false;

      try {
        return BigInt(balance.balance) >= BigInt(amount);
      } catch {
        return false;
      }
    }
  },  isWalletAvailable: (walletType: 'metamask' | 'keplr' | 'phantom') => {
    try {
      const adapter = walletAdapterFactory.getAdapter(walletType);
      return adapter.isAvailable();
    } catch {
      return false;
    }
  },

  getAvailableWallets: () => {
    return walletAdapterFactory.getAvailableWalletTypes();
  },

  // Multi-wallet getters
  isWalletConnected: (chainUID: string) => {
    const wallet = state.connectedWallets.get(chainUID);
    return wallet ? wallet.isConnected : false;
  },

  getAllConnectedWallets: () => {
    return Array.from(state.connectedWallets.values()).filter(wallet => wallet.isConnected);
  },

  getWalletBalance: (chainUID: string, tokenSymbol: string) => {
    const wallet = state.connectedWallets.get(chainUID);
    if (!wallet) return null;

    return wallet.balances.find(balance =>
      balance.token === tokenSymbol ||
      balance.token.toLowerCase() === tokenSymbol.toLowerCase()
    );
  },

  // Additional method for getting wallet by chain
  getWallet: (chainUID: string) => {
    return state.connectedWallets.get(chainUID) || null;
  },

  // Method for adding transaction records (placeholder)
  addTransaction: (chainUID: string, transaction: { txHash: string; timestamp?: number; type?: string }) => {
    // This would typically store transaction history
    // For now, just log it
    console.log(`Transaction added for ${chainUID}:`, transaction);
  },

  // Method for updating transaction status
  updateTransactionStatus: (chainUID: string, txHash: string, status: 'pending' | 'confirmed' | 'failed') => {
    // This would typically update stored transaction history
    console.log(`Transaction ${txHash} on ${chainUID} updated to status: ${status}`);
  },
};

// Proper store type definition extending BaseStore
export interface WalletStore extends BaseStore<ExtendedWalletState> {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  connectWallet: (walletType: 'metamask' | 'keplr' | 'phantom', chainId?: string) => Promise<void>;
  disconnectWallet: (chainUID?: string) => Promise<void>;
  setBalances: (balances: UserBalance[]) => void;
  updateBalance: (tokenId: string, balance: string) => void;
  switchChain: (chainId: string) => Promise<void>;
  clear: () => void;
  initialize: () => void;
  addWallet: (chainUID: string, walletInfo: Omit<WalletInfo, 'chainUID'>) => void;
  removeWallet: (chainUID: string) => void;
  updateWalletBalances: (chainUID: string, balances: UserBalance[]) => void;
  getBalance: (tokenId: string) => UserBalance | undefined;
  getFormattedBalance: (tokenId: string, decimals?: number) => string;
  hasSufficientBalance: (tokenIdOrChainUID: string, amountOrTokenId?: string, amountParam?: string) => boolean;
  isWalletAvailable: (walletType: 'metamask' | 'keplr' | 'phantom') => boolean;
  getAvailableWallets: () => ('metamask' | 'keplr' | 'phantom')[];
  isWalletConnected: (chainUID: string) => boolean;
  getAllConnectedWallets: () => WalletInfo[];
  getWalletBalance: (chainUID: string, tokenSymbol: string) => UserBalance | null;
  getWallet: (chainUID: string) => WalletInfo | null;
  addTransaction: (chainUID: string, transaction: { txHash: string; timestamp?: number; type?: string }) => void;
  updateTransactionStatus: (chainUID: string, txHash: string, status: 'pending' | 'confirmed' | 'failed') => void;
}

export const walletStore: WalletStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { WalletState };
