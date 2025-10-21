import type { WalletState, WalletInfo } from '../utils/types/euclid-api.types';
import type { UserBalance } from '../utils/types/api.types';
import type { BaseStore } from './types';
interface ExtendedWalletState extends WalletState {
    connectedWallets: Map<string, WalletInfo>;
    wallets: Map<string, WalletInfo>;
}
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
    addTransaction: (chainUID: string, transaction: {
        txHash: string;
        timestamp?: number;
        type?: string;
    }) => void;
    updateTransactionStatus: (chainUID: string, txHash: string, status: 'pending' | 'confirmed' | 'failed') => void;
}
export declare const walletStore: WalletStore;
export type { WalletState };
//# sourceMappingURL=wallet.store.d.ts.map