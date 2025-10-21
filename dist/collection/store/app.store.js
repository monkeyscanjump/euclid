import { createStore } from "@stencil/store";
const initialState = {
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
    openWalletModal(chainFilter) {
        state.walletModalOpen = true;
        state.walletModalFilter = chainFilter || null;
    },
    closeWalletModal() {
        state.walletModalOpen = false;
        state.walletModalFilter = null;
    },
    openTokenModal(selectorType = 'input') {
        state.tokenModalOpen = true;
        state.tokenSelectorType = selectorType;
    },
    closeTokenModal() {
        state.tokenModalOpen = false;
        state.tokenSelectorType = null;
    },
    setTheme(theme) {
        state.theme = theme;
    },
    clear() {
        reset();
    },
};
export const appStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
};
//# sourceMappingURL=app.store.js.map
