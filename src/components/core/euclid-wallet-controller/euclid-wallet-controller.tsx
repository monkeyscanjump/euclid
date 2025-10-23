import { Component, h, State, Listen, Prop } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { marketStore } from '../../../store/market.store';
import { WalletAdapterFactory } from '../../../utils/wallet-adapter';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';
import type { EuclidConfig } from '../../../utils/env';
import { DEFAULT_CONFIG } from '../../../utils/env';
import type { EuclidChainConfig } from '../../../utils/types/api.types';
import { WalletType, isValidWalletType, isEvmWalletType, isCosmosWalletType } from '../../../utils/types/wallet.types';
import { logger } from '../../../utils/logger';

@Component({
  tag: 'euclid-wallet-controller',
})
export class EuclidWalletController {
  @State() isInitialized = false;
  @Prop() config?: string; // JSON string of EuclidConfig

  private euclidConfig: EuclidConfig;

  async componentWillLoad() {
    // Parse configuration
    this.euclidConfig = this.config ? JSON.parse(this.config) : DEFAULT_CONFIG;
  }

  async componentDidLoad() {
    await this.initialize();
  }

  private async initialize() {
    logger.info('WalletController', 'Initializing Wallet Controller...');

    // FIRST: Initialize wallet store (loads from IndexedDB)
    await walletStore.initialize();

    // Check for available wallets on page load
    await this.detectAvailableWallets();

    // Set up wallet event listeners
    this.setupWalletEventListeners();

    this.isInitialized = true;
    logger.info('WalletController', 'Wallet Controller initialized');
  }

  private async detectAvailableWallets() {
    const availableWallets = [];

    // Check for Keplr (Cosmos wallets)
    if (window.keplr) {
      availableWallets.push('keplr');
    }

    // Check for MetaMask (EVM wallets)
    if (window.ethereum?.isMetaMask) {
      availableWallets.push('metamask');
    }

    // Check for Cosmostation
    if (window.cosmostation) {
      availableWallets.push('cosmostation');
    }

    logger.info('Component', '🔍 Available wallets detected:', availableWallets);
    return availableWallets;
  }

  private setupWalletEventListeners() {
    // Listen for MetaMask account changes
    if (window.ethereum) {
      // MetaMask's ethereum object has event emitter methods not defined in our interface
      const ethProvider = window.ethereum as typeof window.ethereum & {
        on?: (event: string, callback: (...args: unknown[]) => void) => void;
      };

      if (ethProvider.on) {
        ethProvider.on('accountsChanged', (accounts: string[]) => {
          logger.info('Component', 'MetaMask accounts changed:', accounts);
          this.handleEvmAccountChange(accounts);
        });

        ethProvider.on('chainChanged', (chainId: string) => {
          logger.info('Component', 'MetaMask chain changed:', chainId);
          this.handleEvmChainChange(chainId);
        });
      }
    }

    // Listen for Keplr events
    window.addEventListener('keplr_keystorechange', () => {
      logger.info('Component', 'Keplr keystore changed');
      this.handleKeplrKeystoreChange();
    });
  }

  private async handleEvmAccountChange(accounts: string[]) {
    if (accounts.length === 0) {
      // User disconnected
      this.disconnectEvmWallets();
    } else {
      // Update connected EVM accounts
      // TODO: Update all EVM chain wallets with new account
    }
  }

  private handleEvmChainChange(chainId: string) {
    // Handle EVM chain changes
    logger.info('Component', 'Chain changed to:', chainId);
    // TODO: Update wallet store with new chain info
  }

  private handleKeplrKeystoreChange() {
    // Handle Keplr keystore changes (account switches, etc.)
    // TODO: Update all Cosmos chain wallets
  }

  private disconnectEvmWallets() {
    // Disconnect all EVM wallets
    const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'manta', 'sepolia'];
    evmChains.forEach(chainUID => {
      walletStore.removeWallet(chainUID);
    });
  }

  @Listen(EUCLID_EVENTS.WALLET.CONNECT_REQUEST, { target: 'window' })
  async handleWalletConnectionRequest(event: CustomEvent<{ chainUID: string; walletType: string }>) {
    const { chainUID, walletType } = event.detail;
    logger.info('Component', '🎯 Wallet controller received connection request:', { chainUID, walletType });

    try {
      logger.info('Component', '🔄 Attempting to connect wallet...');
      await this.connectWallet(chainUID, walletType);
      logger.info('Component', '✅ Wallet connection successful!');
    } catch (error) {
      logger.error('Component', '❌ Failed to connect wallet:', error);
      // Emit connection failure event
      dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_FAILED, {
        chainUID,
        walletType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  @Listen(EUCLID_EVENTS.WALLET.DISCONNECT_REQUEST, { target: 'window' })
  handleWalletDisconnectionRequest(event: CustomEvent<{ chainUID: string }>) {
    const { chainUID } = event.detail;
    logger.info('Component', '🔌 Wallet disconnection requested:', chainUID);

    walletStore.disconnectWallet(chainUID);

    // Emit disconnection success event
    dispatchEuclidEvent(EUCLID_EVENTS.WALLET.DISCONNECT_SUCCESS, { chainUID });
  }

  private async connectWallet(chainUID: string, walletType: string) {
    logger.info('Component', '🔗 connectWallet called with:', { chainUID, walletType });

    // Get chain configuration from store, or use fallback
    let chainConfig = marketStore.getChain(chainUID);

    if (!chainConfig) {
      logger.warn('Component', `Chain ${chainUID} not found in store, using fallback configuration`);
      chainConfig = this.getFallbackChainConfig(chainUID, walletType);

      if (!chainConfig) {
        throw new Error(`Chain configuration not found for ${chainUID} and no fallback available`);
      }
    }

    logger.info('Component', '🔗 Using chain config:', chainConfig);

    // Validate wallet type using helper function - NO MORE HARDCODED ARRAYS!
    if (!isValidWalletType(walletType)) {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    logger.info('Component', '✅ Wallet type validation passed');    // Use the wallet adapter factory for proper separation of concerns
    logger.info('Component', '🔗 Calling WalletAdapterFactory.connectWallet...');
    const result = await WalletAdapterFactory.connectWallet(walletType as WalletType, chainConfig);

    logger.info('Component', '🔗 Wallet adapter result:', result);

    if (result.success && result.address) {
      logger.info('Component', '✅ Connection successful, adding to store...');

      // Add wallet to store
      walletStore.addWallet(chainUID, {
        address: result.address,
        name: walletType,
        walletType: walletType as WalletType,
        balances: [],
        autoConnect: false // Default auto-connect to OFF for new wallets
      });

      logger.info('Component', '📡 Emitting connection success event...');

      // Emit connection success event
      dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_SUCCESS, {
        chainUID,
        walletType,
        address: result.address
      });
    } else {
      logger.error('Component', '❌ Wallet connection failed:', result.error);
      throw new Error(result.error || 'Failed to connect wallet');
    }
  }

  private getFallbackChainConfig(chainUID: string, walletType: string): EuclidChainConfig | null {
    // Fallback configurations for common chains when market data isn't loaded yet
    const fallbackConfigs: Record<string, EuclidChainConfig> = {
      'ethereum': {
        chain_uid: 'ethereum',
        chain_id: '1',
        display_name: 'Ethereum',
        type: 'EVM',
        explorer_url: 'https://etherscan.io',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      },
      'bsc': {
        chain_uid: 'bsc',
        chain_id: '56',
        display_name: 'BNB Smart Chain',
        type: 'EVM',
        explorer_url: 'https://bscscan.com',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      },
      'polygon': {
        chain_uid: 'polygon',
        chain_id: '137',
        display_name: 'Polygon',
        type: 'EVM',
        explorer_url: 'https://polygonscan.com',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      },
      'arbitrum': {
        chain_uid: 'arbitrum',
        chain_id: '42161',
        display_name: 'Arbitrum One',
        type: 'EVM',
        explorer_url: 'https://arbiscan.io',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      },
      'cosmoshub-4': {
        chain_uid: 'cosmoshub-4',
        chain_id: 'cosmoshub-4',
        display_name: 'Cosmos Hub',
        type: 'Cosmwasm',
        explorer_url: 'https://mintscan.io/cosmos',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      },
      'osmosis-1': {
        chain_uid: 'osmosis-1',
        chain_id: 'osmosis-1',
        display_name: 'Osmosis',
        type: 'Cosmwasm',
        explorer_url: 'https://mintscan.io/osmosis',
        factory_address: '',
        token_factory_address: '',
        logo: ''
      }
    };

    const config = fallbackConfigs[chainUID];
    if (!config) {
      return null;
    }

    // Validate that the wallet type is compatible with the chain - USE HELPER FUNCTIONS!
    const isEvmWallet = isEvmWalletType(walletType);
    const isCosmosWallet = isCosmosWalletType(walletType);

    if (config.type === 'EVM' && !isEvmWallet) {
      return null;
    }

    if (config.type === 'Cosmwasm' && !isCosmosWallet) {
      return null;
    }

    return config;
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
