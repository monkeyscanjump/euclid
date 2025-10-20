import { createStore } from '@stencil/store';
import type { WalletInfo } from '../utils/types';
import type {
  UserBalance,
  UserTransaction,
  LiquidityPosition
} from '../utils/types';

// Enhanced wallet state for Address Book pattern
export interface EnhancedWalletState {
  wallets: Map<string, WalletInfo>; // chainUID -> WalletInfo
  balances: Map<string, UserBalance[]>; // walletKey -> UserBalance[]
  liquidityPositions: Map<string, LiquidityPosition[]>; // walletKey -> LiquidityPosition[]
  transactions: Map<string, UserTransaction[]>; // walletKey -> UserTransaction[]
  isInitialized: boolean;
  isLoading: boolean;
  lastUpdated: Map<string, number>; // walletKey -> timestamp
  error: string | null;
}

const initialState: EnhancedWalletState = {
  wallets: new Map<string, WalletInfo>(),
  balances: new Map<string, UserBalance[]>(),
  liquidityPositions: new Map<string, LiquidityPosition[]>(),
  transactions: new Map<string, UserTransaction[]>(),
  isInitialized: false,
  isLoading: false,
  lastUpdated: new Map<string, number>(),
  error: null,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Helper function to create wallet key
const createWalletKey = (chainUID: string, address: string): string => `${chainUID}:${address}`;

// Actions
const actions = {
  initialize() {
    state.isInitialized = true;
  },

  setLoading(loading: boolean) {
    state.isLoading = loading;
  },

  setError(error: string | null) {
    state.error = error;
  },

  // Wallet management (Address Book pattern)
  addWallet(chainUID: string, walletInfo: WalletInfo) {
    state.wallets = new Map(state.wallets.set(chainUID, walletInfo));

    // Initialize empty data maps for this wallet
    const walletKey = createWalletKey(chainUID, walletInfo.address);
    state.balances = new Map(state.balances.set(walletKey, []));
    state.liquidityPositions = new Map(state.liquidityPositions.set(walletKey, []));
    state.transactions = new Map(state.transactions.set(walletKey, []));
    state.lastUpdated = new Map(state.lastUpdated.set(walletKey, Date.now()));
  },

  removeWallet(chainUID: string) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const walletKey = createWalletKey(chainUID, wallet.address);

      // Remove wallet and all associated data
      const newWallets = new Map(state.wallets);
      const newBalances = new Map(state.balances);
      const newPositions = new Map(state.liquidityPositions);
      const newTransactions = new Map(state.transactions);
      const newLastUpdated = new Map(state.lastUpdated);

      newWallets.delete(chainUID);
      newBalances.delete(walletKey);
      newPositions.delete(walletKey);
      newTransactions.delete(walletKey);
      newLastUpdated.delete(walletKey);

      state.wallets = newWallets;
      state.balances = newBalances;
      state.liquidityPositions = newPositions;
      state.transactions = newTransactions;
      state.lastUpdated = newLastUpdated;
    }
  },

  updateWalletBalances(chainUID: string, balances: UserBalance[]) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const walletKey = createWalletKey(chainUID, wallet.address);
      state.balances = new Map(state.balances.set(walletKey, [...balances]));
      state.lastUpdated = new Map(state.lastUpdated.set(walletKey, Date.now()));
    }
  },

  updateWalletPositions(chainUID: string, positions: LiquidityPosition[]) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const walletKey = createWalletKey(chainUID, wallet.address);
      state.liquidityPositions = new Map(state.liquidityPositions.set(walletKey, [...positions]));
      state.lastUpdated = new Map(state.lastUpdated.set(walletKey, Date.now()));
    }
  },

  addTransaction(chainUID: string, transaction: UserTransaction) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const walletKey = createWalletKey(chainUID, wallet.address);
      const currentTransactions = state.transactions.get(walletKey) || [];
      const updatedTransactions = [transaction, ...currentTransactions];
      state.transactions = new Map(state.transactions.set(walletKey, updatedTransactions));
      state.lastUpdated = new Map(state.lastUpdated.set(walletKey, Date.now()));
    }
  },

  updateTransactionStatus(chainUID: string, txHash: string, status: UserTransaction['status']) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const walletKey = createWalletKey(chainUID, wallet.address);
      const transactions = state.transactions.get(walletKey) || [];
      const updatedTransactions = transactions.map(tx =>
        tx.txHash === txHash ? { ...tx, status } : tx
      );
      state.transactions = new Map(state.transactions.set(walletKey, updatedTransactions));
      state.lastUpdated = new Map(state.lastUpdated.set(walletKey, Date.now()));
    }
  },

  disconnectWallet(chainUID: string) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const disconnectedWallet = { ...wallet, isConnected: false };
      state.wallets = new Map(state.wallets.set(chainUID, disconnectedWallet));
    }
  },

  clear() {
    reset();
  },
};

// Getters
const getters = {
  getWallet: (chainUID: string) => state.wallets.get(chainUID),

  isWalletConnected: (chainUID: string) => {
    const wallet = state.wallets.get(chainUID);
    return wallet?.isConnected ?? false;
  },

  getAllConnectedWallets: () => {
    return Array.from(state.wallets.values()).filter(wallet => wallet.isConnected);
  },

  getWalletBalances: (chainUID: string) => {
    const wallet = state.wallets.get(chainUID);
    if (!wallet) return [];

    const walletKey = createWalletKey(chainUID, wallet.address);
    return state.balances.get(walletKey) || [];
  },

  getWalletBalance: (chainUID: string, tokenId: string) => {
    const balances = getters.getWalletBalances(chainUID);
    return balances.find(balance => balance.tokenId === tokenId);
  },

  getWalletPositions: (chainUID: string) => {
    const wallet = state.wallets.get(chainUID);
    if (!wallet) return [];

    const walletKey = createWalletKey(chainUID, wallet.address);
    return state.liquidityPositions.get(walletKey) || [];
  },

  getWalletTransactions: (chainUID: string) => {
    const wallet = state.wallets.get(chainUID);
    if (!wallet) return [];

    const walletKey = createWalletKey(chainUID, wallet.address);
    return state.transactions.get(walletKey) || [];
  },

  getAllBalances: () => {
    const allBalances: UserBalance[] = [];
    state.balances.forEach(balances => {
      allBalances.push(...balances);
    });
    return allBalances;
  },

  getAllPositions: () => {
    const allPositions: LiquidityPosition[] = [];
    state.liquidityPositions.forEach(positions => {
      allPositions.push(...positions);
    });
    return allPositions;
  },

  getTotalPortfolioValue: () => {
    // Simplified calculation - in production would need market data
    const allBalances = getters.getAllBalances();
    return allBalances.reduce((total, balance) => {
      try {
        return (BigInt(total) + BigInt(balance.amount)).toString();
      } catch {
        return total;
      }
    }, '0');
  },

  hasSufficientBalance: (chainUID: string, tokenId: string, amount: string) => {
    const balance = getters.getWalletBalance(chainUID, tokenId);
    if (!balance) return false;

    try {
      return BigInt(balance.amount) >= BigInt(amount);
    } catch {
      return false;
    }
  },

  isDataStale: (chainUID: string, maxAge: number = 5 * 60 * 1000) => {
    const wallet = state.wallets.get(chainUID);
    if (!wallet) return true;

    const walletKey = createWalletKey(chainUID, wallet.address);
    const lastUpdate = state.lastUpdated.get(walletKey);
    if (!lastUpdate) return true;

    return Date.now() - lastUpdate > maxAge;
  },
};

// Proper store type definition
export interface WalletStore {
  state: EnhancedWalletState;
  onChange: typeof onChange;
  reset: typeof reset;
  dispose: typeof dispose;
  initialize: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addWallet: (chainUID: string, walletInfo: WalletInfo) => void;
  removeWallet: (chainUID: string) => void;
  updateWalletBalances: (chainUID: string, balances: UserBalance[]) => void;
  updateWalletPositions: (chainUID: string, positions: LiquidityPosition[]) => void;
  addTransaction: (chainUID: string, transaction: UserTransaction) => void;
  updateTransactionStatus: (chainUID: string, txHash: string, status: UserTransaction['status']) => void;
  disconnectWallet: (chainUID: string) => void;
  clear: () => void;
  getWallet: (chainUID: string) => WalletInfo | undefined;
  isWalletConnected: (chainUID: string) => boolean;
  getAllConnectedWallets: () => WalletInfo[];
  getWalletBalances: (chainUID: string) => UserBalance[];
  getWalletBalance: (chainUID: string, tokenId: string) => UserBalance | undefined;
  getWalletPositions: (chainUID: string) => LiquidityPosition[];
  getWalletTransactions: (chainUID: string) => UserTransaction[];
  getAllBalances: () => UserBalance[];
  getAllPositions: () => LiquidityPosition[];
  getTotalPortfolioValue: () => string;
  hasSufficientBalance: (chainUID: string, tokenId: string, amount: string) => boolean;
  isDataStale: (chainUID: string, maxAge?: number) => boolean;
}

export const walletStore: WalletStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { EnhancedWalletState as WalletState, WalletInfo };
