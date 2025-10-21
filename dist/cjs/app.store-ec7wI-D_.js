'use strict';

var wallet_store = require('./wallet.store-COVLdx-V.js');

const initialState = {
    walletModalOpen: false,
    walletModalFilter: null,
    tokenModalOpen: false,
    tokenSelectorType: null,
    isInitialized: false,
    theme: 'auto',
};
const { state, onChange, reset, dispose } = wallet_store.createStore(initialState);
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
const appStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
};

exports.appStore = appStore;
//# sourceMappingURL=app.store-ec7wI-D_.js.map

//# sourceMappingURL=app.store-ec7wI-D_.js.map