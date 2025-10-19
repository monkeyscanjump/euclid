import { createStore } from '@stencil/store';
import type { WalletState, WalletInfo } from '../utils/types';

const initialState: WalletState = {
  wallets: new Map<string, WalletInfo>(),
  isInitialized: false,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  initialize() {
    state.isInitialized = true;
  },

  addWallet(chainUID: string, walletInfo: WalletInfo) {
    state.wallets = new Map(state.wallets.set(chainUID, walletInfo));
  },

  removeWallet(chainUID: string) {
    const newWallets = new Map(state.wallets);
    newWallets.delete(chainUID);
    state.wallets = newWallets;
  },

  updateWalletBalances(chainUID: string, balances: WalletInfo['balances']) {
    const wallet = state.wallets.get(chainUID);
    if (wallet) {
      const updatedWallet = { ...wallet, balances };
      state.wallets = new Map(state.wallets.set(chainUID, updatedWallet));
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

  getWalletBalance: (chainUID: string, tokenId: string) => {
    const wallet = state.wallets.get(chainUID);
    return wallet?.balances.find(balance => balance.tokenId === tokenId);
  },
};

export const walletStore: any = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { WalletState, WalletInfo };