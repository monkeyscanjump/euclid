import { createStore } from '@stencil/store';
import type { AppState } from '../utils/types';

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

export const appStore: any = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
};

export type { AppState };
