/**
 * Wallet Adapter Utility
 *
 * Abstracts the actual connection logic for different wallet types.
 * Used by euclid-wallet-controller to maintain separation of concerns.
 */

import type { ChainConfig } from './types';

export type WalletType = 'keplr' | 'metamask' | 'cosmostation' | 'walletconnect' | 'other';

// Declare global window extensions for wallets
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      experimentalSuggestChain: (chainInfo: unknown) => Promise<void>;
      getOfflineSigner: (chainId: string) => { getAccounts: () => Promise<Array<{ address: string }>> };
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
  }
}export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  chainId?: string;
  error?: string;
}

export interface WalletAdapter {
  isInstalled(): boolean;
  connect(chainConfig: ChainConfig): Promise<WalletConnectionResult>;
  disconnect(chainUID: string): Promise<void>;
  getAddress(chainUID: string): Promise<string | null>;
  switchChain(chainConfig: ChainConfig): Promise<boolean>;
}

// Keplr Wallet Adapter
export class KeplrAdapter implements WalletAdapter {
  private get keplr() {
    return window.keplr;
  }

  isInstalled(): boolean {
    return !!window.keplr;
  }

  async connect(chainConfig: ChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'Keplr wallet not installed' };
      }

      // Suggest chain if not already added
      if (chainConfig.type === 'cosmos') {
        try {
          await this.keplr.experimentalSuggestChain({
            chainId: chainConfig.chainId,
            chainName: chainConfig.displayName,
            rpc: chainConfig.rpcUrl,
            rest: chainConfig.restUrl,
            bip44: { coinType: 118 },
            bech32Config: {
              bech32PrefixAccAddr: this.getAddressPrefix(chainConfig.chainId),
              bech32PrefixAccPub: this.getAddressPrefix(chainConfig.chainId) + 'pub',
              bech32PrefixValAddr: this.getAddressPrefix(chainConfig.chainId) + 'valoper',
              bech32PrefixValPub: this.getAddressPrefix(chainConfig.chainId) + 'valoperpub',
              bech32PrefixConsAddr: this.getAddressPrefix(chainConfig.chainId) + 'valcons',
              bech32PrefixConsPub: this.getAddressPrefix(chainConfig.chainId) + 'valconspub'
            },
            currencies: [{
              coinDenom: chainConfig.nativeCurrency.symbol,
              coinMinimalDenom: chainConfig.nativeCurrency.symbol.toLowerCase(),
              coinDecimals: chainConfig.nativeCurrency.decimals,
            }],
            feeCurrencies: [{
              coinDenom: chainConfig.nativeCurrency.symbol,
              coinMinimalDenom: chainConfig.nativeCurrency.symbol.toLowerCase(),
              coinDecimals: chainConfig.nativeCurrency.decimals,
            }],
            stakeCurrency: {
              coinDenom: chainConfig.nativeCurrency.symbol,
              coinMinimalDenom: chainConfig.nativeCurrency.symbol.toLowerCase(),
              coinDecimals: chainConfig.nativeCurrency.decimals,
            }
          });
        } catch (suggestError) {
          console.warn('Failed to suggest chain to Keplr:', suggestError);
        }
      }

      // Enable the chain
      await this.keplr.enable(chainConfig.chainId);

      // Get the offline signer and accounts
      const offlineSigner = this.keplr.getOfflineSigner(chainConfig.chainId);
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      return {
        success: true,
        address: accounts[0].address,
        chainId: chainConfig.chainId,
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
      const key = await this.keplr.getKey(chainUID);
      return key.bech32Address;
    } catch {
      return null;
    }
  }

  async switchChain(chainConfig: ChainConfig): Promise<boolean> {
    try {
      await this.keplr.enable(chainConfig.chainId);
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

  async connect(chainConfig: ChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'MetaMask not installed' };
      }

      if (chainConfig.type !== 'evm') {
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
        chainId: chainConfig.chainId,
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

  async switchChain(chainConfig: ChainConfig): Promise<boolean> {
    try {
      const chainIdHex = `0x${parseInt(chainConfig.chainId).toString(16)}`;

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
              chainName: chainConfig.displayName,
              rpcUrls: [chainConfig.rpcUrl],
              nativeCurrency: {
                name: chainConfig.nativeCurrency.name,
                symbol: chainConfig.nativeCurrency.symbol,
                decimals: chainConfig.nativeCurrency.decimals,
              },
              blockExplorerUrls: chainConfig.explorer ? [chainConfig.explorer] : [],
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

  async connect(chainConfig: ChainConfig): Promise<WalletConnectionResult> {
    try {
      if (!this.isInstalled()) {
        return { success: false, error: 'Cosmostation wallet not installed' };
      }

      if (chainConfig.type !== 'cosmos') {
        return { success: false, error: 'Cosmostation only supports Cosmos chains' };
      }

      const account = await this.cosmostation.cosmos.request({
        method: 'cos_requestAccount',
        params: { chainName: chainConfig.chainId },
      });

      return {
        success: true,
        address: (account as {address: string}).address,
        chainId: chainConfig.chainId,
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

  async switchChain(_chainConfig: ChainConfig): Promise<boolean> {
    // Cosmostation handles chain switching automatically
    return true;
  }
}

// Wallet Adapter Factory
export class WalletAdapterFactory {
  private static adapters: Map<WalletType, WalletAdapter> = new Map();

  static {
    this.adapters.set('keplr', new KeplrAdapter());
    this.adapters.set('metamask', new MetaMaskAdapter());
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
    chainConfig: ChainConfig
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
