import { Component, h, State, Listen } from '@stencil/core';
import { walletStore } from '../../../store/wallet.store';
import { appStore } from '../../../store/app.store';

declare global {
  interface Window {
    keplr?: any;
    ethereum?: any;
    cosmostation?: any;
  }
}

@Component({
  tag: 'euclid-wallet-controller',
  shadow: true,
})
export class EuclidWalletController {
  @State() isInitialized = false;

  async componentDidLoad() {
    await this.initialize();
  }

  private async initialize() {
    // Check for available wallets on page load
    await this.detectAvailableWallets();

    // Set up wallet event listeners
    this.setupWalletEventListeners();

    this.isInitialized = true;
    console.log('🔗 Wallet Controller initialized');
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

    console.log('🔍 Available wallets detected:', availableWallets);
    return availableWallets;
  }

  private setupWalletEventListeners() {
    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', (accounts: string[]) => {
        console.log('MetaMask accounts changed:', accounts);
        this.handleEvmAccountChange(accounts);
      });

      window.ethereum.on?.('chainChanged', (chainId: string) => {
        console.log('MetaMask chain changed:', chainId);
        this.handleEvmChainChange(chainId);
      });
    }

    // Listen for Keplr events
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Keplr keystore changed');
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
    console.log('Chain changed to:', chainId);
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

  @Listen('euclidConnectWallet', { target: 'window' })
  async handleWalletConnectionRequest(event: CustomEvent<{ chainUID: string; walletType: string }>) {
    const { chainUID, walletType } = event.detail;
    console.log('🔗 Wallet connection requested:', { chainUID, walletType });

    try {
      await this.connectWallet(chainUID, walletType);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Emit connection failure event
      window.dispatchEvent(new CustomEvent('euclidWalletConnectionFailed', {
        detail: { chainUID, walletType, error: error.message }
      }));
    }
  }

  @Listen('euclidDisconnectWallet', { target: 'window' })
  handleWalletDisconnectionRequest(event: CustomEvent<{ chainUID: string }>) {
    const { chainUID } = event.detail;
    console.log('🔌 Wallet disconnection requested:', chainUID);

    walletStore.disconnectWallet(chainUID);

    // Emit disconnection success event
    window.dispatchEvent(new CustomEvent('euclidWalletDisconnected', {
      detail: { chainUID }
    }));
  }

  private async connectWallet(chainUID: string, walletType: string) {
    if (walletType === 'keplr' || walletType === 'cosmostation') {
      await this.connectCosmosWallet(chainUID, walletType);
    } else if (walletType === 'metamask') {
      await this.connectEvmWallet(chainUID, walletType);
    } else {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }

  private async connectCosmosWallet(chainUID: string, walletType: 'keplr' | 'cosmostation') {
    const wallet = walletType === 'keplr' ? window.keplr : window.cosmostation;

    if (!wallet) {
      throw new Error(`${walletType} not installed`);
    }

    try {
      // Enable the chain
      if (walletType === 'keplr') {
        await wallet.enable(chainUID);
        const offlineSigner = wallet.getOfflineSigner(chainUID);
        const accounts = await offlineSigner.getAccounts();

        if (accounts.length > 0) {
          walletStore.addWallet(chainUID, {
            address: accounts[0].address,
            chainUID,
            name: walletType,
            type: walletType,
            isConnected: true,
            balances: []
          });

          // Emit connection success event
          window.dispatchEvent(new CustomEvent('euclidWalletConnected', {
            detail: { chainUID, walletType, address: accounts[0].address }
          }));
        }
      }
    } catch (error) {
      throw new Error(`Failed to connect ${walletType}: ${error.message}`);
    }
  }

  private async connectEvmWallet(chainUID: string, walletType: 'metamask') {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        walletStore.addWallet(chainUID, {
          address: accounts[0],
          chainUID,
          name: walletType,
          type: walletType,
          isConnected: true,
          balances: []
        });

        // Emit connection success event
        window.dispatchEvent(new CustomEvent('euclidWalletConnected', {
          detail: { chainUID, walletType, address: accounts[0] }
        }));
      }
    } catch (error) {
      throw new Error(`Failed to connect MetaMask: ${error.message}`);
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
