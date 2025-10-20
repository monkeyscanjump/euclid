import { createStore } from '@stencil/store';
import type { AppState } from '../utils/types';
import type { BaseStore } from './types';

const initialState: AppState = {
  walletModalOpen: false,
  walletModalFilter: null,
  tokenModalOpen: false,
  isInitialized: false,
  theme: 'auto',
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  initialize() {
    state.isInitialized = true;
  },

  openWalletModal(chainFilter?: string) {
    state.walletModalOpen = true;
    state.walletModalFilter = chainFilter || null;
  },

  closeWalletModal() {
    state.walletModalOpen = false;
    state.walletModalFilter = null;
  },

  openTokenModal() {
    state.tokenModalOpen = true;
  },

  closeTokenModal() {
    state.tokenModalOpen = false;
  },

  setTheme(theme: AppState['theme']) {
    state.theme = theme;
  },

  clear() {
    reset();
  },
};

// Proper store type definition extending BaseStore
export interface AppStore extends BaseStore<AppState> {
  initialize: () => void;
  openWalletModal: (chainFilter?: string) => void;
  closeWalletModal: () => void;
  openTokenModal: () => void;
  closeTokenModal: () => void;
  setTheme: (theme: AppState['theme']) => void;
  clear: () => void;
}

export const appStore: AppStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
};

export type { AppState };
