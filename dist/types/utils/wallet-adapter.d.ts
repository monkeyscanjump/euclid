/**
 * Wallet Adapter Utility
 *
 * Abstracts the actual connection logic for different wallet types.
 * Used by euclid-wallet-controller to maintain separation of concerns.
 */
import type { EuclidChainConfig } from './types/api.types';
export type WalletType = 'keplr' | 'metamask' | 'phantom' | 'cosmostation' | 'walletconnect' | 'other';
declare global {
    interface Window {
        keplr?: {
            enable: (chainId: string) => Promise<void>;
            experimentalSuggestChain: (chainInfo: unknown) => Promise<void>;
            getOfflineSigner: (chainId: string) => {
                getAccounts: () => Promise<Array<{
                    address: string;
                }>>;
            };
            getKey: (chainId: string) => Promise<{
                bech32Address: string;
            }>;
        };
        ethereum?: {
            isMetaMask?: boolean;
            request: (args: {
                method: string;
                params?: unknown[];
            }) => Promise<unknown>;
        };
        cosmostation?: {
            cosmos: {
                request: (args: {
                    method: string;
                    params: unknown;
                }) => Promise<unknown>;
            };
        };
        solana?: {
            isPhantom?: boolean;
            connect: () => Promise<{
                publicKey: {
                    toString: () => string;
                };
            }>;
            disconnect: () => Promise<void>;
        };
    }
}
export interface WalletConnectionResult {
    success: boolean;
    address?: string;
    chainId?: string;
    error?: string;
}
export interface WalletAdapter {
    isInstalled(): boolean;
    connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    disconnect(chainUID: string): Promise<void>;
    getAddress(chainUID: string): Promise<string | null>;
    switchChain(chainConfig: EuclidChainConfig): Promise<boolean>;
}
export declare class KeplrAdapter implements WalletAdapter {
    private get keplr();
    isInstalled(): boolean;
    connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    disconnect(chainUID: string): Promise<void>;
    getAddress(chainUID: string): Promise<string | null>;
    switchChain(chainConfig: EuclidChainConfig): Promise<boolean>;
    private getAddressPrefix;
}
export declare class MetaMaskAdapter implements WalletAdapter {
    private get ethereum();
    isInstalled(): boolean;
    connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    disconnect(_chainUID: string): Promise<void>;
    getAddress(_chainUID: string): Promise<string | null>;
    switchChain(chainConfig: EuclidChainConfig): Promise<boolean>;
}
export declare class CosmostationAdapter implements WalletAdapter {
    private get cosmostation();
    isInstalled(): boolean;
    connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    disconnect(chainUID: string): Promise<void>;
    getAddress(chainUID: string): Promise<string | null>;
    switchChain(_chainConfig: EuclidChainConfig): Promise<boolean>;
}
export declare class PhantomAdapter implements WalletAdapter {
    private get phantom();
    isInstalled(): boolean;
    connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    disconnect(_chainUID: string): Promise<void>;
    getAddress(_chainUID: string): Promise<string | null>;
    switchChain(chainConfig: EuclidChainConfig): Promise<boolean>;
}
export declare class WalletAdapterFactory {
    private static adapters;
    static getAdapter(walletType: WalletType): WalletAdapter | null;
    static getAvailableWallets(): Array<{
        type: WalletType;
        installed: boolean;
    }>;
    static connectWallet(walletType: WalletType, chainConfig: EuclidChainConfig): Promise<WalletConnectionResult>;
    static disconnectWallet(walletType: WalletType, chainUID: string): Promise<void>;
}
//# sourceMappingURL=wallet-adapter.d.ts.map