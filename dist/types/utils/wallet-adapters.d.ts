/**
 * Wallet Adapters for Euclid Protocol
 * Unified interface for different wallet providers
 */
import type { WalletAdapter } from './types/euclid-api.types';
import type { EuclidChainConfig, TransactionResponse } from './types/api.types';
/**
 * MetaMask wallet adapter for EVM chains
 */
export declare class MetaMaskAdapter implements WalletAdapter {
    type: "metamask";
    isAvailable(): boolean;
    connect(chainId?: string): Promise<{
        address: string;
        chainId: string;
    }>;
    disconnect(): Promise<void>;
    getBalance(address: string): Promise<string>;
    signAndBroadcast(transaction: TransactionResponse): Promise<string>;
    switchChain(chainId: string): Promise<void>;
    addChain(config: EuclidChainConfig): Promise<void>;
}
/**
 * Keplr wallet adapter for Cosmos chains
 */
export declare class KeplrAdapter implements WalletAdapter {
    type: "keplr";
    isAvailable(): boolean;
    connect(chainId?: string): Promise<{
        address: string;
        chainId: string;
    }>;
    disconnect(): Promise<void>;
    getBalance(_address: string): Promise<string>;
    signAndBroadcast(transaction: TransactionResponse): Promise<string>;
    switchChain(chainId: string): Promise<void>;
    addChain(config: EuclidChainConfig): Promise<void>;
}
/**
 * Phantom wallet adapter for Solana chains
 */
export declare class PhantomAdapter implements WalletAdapter {
    type: "phantom";
    isAvailable(): boolean;
    connect(chainId?: string): Promise<{
        address: string;
        chainId: string;
    }>;
    disconnect(): Promise<void>;
    getBalance(_address: string): Promise<string>;
    signAndBroadcast(_transaction: TransactionResponse): Promise<string>;
    switchChain(chainId: string): Promise<void>;
    addChain(_config: EuclidChainConfig): Promise<void>;
}
/**
 * Wallet adapter factory
 */
export declare class WalletAdapterFactory {
    private adapters;
    constructor();
    getAdapter(type: 'metamask' | 'keplr' | 'phantom'): WalletAdapter;
    getAvailableAdapters(): WalletAdapter[];
    getAvailableWalletTypes(): ('metamask' | 'keplr' | 'phantom')[];
}
export declare const walletAdapterFactory: WalletAdapterFactory;
//# sourceMappingURL=wallet-adapters.d.ts.map