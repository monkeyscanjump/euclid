/**
 * Wallet Adapter Utility
 *
 * Abstracts the actual connection logic for different wallet types.
 * Used by euclid-wallet-controller to maintain separation of concerns.
 */

import type { EuclidChainConfig } from './types/api.types';

export type WalletType = 'keplr' | 'metamask' | 'phantom' | 'cosmostation' | 'walletconnect' | 'other';

// Declare global window extensions for wallets
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      experimentalSuggestChain: (chainInfo: unknown) => Promise<void>;
      getOfflineSigner: (chainId: string) => {
        getAccounts: () => Promise<Array<{ address: string }>>;
      };
      getKey: (chainId: string) => Promise<{ bech32Address: string }>;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    cosmostation?: {
      cosmos: {
        request: (args: { method: string; params: unknown }) => Promise<unknown>;
      };
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
  }
}export interface WalletConnectionResult {
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

// Keplr Wallet Adapter
export class KeplrAdapter implements WalletAdapter {
  private get keplr() {
    return window.keplr;
  }

  isInstalled(): boolean {
    return !!window.keplr;
  }

  async connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'Keplr wallet not installed' };
      }

      // Suggest chain if not already added
      if (chainConfig.type === 'Cosmwasm') {
        try {
          await this.keplr.experimentalSuggestChain({
            chainId: chainConfig.chain_id,
            chainName: chainConfig.display_name,
            rpc: 'https://rpc.cosmos.network', // Default RPC
            rest: 'https://api.cosmos.network', // Default REST
            bip44: { coinType: 118 },
            bech32Config: {
              bech32PrefixAccAddr: this.getAddressPrefix(chainConfig.chain_id),
              bech32PrefixAccPub: this.getAddressPrefix(chainConfig.chain_id) + 'pub',
              bech32PrefixValAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valoper',
              bech32PrefixValPub: this.getAddressPrefix(chainConfig.chain_id) + 'valoperpub',
              bech32PrefixConsAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valcons',
              bech32PrefixConsPub: this.getAddressPrefix(chainConfig.chain_id) + 'valconspub'
            },
            currencies: [{
              coinDenom: 'ATOM', // Default
              coinMinimalDenom: 'uatom',
              coinDecimals: 6,
            }],
            feeCurrencies: [{
              coinDenom: 'ATOM', // Default
              coinMinimalDenom: 'uatom',
              coinDecimals: 6,
            }],
            stakeCurrency: {
              coinDenom: 'ATOM', // Default
              coinMinimalDenom: 'uatom',
              coinDecimals: 6,
            }
          });
        } catch (suggestError) {
          console.warn('Failed to suggest chain to Keplr:', suggestError);
        }
      }

      // Enable the chain
      await this.keplr.enable(chainConfig.chain_id);

      // Get the offline signer and accounts
      const offlineSigner = this.keplr.getOfflineSigner(chainConfig.chain_id);
      const accounts = await (offlineSigner as { getAccounts: () => Promise<Array<{ address: string }>> }).getAccounts();

      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      return {
        success: true,
        address: accounts[0].address,
        chainId: chainConfig.chain_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Keplr',
      };
    }
  }

  async disconnect(chainUID: string): Promise<void> {
    // Keplr doesn't have a programmatic disconnect method
    // The user needs to disconnect from the Keplr extension directly
    console.log('Keplr disconnect requested for:', chainUID);
  }

  async getAddress(chainUID: string): Promise<string | null> {
    try {
      if (!this.isInstalled()) return null;

      // Use Keplr's getKey method to get the address
      const key = await (this.keplr as unknown as { getKey: (chainId: string) => Promise<{ bech32Address: string }> }).getKey(chainUID);
      return key.bech32Address;
    } catch {
      return null;
    }
  }

  async switchChain(chainConfig: EuclidChainConfig): Promise<boolean> {
    try {
      await this.keplr.enable(chainConfig.chain_id);
      return true;
    } catch {
      return false;
    }
  }

  private getAddressPrefix(chainId: string): string {
    // Common Cosmos chain prefixes
    const prefixes: Record<string, string> = {
      'cosmoshub-4': 'cosmos',
      'osmosis-1': 'osmo',
      'juno-1': 'juno',
      'stargaze-1': 'stars',
    };
    return prefixes[chainId] || 'cosmos';
  }
}

// MetaMask Wallet Adapter
export class MetaMaskAdapter implements WalletAdapter {
  private get ethereum() {
    return window.ethereum;
  }

  isInstalled(): boolean {
    return !!window.ethereum && window.ethereum.isMetaMask;
  }

  async connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'MetaMask not installed' };
      }

      if (chainConfig.type !== 'EVM') {
        return { success: false, error: 'MetaMask only supports EVM chains' };
      }

      // Request account access
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!Array.isArray(accounts) || accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      // Switch to or add the correct network
      const switched = await this.switchChain(chainConfig);
      if (!switched) {
        return { success: false, error: 'Failed to switch network' };
      }

      return {
        success: true,
        address: accounts[0],
        chainId: chainConfig.chain_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MetaMask',
      };
    }
  }

  async disconnect(_chainUID: string): Promise<void> {
    // MetaMask doesn't have a programmatic disconnect method
    // The connection persists until the user disconnects from MetaMask directly
    // Parameter kept for interface consistency but not used in MetaMask
  }

  async getAddress(_chainUID: string): Promise<string | null> {
    try {
      if (!this.isInstalled()) return null;

      const accounts = await this.ethereum.request({
        method: 'eth_accounts'
      });
      return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  async switchChain(chainConfig: EuclidChainConfig): Promise<boolean> {
    try {
      const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;

      // Try to switch to the chain
      try {
        await this.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        return true;
      } catch (switchError: unknown) {
        // Chain not added to MetaMask, try to add it
        if ((switchError as { code?: number }).code === 4902) {
          await this.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: chainConfig.display_name,
              rpcUrls: ['https://rpc.example.com'], // Default RPC
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: chainConfig.explorer_url ? [chainConfig.explorer_url] : [],
            }],
          });
          return true;
        }
        throw switchError;
      }
    } catch {
      return false;
    }
  }
}

// Cosmostation Adapter (similar to Keplr but for Cosmostation wallet)
export class CosmostationAdapter implements WalletAdapter {
  private get cosmostation() {
    return window.cosmostation;
  }

  isInstalled(): boolean {
    return !!window.cosmostation;
  }

  async connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'Cosmostation wallet not installed' };
      }

      if (chainConfig.type !== 'Cosmwasm') {
        return { success: false, error: 'Cosmostation only supports Cosmos chains' };
      }

      const account = await this.cosmostation.cosmos.request({
        method: 'cos_requestAccount',
        params: { chainName: chainConfig.chain_id },
      });

      return {
        success: true,
        address: (account as {address: string}).address,
        chainId: chainConfig.chain_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Cosmostation',
      };
    }
  }

  async disconnect(chainUID: string): Promise<void> {
    console.log('Cosmostation disconnect requested for:', chainUID);
  }

  async getAddress(chainUID: string): Promise<string | null> {
    try {
      if (!this.isInstalled()) return null;

      const account = await this.cosmostation.cosmos.request({
        method: 'cos_account',
        params: { chainName: chainUID },
      });
      return (account as {address?: string})?.address || null;
    } catch {
      return null;
    }
  }

  async switchChain(_chainConfig: EuclidChainConfig): Promise<boolean> {
    // Cosmostation handles chain switching automatically
    return true;
  }
}

// Phantom Wallet Adapter
export class PhantomAdapter implements WalletAdapter {
  private get phantom() {
    return (window as { phantom?: { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } } }).phantom?.ethereum;
  }

  isInstalled(): boolean {
    return !!this.phantom;
  }

  async connect(chainConfig: EuclidChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'Phantom wallet not installed' };
      }

      if (chainConfig.type !== 'EVM') {
        return { success: false, error: 'Phantom only supports EVM chains' };
      }

      // Request account access
      const accounts = await this.phantom.request({
        method: 'eth_requestAccounts'
      });

      if (!Array.isArray(accounts) || accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      return {
        success: true,
        address: accounts[0],
        chainId: chainConfig.chain_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Phantom',
      };
    }
  }

  async disconnect(_chainUID: string): Promise<void> {
    // Phantom doesn't have a programmatic disconnect method
  }

  async getAddress(_chainUID: string): Promise<string | null> {
    try {
      if (!this.isInstalled()) return null;

      const accounts = await this.phantom.request({
        method: 'eth_accounts'
      });
      return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  async switchChain(chainConfig: EuclidChainConfig): Promise<boolean> {
    try {
      const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;

      await this.phantom.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Wallet Adapter Factory
export class WalletAdapterFactory {
  private static adapters: Map<WalletType, WalletAdapter> = new Map();

  static {
    this.adapters.set('keplr', new KeplrAdapter());
    this.adapters.set('metamask', new MetaMaskAdapter());
    this.adapters.set('phantom', new PhantomAdapter());
    this.adapters.set('cosmostation', new CosmostationAdapter());
  }

  static getAdapter(walletType: WalletType): WalletAdapter | null {
    return this.adapters.get(walletType) || null;
  }

  static getAvailableWallets(): Array<{ type: WalletType; installed: boolean }> {
    return Array.from(this.adapters.entries()).map(([type, adapter]) => ({
      type,
      installed: adapter.isInstalled(),
    }));
  }

  static async connectWallet(
    walletType: WalletType,
    chainConfig: EuclidChainConfig
  ): Promise<WalletConnectionResult> {
    const adapter = this.getAdapter(walletType);
    if (!adapter) {
      return { success: false, error: `Adapter not found for ${walletType}` };
    }

    return adapter.connect(chainConfig);
  }

  static async disconnectWallet(walletType: WalletType, chainUID: string): Promise<void> {
    const adapter = this.getAdapter(walletType);
    if (adapter) {
      await adapter.disconnect(chainUID);
    }
  }
}
