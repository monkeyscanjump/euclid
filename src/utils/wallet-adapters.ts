/**
 * Wallet Adapters for Euclid Protocol
 * Unified interface for different wallet providers
 */

import type { WalletAdapter } from './types/euclid-api.types';
import type { EuclidChainConfig, TransactionResponse } from './types/api.types';

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
    console.log('MetaMask disconnect requested');
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
    console.log('Keplr disconnect requested');
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

  async getBalance(_address: string): Promise<string> {
    // This would require a Solana connection
    throw new Error('Balance checking not implemented for Phantom');
  }

  async signAndBroadcast(_transaction: TransactionResponse): Promise<string> {
    throw new Error('Solana transaction signing not implemented');
  }

  async switchChain(chainId: string): Promise<void> {
    // Phantom doesn't support multiple chains
    console.log(`Chain switching not supported by Phantom: ${chainId}`);
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

  getAdapter(type: 'metamask' | 'keplr' | 'phantom' | 'cosmostation' | 'walletconnect' | 'custom'): WalletAdapter {
    // Map additional types to existing adapters for now
    let adapterType = type;
    if (type === 'cosmostation') adapterType = 'keplr'; // Cosmostation uses similar interface to Keplr
    if (type === 'walletconnect') adapterType = 'metamask'; // WalletConnect for EVM
    if (type === 'custom') adapterType = 'metamask'; // Default to MetaMask for custom wallets

    const adapter = this.adapters.get(adapterType);
    if (!adapter) {
      throw new Error(`Unsupported wallet type: ${type}`);
    }
    return adapter;
  }

  getAvailableAdapters(): WalletAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
  }

  getAvailableWalletTypes(): ('metamask' | 'keplr' | 'phantom')[] {
    return this.getAvailableAdapters().map(adapter => adapter.type);
  }
}

// Export default factory instance
export const walletAdapterFactory = new WalletAdapterFactory();
