import type { BaseStore } from './types';
export interface AppState {
    walletModalOpen: boolean;
    walletModalFilter: string | null;
    tokenModalOpen: boolean;
    tokenSelectorType: 'input' | 'output' | null;
    isInitialized: boolean;
    theme: 'light' | 'dark' | 'auto';
}
export interface AppStore extends BaseStore<AppState> {
    initialize: () => void;
    openWalletModal: (chainFilter?: string) => void;
    closeWalletModal: () => void;
    openTokenModal: (selectorType?: 'input' | 'output') => void;
    closeTokenModal: () => void;
    setTheme: (theme: AppState['theme']) => void;
    clear: () => void;
}
export declare const appStore: AppStore;
//# sourceMappingURL=app.store.d.ts.map