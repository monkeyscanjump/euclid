import { createStore } from '@stencil/store';
import type { BaseStore } from './types';

export interface AppState {
  walletModalOpen: boolean;
  walletModalFilter: string | null;
  tokenModalOpen: boolean;
  tokenSelectorType: 'input' | 'output' | null;
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const initialState: AppState = {
  walletModalOpen: false,
  walletModalFilter: null,
  tokenModalOpen: false,
  tokenSelectorType: null,
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

  openTokenModal(selectorType: 'input' | 'output' = 'input') {
    state.tokenModalOpen = true;
    state.tokenSelectorType = selectorType;
  },

  closeTokenModal() {
    state.tokenModalOpen = false;
    state.tokenSelectorType = null;
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
  openTokenModal: (selectorType?: 'input' | 'output') => void;
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
