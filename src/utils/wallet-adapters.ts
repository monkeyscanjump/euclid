/**
 * Wallet Adapters for Euclid Protocol
 * Unified interface for different wallet providers
 */

import { WalletType, CoreWalletType, CORE_WALLET_TYPES } from './types/wallet.types';
import { logger } from './logger';

// Type aliases for methods that need these types (TODO: Replace with proper types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionResponse = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EuclidChainConfig = any;

/**
 * Base wallet adapter interface
 */
export interface WalletAdapter {
  type: WalletType;
  isAvailable(): boolean;
  connect(chainId?: string): Promise<{ address: string; chainId: string }>;
  disconnect(): Promise<void>;
}

/**
 * MetaMask wallet adapter for EVM chains
 */
export class MetaMaskAdapter implements WalletAdapter {
  type = 'metamask' as const;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
  }

  async connect(chainId?: string): Promise<{ address: string; chainId: string }> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get current chain ID
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      }) as string;

      // Switch to requested chain if provided
      if (chainId && chainId !== currentChainId) {
        await this.switchChain(chainId);
      }

      return {
        address: accounts[0],
        chainId: chainId || currentChainId
      };
    } catch (error) {
      throw new Error(`Failed to connect MetaMask: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    // MetaMask doesn't have a disconnect method, this is handled by the wallet
    logger.info('MetaMaskAdapter', 'MetaMask disconnect requested');
  }

  async getCurrentAccount(): Promise<{ address: string; chainId: string; name?: string } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Get current accounts without prompting
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        return null;
      }

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      }) as string;

      // Try to get wallet name from extension
      let walletName: string | undefined;
      try {
        // For MetaMask, we know it's MetaMask if isMetaMask is true
        walletName = window.ethereum.isMetaMask ? 'MetaMask' : 'EVM Wallet';
      } catch {
        // Fallback to generic name
        walletName = 'MetaMask';
      }

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16).toString(),
        name: walletName
      };
    } catch (error) {
      logger.warn('MetaMaskAdapter', 'Failed to get current MetaMask account', error);
      return null;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not available');
    }

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      }) as string;

      return balance;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async signAndBroadcast(transaction: TransactionResponse): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not available');
    }

    if (transaction.type !== 'evm') {
      throw new Error('MetaMask can only handle EVM transactions');
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: transaction.msgs.map(msg => ({
          from: transaction.sender.address,
          to: msg.to,
          data: msg.data,
          value: msg.value,
          gasLimit: msg.gasLimit
        }))
      }) as string;

      return txHash;
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  async switchChain(chainId: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not available');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (error) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        throw new Error('Chain not added to MetaMask. Please add the chain first.');
      }
      throw new Error(`Failed to switch chain: ${error.message}`);
    }
  }

  async addChain(config: EuclidChainConfig): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not available');
    }

    if (config.type !== 'EVM') {
      throw new Error('MetaMask only supports EVM chains');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: config.chain_id,
          chainName: config.display_name,
          nativeCurrency: {
            name: 'ETH', // This should come from chain config
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: [config.explorer_url], // This should be RPC URL
          blockExplorerUrls: [config.explorer_url]
        }]
      });
    } catch (error) {
      throw new Error(`Failed to add chain: ${error.message}`);
    }
  }
}

/**
 * Keplr wallet adapter for Cosmos chains
 */
export class KeplrAdapter implements WalletAdapter {
  type = 'keplr' as const;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.keplr);
  }

  async connect(chainId?: string): Promise<{ address: string; chainId: string }> {
    if (!this.isAvailable()) {
      throw new Error('Keplr is not installed');
    }

    try {
      const defaultChainId = chainId || 'cosmoshub-4';

      // Enable the chain
      await window.keplr.enable(defaultChainId);

      // Get the offline signer
      const offlineSigner = window.keplr.getOfflineSigner(defaultChainId) as {
        getAccounts: () => Promise<Array<{ address: string }>>;
      };
      const accounts = await offlineSigner.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      return {
        address: accounts[0].address,
        chainId: defaultChainId
      };
    } catch (error) {
      throw new Error(`Failed to connect Keplr: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    // Keplr doesn't have a disconnect method
    logger.info('KeplrAdapter', 'Keplr disconnect requested');
  }

  async getCurrentAccount(): Promise<{ address: string; chainId: string; name?: string } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Try to get current account for the default chain WITHOUT PROMPTING
      const defaultChainId = 'cosmoshub-4';

      // DO NOT CALL enable() - it prompts the user!
      // Only check if we already have access

      const offlineSigner = window.keplr.getOfflineSigner(defaultChainId) as {
        getAccounts: () => Promise<Array<{ address: string; name?: string }>>;
      };

      const accounts = await offlineSigner.getAccounts();
      if (!accounts || accounts.length === 0) {
        return null;
      }

      // Try to get wallet name
      let walletName: string | undefined;
      try {
        walletName = accounts[0].name || 'Keplr Wallet';
      } catch {
        walletName = 'Keplr Wallet';
      }

      return {
        address: accounts[0].address,
        chainId: defaultChainId,
        name: walletName
      };
    } catch (error) {
      logger.warn('Utils', 'Failed to get current Keplr account:', error);
      return null;
    }
  }

  async getBalance(_address: string): Promise<string> {
    // This would require a Cosmos LCD client
    throw new Error('Balance checking not implemented for Keplr');
  }

  async signAndBroadcast(transaction: TransactionResponse): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Keplr is not available');
    }

    if (transaction.type !== 'cosmwasm') {
      throw new Error('Keplr can only handle CosmWasm transactions');
    }

    try {
      // This is a simplified implementation
      // In reality, you'd need to use StargateClient or similar

      // This would need proper Cosmos transaction building
      throw new Error('CosmWasm transaction signing not fully implemented');
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  async switchChain(chainId: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Keplr is not available');
    }

    try {
      await window.keplr.enable(chainId);
    } catch (error) {
      throw new Error(`Failed to switch to chain ${chainId}: ${error.message}`);
    }
  }

  async addChain(config: EuclidChainConfig): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Keplr is not available');
    }

    if (config.type !== 'Cosmwasm') {
      throw new Error('Keplr only supports Cosmos chains');
    }

    try {
      await window.keplr.experimentalSuggestChain({
        chainId: config.chain_id,
        chainName: config.display_name,
        rpc: config.explorer_url, // This should be RPC URL
        rest: config.explorer_url, // This should be REST URL
        bip44: {
          coinType: 118
        },
        bech32Config: {
          bech32PrefixAccAddr: 'cosmos',
          bech32PrefixAccPub: 'cosmospub',
          bech32PrefixValAddr: 'cosmosvaloper',
          bech32PrefixValPub: 'cosmosvaloperpub',
          bech32PrefixConsAddr: 'cosmosvalcons',
          bech32PrefixConsPub: 'cosmosvalconspub'
        },
        currencies: [{
          coinDenom: 'ATOM',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6
        }],
        feeCurrencies: [{
          coinDenom: 'ATOM',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6
        }],
        stakeCurrency: {
          coinDenom: 'ATOM',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6
        }
      });
    } catch (error) {
      throw new Error(`Failed to add chain: ${error.message}`);
    }
  }
}

/**
 * Phantom wallet adapter for Solana chains
 */
export class PhantomAdapter implements WalletAdapter {
  type = 'phantom' as const;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.solana?.isPhantom);
  }

  async connect(chainId?: string): Promise<{ address: string; chainId: string }> {
    if (!this.isAvailable()) {
      throw new Error('Phantom is not installed');
    }

    try {
      const resp = await window.solana.connect();

      return {
        address: resp.publicKey.toString(),
        chainId: chainId || 'mainnet-beta'
      };
    } catch (error) {
      throw new Error(`Failed to connect Phantom: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isAvailable()) {
      await window.solana.disconnect();
    }
  }

  async getCurrentAccount(): Promise<{ address: string; chainId: string; name?: string } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // For Phantom, if already connected, this should return the current connection
      const response = await window.solana.connect();
      if (!response?.publicKey) {
        return null;
      }

      // For Solana, chainId is typically 'mainnet-beta' or 'devnet'
      const chainId = 'solana-mainnet';

      // Try to get wallet name
      let walletName: string | undefined;
      try {
        walletName = window.solana.isPhantom ? 'Phantom' : 'Solana Wallet';
      } catch {
        walletName = 'Phantom';
      }

      return {
        address: response.publicKey.toString(),
        chainId,
        name: walletName
      };
    } catch {
      // User probably not connected
      return null;
    }
  }

  async getBalance(_address: string): Promise<string> {
    // This would require a Solana connection
    throw new Error('Balance checking not implemented for Phantom');
  }

  async signAndBroadcast(_transaction: TransactionResponse): Promise<string> {
    throw new Error('Solana transaction signing not implemented');
  }

  async switchChain(chainId: string): Promise<void> {
    // Phantom doesn't support multiple chains
    logger.info('Utils', `Chain switching not supported by Phantom: ${chainId}`);
  }

  async addChain(_config: EuclidChainConfig): Promise<void> {
    // Phantom doesn't support adding chains
    throw new Error('Adding chains not supported by Phantom');
  }
}

/**
 * Wallet adapter factory
 */
export class WalletAdapterFactory {
  private adapters: Map<string, WalletAdapter> = new Map();

  constructor() {
    // Register available adapters
    this.adapters.set('metamask', new MetaMaskAdapter());
    this.adapters.set('keplr', new KeplrAdapter());
    this.adapters.set('phantom', new PhantomAdapter());
  }

  getAdapter(type: WalletType): WalletAdapter {
    // Map additional types to existing adapters for now
    let adapterType = type;
    if (type === 'cosmostation') adapterType = 'keplr'; // Cosmostation uses similar interface to Keplr
    if (type === 'walletconnect') adapterType = 'metamask'; // WalletConnect for EVM
    if (type === 'custom') adapterType = 'metamask'; // Default to MetaMask for custom wallets

    const adapter = this.adapters.get(adapterType as CoreWalletType);
    if (!adapter) {
      throw new Error(`Wallet adapter not found for type: ${type}`);
    }
    return adapter;
  }

  getAvailableAdapters(): WalletAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
  }

  getAvailableWalletTypes(): CoreWalletType[] {
    return this.getAvailableAdapters()
      .map(adapter => adapter.type)
      .filter((type): type is CoreWalletType =>
        CORE_WALLET_TYPES.includes(type as CoreWalletType)
      );
  }
}

// Export default factory instance
export const walletAdapterFactory = new WalletAdapterFactory();
